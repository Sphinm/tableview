import * as duckdb from '@duckdb/duckdb-wasm';
import { EngineLoadError } from './engineError';
// NOTE: `xlsx` (SheetJS, ~400 kB) is intentionally NOT imported at module scope.
// It is loaded on demand inside the Excel code paths only — see loadFileIntoDuckDB
// and exportToExcel. A top-level import here would drag it into the main bundle
// for every visitor, including those who only use the finance calculators.

let db: duckdb.AsyncDuckDB | null = null;
let conn: duckdb.AsyncDuckDBConnection | null = null;
let initPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

export interface ColumnSchema {
  name: string;
  type: string;
}

export interface TableQueryResult {
  columns: ColumnSchema[];
  rows: Record<string, any>[];
  totalRows: number;
  executionTimeMs: number;
}

/** Give up on a slow CDN rather than leaving the user on a spinner forever. */
const BUNDLE_FETCH_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out after ${Math.round(ms / 1000)}s while loading ${label}`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Secondary CDN, used when jsDelivr is unreachable. jsDelivr is blocked on some
 * corporate networks and is unreliable from mainland China, which is exactly
 * where a silent failure looks like "your file is corrupted".
 */
function getUnpkgBundles(): duckdb.DuckDBBundles {
  const base = 'https://unpkg.com/@duckdb/duckdb-wasm@1.29.0/dist';
  return {
    mvp: {
      mainModule: `${base}/duckdb-mvp.wasm`,
      mainWorker: `${base}/duckdb-browser-mvp.worker.js`,
    },
    eh: {
      mainModule: `${base}/duckdb-eh.wasm`,
      mainWorker: `${base}/duckdb-browser-eh.worker.js`,
    },
  };
}

async function instantiateFrom(bundles: duckdb.DuckDBBundles): Promise<duckdb.AsyncDuckDB> {
  const bundle = await duckdb.selectBundle(bundles);

  if (!bundle.mainWorker) {
    throw new Error('No compatible DuckDB worker bundle for this browser');
  }

  // Blob worker avoids Cross-Origin Worker restrictions on the CDN script.
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
  );

  try {
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
    const newDb = new duckdb.AsyncDuckDB(logger, worker);
    await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
    return newDb;
  } finally {
    URL.revokeObjectURL(workerUrl);
  }
}

/**
 * Initialize DuckDB-Wasm, falling back to a second CDN if the first is blocked.
 */
export async function getDuckDB(): Promise<{ db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection }> {
  if (db && conn) {
    return { db, conn };
  }

  if (initPromise) {
    const activeConn = await initPromise;
    return { db: db!, conn: activeConn };
  }

  initPromise = (async () => {
    const sources: { name: string; bundles: duckdb.DuckDBBundles }[] = [
      { name: 'jsDelivr', bundles: duckdb.getJsDelivrBundles() },
      { name: 'unpkg', bundles: getUnpkgBundles() },
    ];

    const failures: string[] = [];

    for (const source of sources) {
      try {
        const newDb = await withTimeout(
          instantiateFrom(source.bundles),
          BUNDLE_FETCH_TIMEOUT_MS,
          `the DuckDB engine from ${source.name}`
        );
        const newConn = await newDb.connect();
        db = newDb;
        conn = newConn;
        return newConn;
      } catch (error) {
        failures.push(`${source.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Reset so a later retry can start clean rather than awaiting a dead promise.
    initPromise = null;

    throw new EngineLoadError(
      `Could not download the in-browser SQL engine. ${failures.join(' | ')}`,
      failures
    );
  })();

  const activeConn = await initPromise;
  return { db: db!, conn: activeConn };
}

/**
 * Register a user-selected file into the DuckDB virtual filesystem
 */
export interface SheetTable {
  /** Original worksheet name as it appears in the user's workbook. */
  name: string;
  /** Sanitized table name registered in the DuckDB virtual filesystem. */
  tableName: string;
}

