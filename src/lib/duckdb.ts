import * as duckdb from '@duckdb/duckdb-wasm';
import * as XLSX from 'xlsx';

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

/**
 * Initialize DuckDB-Wasm using jsdelivr CDN bundles
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
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    // Create blob worker to avoid Cross-Origin Worker restrictions
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
    );

    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
    const newDb = new duckdb.AsyncDuckDB(logger, worker);

    await newDb.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);

    const newConn = await newDb.connect();
    db = newDb;
    conn = newConn;
    return newConn;
  })();

  const activeConn = await initPromise;
  return { db: db!, conn: activeConn };
}

/**
 * Register a user-selected file into the DuckDB virtual filesystem
 */
export async function loadFileIntoDuckDB(file: File): Promise<{
  tableName: string;
  fileType: 'parquet' | 'csv' | 'json';
}> {
  const { db } = await getDuckDB();

  // Sanitize filename for SQL
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const buffer = new Uint8Array(await file.arrayBuffer());

  await db.registerFileBuffer(cleanName, buffer);

  const lowerName = cleanName.toLowerCase();
  let fileType: 'parquet' | 'csv' | 'json' = 'parquet';

  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0] || 'Sheet1';
    const sheet = workbook.Sheets[firstSheetName];
    const csvContent = sheet ? XLSX.utils.sheet_to_csv(sheet) : '';
    const csvBuffer = new TextEncoder().encode(csvContent);
    const csvFileName = cleanName.replace(/\.[^/.]+$/, '') + '.csv';
    await db.registerFileBuffer(csvFileName, csvBuffer);
    return { tableName: csvFileName, fileType: 'csv' };
  } else if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
    fileType = 'csv';
  } else if (lowerName.endsWith('.json') || lowerName.endsWith('.jsonl') || lowerName.endsWith('.ndjson')) {
    fileType = 'json';
  }

  return { tableName: cleanName, fileType };
}

/**
 * Generate in-browser sample parquet dataset (1000 e-commerce transactions)
 */
export async function generateSampleParquet(): Promise<{ tableName: string; fileType: 'parquet' }> {
  const { conn } = await getDuckDB();
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
