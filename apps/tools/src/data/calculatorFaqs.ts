/**
 * Crawlable FAQ registry: one entry per canonical calculator path.
 *
 * Why this file exists
 * --------------------
 * The calculators used to keep their questions either inline in JSX or loose in
 * the page module. That caused two distinct problems:
 *
 *   1. The prerenderer had nothing to emit, so every calculator URL shipped
 *      ZERO words of static content: invisible to crawlers that do not execute
 *      JavaScript (Bing's first pass, and most AI crawlers such as GPTBot).
 *
 *   2. The mortgage and refinance pages declared FAQPage structured data whose
 *      questions appeared NOWHERE on the rendered page. Marking up content that
 *      a visitor cannot see violates Google's structured data guidelines and
 *      risks a manual action. Those two pages now render this data visibly.
 *
 * This registry is the single source of truth: pages render FROM it and the
 * prerenderer emits FROM it, so the static HTML can never disagree with what a
 * visitor sees. Adding FAQ markup that is not rendered would be cloaking.
 *
 * If you add a calculator, register it here and render it via
 * <CalculatorFaqSection /> rather than inlining the markup.
 */

export interface CalcFaq {
  q: string;
  a: string;
}

/** Keyed by canonical calculator path. */
export const CALCULATOR_FAQS: Record<string, CalcFaq[]> = {
  '/snowflake-cost-calculator': [
    {
      q: 'How does Snowflake calculate virtual warehouse credit consumption?',
      a: 'Snowflake compute is billed in credits per second, with a 60-second minimum charge every time a warehouse starts or resizes. T-shirt sizes scale exponentially in powers of 2: X-Small consumes 1 credit/hour, Small consumes 2 credits/hour, Medium consumes 4, Large consumes 8, X-Large consumes 16, and up to 6X-Large at 512 credits/hour.',
    },
    {
      q: 'What is the price per Snowflake credit across editions?',
      a: 'On-demand list prices are typically $2.00 per credit for Standard Edition, $3.00 for Enterprise Edition (which includes multi-cluster warehouses and 90-day Time Travel), and $4.00 for Business Critical Edition (which includes HIPAA/PCI compliance, Tri-Secret Secure customer-managed keys, and private networking links).',
    },
    {
      q: 'How does Multi-Cluster Warehouse (MCW) autoscaling affect cost?',
      a: 'Multi-cluster warehouses (available on Enterprise and above) scale horizontally by spinning up identical warehouse clusters (e.g., Min: 1, Max: 4) to eliminate query queue times during peak dashboard spikes. Cost is strictly additive: 3 active Medium clusters running for 1 hour consume 3 × 4 = 12 credits.',
    },
    {
      q: 'What is the recommended Auto-Suspend setting for Snowflake warehouses?',
      a: 'For interactive BI dashboards and ad-hoc analytics, set AUTO_SUSPEND = 60 (1 minute). Because Snowflake bills by the second after the initial 60 seconds, reducing the auto-suspend window from the default 10 minutes down to 1 minute frequently slashes idle compute spend by 25% to 50%.',
    },
    {
      q: 'How much does Snowflake storage cost per TB?',
      a: 'On-demand capacity storage is billed at $40 per TB per month, while committed pre-purchased capacity contracts discount storage down to approximately $23 per TB per month. Snowflake automatically compresses data upon ingestion (typically achieving a 3x to 5x compression factor).',
    },
    {
      q: 'Should I scale up (larger warehouse) or scale out (multi-cluster)?',
      a: 'Scale up (e.g. Medium to Large) when you need to speed up a single heavy ETL job, large aggregation, or memory-intensive query. Scale out (multi-cluster) when hundreds of concurrent users or BI tools like Tableau/Looker are experiencing query queuing delays.',
    },
  ],
  '/parquet-storage-calculator': [
    {
      q: 'Why does Apache Parquet reduce AWS S3 storage bills by 80% to 90%?',
      a: 'Unlike row-based text files (CSV or JSON) where repetitive text strings are duplicated row by row, Apache Parquet organizes data in columns. Similar data types are grouped together, enabling ultra-efficient dictionary encoding, run-length encoding (RLE), bit-packing, and high-ratio compression codecs like ZSTD or Snappy.',
    },
    {
      q: 'How does Parquet cut Amazon Athena and Google BigQuery scanning costs?',
      a: 'Serverless query engines like AWS Athena bill $5.00 per TB of data scanned from S3. Because Parquet is columnar, a query selecting only 3 columns from a 50-column dataset reads ONLY those 3 columns from disk (column projection), skipping 90%+ of the file bytes. Combined with min/max predicate pushdown, Athena scan bills routinely fall by 90% to 99%.',
    },
    {
      q: 'Which Parquet compression codec is best: Snappy, ZSTD, or GZIP?',
      a: 'Snappy is the cloud default: it offers blazing fast decompression speeds with ~75% size reduction, ideal for real-time streaming queries. ZSTD (level 3) is the modern gold standard: it achieves 85% to 90% compression ratios while maintaining decomp speed close to Snappy. GZIP provides maximum compression but suffers from significantly slower decompression CPU overhead.',
    },
    {
      q: 'What is Predicate Pushdown and Row Group Pruning?',
      a: 'Parquet files divide tables into Row Groups (typically 128 MB to 512 MB) and store min/max statistics for every column in the file footer metadata. When you run a query like "WHERE event_date >= \'2025-01-01\'", the query engine reads the footer and skips reading entire row groups that don\'t match the criteria, avoiding millions of bytes of I/O.',
    },
    {
      q: 'Can I convert large CSV or JSON files to Parquet directly in the browser?',
      a: 'Yes! Using TableView\'s DuckDB-Wasm in-browser converter, you can convert gigabyte-sized CSV, JSON, and NDJSON files into Snappy or ZSTD Parquet files directly inside your browser without uploading any confidential data to third-party servers.',
    },
    {
      q: 'How does Parquet compare to Apache ORC or Avro?',
      a: 'Avro is a row-oriented format optimized for write-heavy streaming message queues (Kafka). Parquet and ORC are both columnar formats optimized for analytical read queries (OLAP). Parquet has achieved universal cross-platform dominance across Spark, DuckDB, Trino, Snowflake, Databricks, ClickHouse, and AWS Athena.',
    },
  ],
  '/json-formatter': [
    {
      q: 'Does this JSON formatter upload my data to any remote server?',
      a: 'No! The JSON formatter operates 100% locally in your web browser using JavaScript and WebAssembly. Your data never leaves your computer, making it completely safe for API keys, confidential customer records, and production tokens.',
    },
    {
      q: 'How does the in-browser JSON validator pinpoint syntax errors?',
      a: 'The parser analyzes JSON character by character. When invalid tokens, unquoted keys, trailing commas, or unclosed braces are encountered, it identifies the exact line number, column offset, and unexpected character snippet.',
    },
    {
      q: 'Can this tool format large JSON files with thousands of lines?',
      a: 'Yes, modern browser V8 engines can format multi-megabyte JSON payloads in milliseconds. For files exceeding hundreds of megabytes, you can also use TableView\'s DuckDB SQL engine to query NDJSON/JSONL directly.',
    },
    {
      q: 'What is the difference between JSON minification and beautification?',
      a: 'Beautification adds standard 2-space or 4-space indentation and line breaks for human readability. Minification strips all unnecessary whitespace, comments, and newlines to compress file size for HTTP transmission and API payloads.',
    },
  ],
  '/sql-formatter': [
    {
      q: 'Which SQL dialects are supported by this formatter?',
      a: 'Our SQL formatter supports DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, Amazon Redshift, Google BigQuery, MariaDB, Transact-SQL (T-SQL), Spark SQL, and standard ANSI SQL.',
    },
    {
      q: 'Can I execute queries directly after formatting?',
      a: 'Yes! You can click "Open in DuckDB SQL Workbench" to immediately execute the formatted SQL query against local CSV, Parquet, or Excel files in your browser with zero database installation.',
    },
    {
      q: 'Is my SQL query or schema sent to external servers?',
      a: 'No. Formatting is executed entirely on your client device inside browser JavaScript. Confidential database schemas, table names, and proprietary business logic remain 100% private.',
    },
    {
      q: 'What does SQL Minify do?',
      a: 'SQL Minify removes redundant whitespace, comments, and line breaks to compress queries into a single compact string. This is ideal for embedding queries into source code, application config files, or URL parameters.',
    },
  ],
};
export function getCalculatorFaqs(path: string): CalcFaq[] {
  return CALCULATOR_FAQS[path] ?? [];
}