export async function loadFileIntoDuckDB(file: File): Promise<{
  tableName: string;
  fileType: 'parquet' | 'csv' | 'json';
  /** Present for Excel workbooks: every readable worksheet, not just the first. */
  sheets?: SheetTable[];
}> {
  const { db } = await getDuckDB();

  // Sanitize filename for SQL
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const buffer = new Uint8Array(await file.arrayBuffer());

  await db.registerFileBuffer(cleanName, buffer);

  const lowerName = cleanName.toLowerCase();
  let fileType: 'parquet' | 'csv' | 'json' = 'parquet';

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    // Lazy-load SheetJS — only Excel users pay for this parser.
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const baseName = cleanName.replace(/\.[^/.]+$/, '');

    const sheets: SheetTable[] = [];
    const sheetNames = workbook.SheetNames || [];

    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      // A worksheet with no cells at all would make DuckDB's CSV sniffer fail.
      if (!csvContent.trim()) continue;

      const safeSheet = sheetName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || `sheet${i + 1}`;
      const csvFileName = `${baseName}__${i + 1}_${safeSheet}.csv`;
      await db.registerFileBuffer(csvFileName, new TextEncoder().encode(csvContent));
      sheets.push({ name: sheetName, tableName: csvFileName });
    }

    if (sheets.length === 0) {
      throw new Error('This workbook contains no readable worksheets with data');
    }

    return { tableName: sheets[0].tableName, fileType: 'csv', sheets };
  } else if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
    fileType = 'csv';
  } else if (lowerName.endsWith('.json') || lowerName.endsWith('.jsonl') || lowerName.endsWith('.ndjson')) {
    fileType = 'json';
  }

  return { tableName: cleanName, fileType };
}

/**
 * Read a file registered in DuckDB virtual filesystem as UTF-8 text.
 */
export async function getFileContentAsText(tableName: string, maxBytes?: number): Promise<string> {
  const { db } = await getDuckDB();
  const buffer = await db.copyFileToBuffer(tableName);
  const slice = maxBytes && buffer.length > maxBytes ? buffer.subarray(0, maxBytes) : buffer;
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(slice);
}

/**
 * Safely parse JSON or JSON Lines (NDJSON) content into JavaScript object/array
 */
export function parseJsonContent(text: string): any {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    // If standard JSON.parse fails, attempt parsing as JSON Lines (NDJSON)
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      try {
        return lines.map(line => JSON.parse(line));
      } catch {
        throw err;
      }
    }
    throw err;
  }
}

export type SamplePreset = 'ecommerce' | 'financial' | 'telemetry';

/**
 * Generate in-browser sample parquet dataset with multiple industry scenarios
 */
export async function generateSampleParquet(
  preset: SamplePreset = 'ecommerce'
): Promise<{ tableName: string; fileType: 'parquet' }> {
  const { conn } = await getDuckDB();

  if (preset === 'financial') {
    const sampleName = 'sample_financial_trades.parquet';
    await conn.query(`
      COPY (
        SELECT
          'TRD-' || lpad(cast(i as varchar), 6, '0') AS trade_id,
          strftime(TIMESTAMP '2026-09-08 09:30:00' + INTERVAL (i * 12) SECOND, '%Y-%m-%d %H:%M:%S.%f') AS trade_timestamp,
          ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'META', 'BRK.B'][CAST(floor(random() * 8) + 1 AS INT)] AS ticker,
          ['BUY', 'SELL'][CAST(floor(random() * 2) + 1 AS INT)] AS side,
          ROUND(CAST(120 + (random() * 680) AS numeric), 2) AS execution_price,
          CAST(floor(random() * 200 + 1) * 10 AS INT) AS shares,
          ['NASDAQ', 'NYSE', 'ARCA', 'BATS', 'IEX'][CAST(floor(random() * 5) + 1 AS INT)] AS venue,
          ROUND(CAST(0.01 + (random() * 0.08) AS numeric), 4) AS bid_ask_spread,
          ROUND(CAST(0.25 + (random() * 1.5) AS numeric), 2) AS commission_usd
        FROM range(1, 1001) t(i)
      ) TO '${sampleName}' (FORMAT PARQUET);
    `);
    return { tableName: sampleName, fileType: 'parquet' };
  }

  if (preset === 'telemetry') {
    const sampleName = 'sample_server_telemetry.parquet';
    await conn.query(`
      COPY (
        SELECT
          'req_' || hex(md5(cast(i as varchar))) AS request_id,
          strftime(TIMESTAMP '2026-09-09 00:00:00' + INTERVAL (i * 85) SECOND, '%Y-%m-%d %H:%M:%S') AS timestamp,
          '192.168.' || CAST(floor(random() * 254) + 1 AS INT) || '.' || CAST(floor(random() * 254) + 1 AS INT) AS client_ip,
          ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][CAST(floor(random() * 5) + 1 AS INT)] AS http_method,
          ['/api/v1/auth', '/api/v1/users', '/api/v2/orders', '/api/v1/reports', '/healthz', '/metrics'][CAST(floor(random() * 6) + 1 AS INT)] AS endpoint,
          CASE 
            WHEN i % 19 = 0 THEN 500
            WHEN i % 13 = 0 THEN 404
            WHEN i % 7 = 0 THEN 304
            ELSE 200
          END AS status_code,
          ROUND(CAST(8 + (random() * 320) AS numeric), 1) AS latency_ms,
          ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'][CAST(floor(random() * 4) + 1 AS INT)] AS region
        FROM range(1, 1001) t(i)
      ) TO '${sampleName}' (FORMAT PARQUET);
    `);
    return { tableName: sampleName, fileType: 'parquet' };
  }

  // Default: E-commerce
  const sampleName = 'sample_ecommerce_orders.parquet';
  await conn.query(`
    COPY (
      SELECT
        1000 + i AS order_id,
        'cust_' || lpad(cast((i * 17) % 350 + 1 as varchar), 4, '0') AS customer_id,
        strftime(TIMESTAMP '2026-03-01 08:00:00' + INTERVAL (i * 1800) SECOND, '%Y-%m-%d %H:%M:%S') AS order_time,
        ROUND(CAST(15 + (random() * 450) AS numeric), 2) AS amount_usd,
        ['USD', 'EUR', 'GBP', 'CAD'][CAST(floor(random() * 4) + 1 AS INT)] AS currency,
        CASE 
          WHEN i % 9 = 0 THEN 'REFUNDED'
          WHEN i % 11 = 0 THEN 'CANCELLED'
          ELSE 'COMPLETED'
        END AS order_status,
        ['Stripe', 'PayPal', 'ApplePay', 'ShopifyPayments'][CAST(floor(random() * 4) + 1 AS INT)] AS payment_gateway,
        ['Electronics', 'Apparel', 'Home & Kitchen', 'Digital SaaS', 'Books'][CAST(floor(random() * 5) + 1 AS INT)] AS product_category,
        CAST(floor(random() * 4) + 1 AS INT) AS item_quantity,
        (i % 4 = 0) AS is_first_purchase
      FROM range(1, 1001) t(i)
    ) TO '${sampleName}' (FORMAT PARQUET);
  `);

  return { tableName: sampleName, fileType: 'parquet' };
}

/**
 * Export and download any virtual file from DuckDB filesystem as a native file
 */
export async function exportParquetFile(tableName: string, downloadName?: string): Promise<void> {
  const { db } = await getDuckDB();
  const buffer = await db.copyFileToBuffer(tableName);
  const blob = new Blob([buffer as any], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName || tableName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a sample dataset in memory and trigger an immediate download for the user
 */
export async function downloadSampleParquet(preset: SamplePreset = 'ecommerce'): Promise<void> {
  const res = await generateSampleParquet(preset);
  await exportParquetFile(res.tableName);
}

/**
 * Recursively sanitize BigInt and complex values so they can be safely serialized,
 * rendered in React, and exported without BigInt TypeErrors.
 */
export function sanitizeRowValues(val: any): any {
  if (val === null || val === undefined) {
    return val;
  }
  if (typeof val === 'bigint') {
    return val <= Number.MAX_SAFE_INTEGER && val >= Number.MIN_SAFE_INTEGER
      ? Number(val)
      : val.toString();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeRowValues);
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'object') {
    const clean: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      clean[k] = sanitizeRowValues(val[k]);
    }
    return clean;
  }
  return val;
}

/**
 * Polyfill BigInt.prototype.toJSON defensively
 */
if (typeof (BigInt.prototype as any).toJSON !== 'function') {
  (BigInt.prototype as any).toJSON = function () {
    return this <= Number.MAX_SAFE_INTEGER && this >= Number.MIN_SAFE_INTEGER
      ? Number(this)
      : this.toString();
  };
}

/**
 * Query data with pagination and sorting
 */
export async function queryTable(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json',
  page: number = 0,
  pageSize: number = 50,
  filterSql?: string,
  sortCol?: string,
  sortAsc: boolean = true
): Promise<TableQueryResult> {
  const { conn } = await getDuckDB();
  const startTime = performance.now();

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') {
    scanExpr = `parquet_scan('${tableName}')`;
  } else if (fileType === 'csv') {
    scanExpr = `read_csv_auto('${tableName}')`;
  } else if (fileType === 'json') {
    scanExpr = `read_json_auto('${tableName}')`;
  }

  // Count total rows
  let countQuery = `SELECT count(*) as total FROM ${scanExpr}`;
  if (filterSql && filterSql.trim()) {
    countQuery += ` WHERE ${filterSql}`;
  }

  const countRes = await conn.query(countQuery);
  const totalRows = Number(countRes.toArray()[0].total);

  // Build pagination query
  let dataQuery = `SELECT * FROM ${scanExpr}`;
  if (filterSql && filterSql.trim()) {
    dataQuery += ` WHERE ${filterSql}`;
  }

  if (sortCol) {
    dataQuery += ` ORDER BY "${sortCol.replace(/"/g, '""')}" ${sortAsc ? 'ASC' : 'DESC'}`;
  }

  dataQuery += ` LIMIT ${pageSize} OFFSET ${page * pageSize};`;

  const dataRes = await conn.query(dataQuery);
  const executionTimeMs = Math.round(performance.now() - startTime);

  // Extract columns and types
  const columns: ColumnSchema[] = dataRes.schema.fields.map(f => ({
    name: f.name,
    type: f.type.toString()
  }));

  // Parse Arrow records to clean JS objects with recursive BigInt sanitation
  const rows = dataRes.toArray().map(row => sanitizeRowValues(row.toJSON()));

  return {
    columns,
    rows,
    totalRows,
    executionTimeMs
  };
}

/**
 * Execute arbitrary user SQL query
 */
export async function runCustomSql(sql: string): Promise<TableQueryResult> {
  const { conn } = await getDuckDB();
  const startTime = performance.now();

  const dataRes = await conn.query(sql);
  const executionTimeMs = Math.round(performance.now() - startTime);

  const columns: ColumnSchema[] = dataRes.schema.fields.map(f => ({
    name: f.name,
    type: f.type.toString()
  }));

  // Parse Arrow records with recursive BigInt sanitation
  const rows = dataRes.toArray().map(row => sanitizeRowValues(row.toJSON()));

  return {
    columns,
    rows,
    totalRows: rows.length,
    executionTimeMs
  };
}

/**
 * Export full table or filtered data to CSV
 */
export async function exportToCsv(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json',
  customFilter?: string
): Promise<void> {
  const { conn, db } = await getDuckDB();
  const tempCsvName = `export_${Date.now()}.csv`;

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
  else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
  else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

  let query = `COPY (SELECT * FROM ${scanExpr}`;
  if (customFilter && customFilter.trim()) {
    query += ` WHERE ${customFilter}`;
  }
  query += `) TO '${tempCsvName}' (HEADER, DELIMITER ',');`;

  await conn.query(query);

  const buffer = await db.copyFileToBuffer(tempCsvName);
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${tableName.replace(/\.[^/.]+$/, '')}_exported.csv`);
}

/**
 * Export table data to native Excel (.xlsx) using SheetJS
 */
export async function exportToExcel(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json',
  limitRows: number = 50000,
  customFilter?: string
): Promise<void> {
  const { conn } = await getDuckDB();

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
  else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
  else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

  let query = `SELECT * FROM ${scanExpr}`;
  if (customFilter && customFilter.trim()) {
    query += ` WHERE ${customFilter}`;
  }
  query += ` LIMIT ${limitRows};`;

  const dataRes = await conn.query(query);
  const rows = dataRes.toArray().map(row => {
    const clean = sanitizeRowValues(row.toJSON());
    // For Excel cells, ensure nested objects/arrays are serialized to clean JSON strings
    const excelRow: Record<string, any> = {};
    for (const k of Object.keys(clean)) {
      const v = clean[k];
      excelRow[k] = v !== null && typeof v === 'object' ? JSON.stringify(v) : v;
    }
    return excelRow;
  });

  // Lazy-load SheetJS only when the user actually exports to Excel.
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  triggerDownload(blob, `${tableName.replace(/\.[^/.]+$/, '')}_exported.xlsx`);
}

/**
 * Export table data to JSON format
 */
export async function exportToJson(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json',
  limitRows: number = 50000
): Promise<void> {
  const { conn } = await getDuckDB();

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
  else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
  else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

  const query = `SELECT * FROM ${scanExpr} LIMIT ${limitRows};`;
  const dataRes = await conn.query(query);
  const rows = dataRes.toArray().map(row => sanitizeRowValues(row.toJSON()));

  const jsonStr = JSON.stringify(rows, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, `${tableName.replace(/\.[^/.]+$/, '')}_exported.json`);
}

/**
 * Export table data to Apache Parquet format (.parquet)
 */
export async function exportToParquet(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json',
  compression: 'ZSTD' | 'SNAPPY' | 'GZIP' | 'UNCOMPRESSED' = 'ZSTD',
  customFilter?: string
): Promise<void> {
  const { conn, db } = await getDuckDB();
  const tempParquetName = `export_${Date.now()}.parquet`;

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
  else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
  else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

  let query = `COPY (SELECT * FROM ${scanExpr}`;
  if (customFilter && customFilter.trim()) {
    query += ` WHERE ${customFilter}`;
  }
  query += `) TO '${tempParquetName}' (FORMAT PARQUET, COMPRESSION '${compression}');`;

  await conn.query(query);

  const buffer = await db.copyFileToBuffer(tempParquetName);
  const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  triggerDownload(blob, `${tableName.replace(/\.[^/.]+$/, '')}_converted_${compression.toLowerCase()}.parquet`);
}

export interface ColumnSummary {
  columnName: string;
  columnType: string;
  min: string;
  max: string;
  approxUnique: string;
  avg: string;
  std: string;
  q25: string;
  q50: string;
  q75: string;
  count: string;
  nullPercentage: string;
}

/**
 * Run DuckDB's in-engine analytical profiling (SUMMARIZE) on the dataset
 */
export async function summarizeTable(
  tableName: string,
  fileType: 'parquet' | 'csv' | 'json'
): Promise<ColumnSummary[]> {
  const { conn } = await getDuckDB();

  let scanExpr = `'${tableName}'`;
  if (fileType === 'parquet') scanExpr = `parquet_scan('${tableName}')`;
  else if (fileType === 'csv') scanExpr = `read_csv_auto('${tableName}')`;
  else if (fileType === 'json') scanExpr = `read_json_auto('${tableName}')`;

  try {
    const res = await conn.query(`SUMMARIZE SELECT * FROM ${scanExpr};`);
    const rows = res.toArray().map(row => {
      const obj = sanitizeRowValues(row.toJSON());
      return {
        columnName: String(obj.column_name ?? ''),
        columnType: String(obj.column_type ?? ''),
        min: obj.min !== null && obj.min !== undefined ? (typeof obj.min === 'object' ? JSON.stringify(obj.min) : String(obj.min)) : '—',
        max: obj.max !== null && obj.max !== undefined ? (typeof obj.max === 'object' ? JSON.stringify(obj.max) : String(obj.max)) : '—',
        approxUnique: obj.approx_unique !== null && obj.approx_unique !== undefined ? String(obj.approx_unique) : '—',
        avg: obj.avg !== null && obj.avg !== undefined && !isNaN(Number(obj.avg)) ? Number(obj.avg).toFixed(2) : '—',
        std: obj.std !== null && obj.std !== undefined && !isNaN(Number(obj.std)) ? Number(obj.std).toFixed(2) : '—',
        q25: obj.q25 !== null && obj.q25 !== undefined ? (typeof obj.q25 === 'object' ? JSON.stringify(obj.q25) : String(obj.q25)) : '—',
        q50: obj.q50 !== null && obj.q50 !== undefined ? (typeof obj.q50 === 'object' ? JSON.stringify(obj.q50) : String(obj.q50)) : '—',
        q75: obj.q75 !== null && obj.q75 !== undefined ? (typeof obj.q75 === 'object' ? JSON.stringify(obj.q75) : String(obj.q75)) : '—',
        count: obj.count !== null && obj.count !== undefined ? String(obj.count) : '—',
        nullPercentage: obj.null_percentage !== null && obj.null_percentage !== undefined && !isNaN(Number(obj.null_percentage)) ? `${Number(obj.null_percentage).toFixed(1)}%` : '0.0%'
      };
    });
    return rows;
  } catch (err) {
    console.warn('SUMMARIZE query failed, falling back to DESCRIBE:', err);
    // Fallback using DESCRIBE
    const descRes = await conn.query(`DESCRIBE SELECT * FROM ${scanExpr};`);
    return descRes.toArray().map(row => {
      const obj = sanitizeRowValues(row.toJSON());
      return {
        columnName: String(obj.column_name ?? ''),
        columnType: String(obj.column_type ?? ''),
        min: '—',
        max: '—',
        approxUnique: '—',
        avg: '—',
        std: '—',
        q25: '—',
        q50: '—',
        q75: '—',
        count: '—',
        nullPercentage: String(obj.null ?? '') === 'YES' ? 'Nullable' : 'Not Null'
      };
    });
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/**
 * Register an arbitrary array of JS objects into DuckDB as a queryable Parquet table.
 * Enables seamless one-click transition from financial/data calculators into the TableView SQL workbench.
 */
export async function loadJsonDataIntoDuckDB(
  baseName: string,
  records: Record<string, any>[]
): Promise<{ tableName: string; fileType: 'parquet' }> {
  const { db, conn } = await getDuckDB();

  const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const jsonFileName = `${cleanName}_data.json`;
  const parquetFileName = `${cleanName}.parquet`;

  // Write newline-delimited JSON (NDJSON)
  const jsonStr = records.map(r => JSON.stringify(r)).join('\n');
  const buffer = new TextEncoder().encode(jsonStr);

  await db.registerFileBuffer(jsonFileName, buffer);

  // Convert to high-performance Parquet format in virtual filesystem
  await conn.query(`
    COPY (
      SELECT * FROM read_json_auto('${jsonFileName}')
    ) TO '${parquetFileName}' (FORMAT 'PARQUET');
  `);

  return { tableName: parquetFileName, fileType: 'parquet' };
}

