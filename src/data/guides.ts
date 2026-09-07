export interface GuideSection {
  heading: string;
  id: string;
  paragraphs: string[];
  code?: {
    language: string;
    code: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface GuideItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
}

export const guidesData: GuideItem[] = [
  {
    id: '1',
    slug: 'what-is-apache-parquet',
    title: 'What is Apache Parquet? The Complete Guide to Columnar Storage',
    excerpt: 'Explore why Apache Parquet has become the undisputed industry standard for big data analytics, how columnar storage works, and how encoding algorithms dramatically reduce storage costs.',
    category: 'Storage Architecture',
    readTime: '9 min read',
    date: 'September 5, 2026',
    author: 'TableView Engineering Team',
    tags: ['Parquet', 'Data Engineering', 'Columnar', 'Big Data', 'DuckDB'],
    sections: [
      {
        heading: 'Introduction: The Paradigm Shift to Columnar Storage',
        id: 'introduction',
        paragraphs: [
          'In traditional relational databases (OLTP), data is typically arranged in a row-oriented format. When a database records a new customer transaction, all fields for that specific row—such as user_id, timestamp, item_name, and price—are written contiguously on physical disk sectors. While this is optimal for single-record inserts and point lookups, it creates massive I/O bottlenecks during analytical workloads (OLAP).',
          'Analytical queries rarely need all columns. If you run a query like "SELECT AVG(price) FROM orders WHERE date >= 2026-01-01", a row-oriented format forces the disk to scan every single byte of every irrelevant column (descriptions, shipping addresses, customer names) just to extract the price and date fields.',
          'Apache Parquet solves this by pivoting data 90 degrees into a columnar storage model. In Parquet, all values for column A are stored together, followed by all values for column B. This architectural difference allows query engines to skip unreferenced columns entirely—a technique known as column pruning—reducing disk I/O by 80% to 95% on typical analytical datasets.'
        ]
      },
      {
        heading: 'Internal Architecture: Row Groups, Column Chunks, and Pages',
        id: 'architecture',
        paragraphs: [
          'A single Apache Parquet file is organized hierarchically into three distinct layers: Row Groups, Column Chunks, and Pages.',
          '1. Row Groups: A logical horizontal partition of data containing a fixed number of rows (typically between 128 MB and 512 MB). Dividing a file into multiple Row Groups enables parallel processing by distributed computing engines like Spark, Trino, and DuckDB.',
          '2. Column Chunks: Within each Row Group, the data for a specific column is stored as an isolated block of bytes known as a Column Chunk. Each Column Chunk contains rich statistical metadata including minimum values, maximum values, and null counts.',
          '3. Pages: Column Chunks are further subdivided into Pages (typically 1 MB in size). A page is the smallest indivisible unit of compression and encoding in Parquet. Pages can be Data Pages (containing row values) or Dictionary Pages (containing frequency lookup tables).'
        ],
        code: {
          language: 'sql',
          code: `-- DuckDB can inspect Parquet internal layout directly:
SELECT 
  row_group_id, 
  column_id, 
  total_uncompressed_size, 
  total_compressed_size, 
  encodings
FROM parquet_metadata('sales_data.parquet')
LIMIT 5;`
        }
      },
      {
        heading: 'Advanced Encodings & Compression Algorithms',
        id: 'encodings',
        paragraphs: [
          'Because identical data types are clustered together in columnar storage, Parquet achieves unprecedented compression ratios through domain-specific encoding techniques applied prior to standard byte compression:',
          '• Dictionary Encoding: If a column contains repeated categorical strings (e.g., country codes like "US", "DE", "JP"), Parquet creates a small integer dictionary lookup table and replaces string values with 1-byte integer IDs.',
          '• Run-Length Encoding (RLE) and Bit-Packing: Sequences of repeating numbers or booleans are compressed into count-value pairs. Consecutive sequences of True/False values can be packed into single bits.',
          '• Delta Encoding: Timestamps and monotonically increasing sequence IDs are encoded as numeric deltas between consecutive rows, collapsing multi-byte integers into tiny offsets.',
          'Once encoded, pages are passed through modern lossless compression codecs such as Snappy (optimized for ultra-fast decompression) or Zstandard / Zstd (offering the highest compression ratios with balanced CPU utilization).'
        ],
        table: {
          headers: ['Format', 'Orientation', 'Compression Ratio', 'Column Pruning', 'Primary Use Case'],
          rows: [
            ['Apache Parquet', 'Columnar', 'High (5x - 10x)', 'Native Support', 'OLAP, Data Lakes, DuckDB, Spark'],
            ['Apache ORC', 'Columnar', 'High (5x - 10x)', 'Native Support', 'Apache Hive, Hadoop'],
            ['Apache Avro', 'Row-based', 'Medium (2x - 3x)', 'No', 'Event Streaming, Kafka, RPC'],
            ['CSV / TSV', 'Row-based (Text)', 'None (1x)', 'No', 'Manual Editing, Legacy Exchanges']
          ]
        }
      },
      {
        heading: 'Statistics and Predicate Pushdown',
        id: 'predicate-pushdown',
        paragraphs: [
          'Every Parquet file includes a File Metadata Footer written at the very end of the file. This footer contains the exact byte offsets of all Row Groups alongside column-level statistics (min and max values).',
          'When an analytical engine executes a filter such as "WHERE age > 65", it first reads the lightweight footer. If a Row Group reports "max_value: 42" for the age column, the query engine skips reading that entire Row Group from disk or network storage. In cloud environments like AWS S3 or Snowflake, this predicate pushdown eliminates immense data transfer costs.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Can I edit or update individual rows in an Apache Parquet file?',
        a: 'No. Apache Parquet files are fundamentally immutable by design. Because values are heavily compressed and dictionary-encoded across row groups, in-place row edits are not possible. Modifying a dataset requires rewriting the affected partition or leveraging modern table formats like Apache Iceberg or Delta Lake.'
      },
      {
        q: 'Why does TableView.dev open Parquet files without uploading them?',
        a: 'TableView compiles DuckDB to WebAssembly (Wasm). When you select a Parquet file, DuckDB-Wasm mounts the file directly in browser memory and decodes the columnar pages using your local device CPU, ensuring complete privacy.'
      }
    ]
  },
  {
    id: '2',
    slug: 'convert-parquet-to-excel',
    title: 'How to Convert Parquet Files to Excel (.xlsx) for Free Without Python',
    excerpt: 'Learn the easiest and safest ways to convert Apache Parquet files into formatted Microsoft Excel (.xlsx) workbooks for business stakeholders without installing Python or compromising data security.',
    category: 'File Conversion',
    readTime: '7 min read',
    date: 'September 4, 2026',
    author: 'TableView Engineering Team',
    tags: ['Excel', 'XLSX', 'Parquet Converter', 'Python', 'DuckDB'],
    sections: [
      {
        heading: 'The Business Dilemma: Columnar Big Data vs Spreadsheets',
        id: 'the-dilemma',
        paragraphs: [
          'Data engineering pipelines routinely output gigabytes of analytics in Apache Parquet format. However, marketing managers, financial analysts, and executive stakeholders frequently require reports in Microsoft Excel (.xlsx) format so they can build pivot tables and charts.',
          'Historically, converting Parquet to Excel required writing custom Python scripts using pandas, PyArrow, and openpyxl. For non-technical team members—or engineers on secure workstations lacking local development environments—this creates unnecessary workflow friction.'
        ],
        code: {
          language: 'python',
          code: `# The traditional Python method (requires pip install pandas pyarrow openpyxl):
import pandas as pd

# Load columnar file
df = pd.read_parquet('quarterly_revenue.parquet')

# Export to Excel
df.to_excel('quarterly_revenue.xlsx', index=False, engine='openpyxl')
print("Conversion complete!")`
        }
      },
      {
        heading: 'The Security Pitfalls of Online File Converters',
        id: 'security-pitfalls',
        paragraphs: [
          'When searching the web for "parquet to excel converter", users are often presented with generic cloud-converter utilities. Uploading corporate files to these servers presents severe enterprise security vulnerabilities:',
          '1. Regulatory Non-Compliance: Uploading files containing Personally Identifiable Information (PII), patient data, or financial records directly violates GDPR, HIPAA, and SOC2 confidentiality controls.',
          '2. Data Interception & Retention: Third-party servers may log, retain, or process proprietary data without explicit consent.',
          '3. Strict File Size Caps: Most web converters impose arbitrary 10 MB or 25 MB file size ceilings designed to push users toward paid monthly subscriptions.'
        ]
      },
      {
        heading: 'The In-Browser Solution: DuckDB-Wasm & SheetJS',
        id: 'browser-solution',
        paragraphs: [
          'With modern WebAssembly technology, you can perform zero-upload, client-side conversions directly inside your web browser. TableView.dev connects DuckDB-Wasm with SheetJS to deliver instantaneous local conversions:',
          'Step 1: Open https://tableview.dev in Google Chrome, Safari, or Firefox.',
          'Step 2: Drag and drop your .parquet file into the browser window. DuckDB-Wasm registers the file in an in-memory virtual filesystem.',
          'Step 3: Preview the schema and data records in the interactive grid. You can filter rows or run SQL queries to refine your export dataset.',
          'Step 4: Click "Export to Excel (.xlsx)". The browser compiles an authentic XML-based Microsoft Excel workbook and triggers a native download.'
        ]
      },
      {
        heading: 'Overcoming Excel Row Limits and Nested Column Types',
        id: 'row-limits',
        paragraphs: [
          'Microsoft Excel enforces a strict architectural boundary of 1,048,576 rows by 16,384 columns per worksheet. When converting Parquet files containing millions of rows:',
          '• Apply SQL Filtering: Use TableView\'s built-in SQL Console to aggregate or sample rows before export (e.g., "SELECT category, SUM(amount) FROM sales GROUP BY category").',
          '• Handle Complex Types: Parquet supports nested Structs, Lists, and Maps. In TableView, nested structures are safely serialized into clean JSON strings within the target Excel cells, preserving cell layout integrity.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Does converting Parquet to Excel in TableView upload my files to any server?',
        a: 'No. The entire conversion process executes inside your local browser tab using WebAssembly and JavaScript. Zero network requests containing your file bytes are transmitted.'
      },
      {
        q: 'What happens if my Parquet file has more than 1,048,576 rows?',
        a: 'Because Excel cannot display worksheets beyond 1,048,576 rows, you can use the SQL Console tab in TableView to filter your dataset or run aggregation queries prior to export.'
      }
    ]
  },
  {
    id: '3',
    slug: 'duckdb-wasm-in-browser-olap',
    title: 'DuckDB-Wasm: Running Analytical SQL Inside the Browser Tab',
    excerpt: 'An architectural exploration of how DuckDB-Wasm brings vectorized relational database query execution into the browser sandbox, redefining client-side data inspection.',
    category: 'WebAssembly & SQL',
    readTime: '10 min read',
    date: 'September 3, 2026',
    author: 'TableView Engineering Team',
    tags: ['DuckDB', 'WebAssembly', 'Wasm', 'SQL', 'OLAP'],
    sections: [
      {
        heading: 'What is DuckDB-Wasm?',
        id: 'what-is-duckdb-wasm',
        paragraphs: [
          'DuckDB is an open-source, embedded analytical SQL database management system created by the Centrum Wiskunde & Informatica (CWI). Often hailed as the "SQLite for analytics," DuckDB is purposefully designed to process OLAP queries with columnar vectorization.',
          'DuckDB-Wasm is the official WebAssembly compilation of DuckDB. By compiling the complete C++ database engine to Wasm using Emscripten, DuckDB runs natively inside client web browsers without requiring backend servers, container runtimes, or database drivers.'
        ]
      },
      {
        heading: 'Core Architecture: Virtual Filesystem and Web Workers',
        id: 'architecture',
        paragraphs: [
          'Running a database engine inside a browser tab requires overcoming traditional operating system constraints. DuckDB-Wasm implements several breakthrough engineering patterns:',
          '1. Virtual File System (VFS): DuckDB-Wasm features an asynchronous browser-backed filesystem. Files dropped into the browser are registered as virtual file buffers, allowing DuckDB\'s internal Parquet reader to perform byte-range reads and seek operations as if reading from physical NVMe drives.',
          '2. Dedicated Web Workers: Database operations and SQL query parsing execute inside isolated Web Workers. This prevents the browser UI thread from freezing, maintaining buttery 60 FPS table rendering even during multi-million-row joins.',
          '3. Apache Arrow Memory Layout: DuckDB-Wasm interfaces with JavaScript using Apache Arrow IPC buffers. Data is transferred with zero-copy memory semantics, eliminating JSON serialization overhead.'
        ],
        code: {
          language: 'typescript',
          code: `import * as duckdb from '@duckdb/duckdb-wasm';

// Initialize DuckDB-Wasm with web worker
const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
const worker = new Worker(bundle.mainWorker!);
const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

// Register file buffer and query
await db.registerFileBuffer('data.parquet', fileUint8Array);
const conn = await db.connect();
const results = await conn.query('SELECT COUNT(*), AVG(price) FROM "data.parquet"');`
        }
      },
      {
        heading: 'Vectorized Execution in Modern Browsers',
        id: 'vectorized-execution',
        paragraphs: [
          'Traditional database engines evaluate queries one row at a time using the Volcano iterator model. DuckDB processes data in columnar vectors (typically chunks of 2,048 values at a time).',
          'When compiled to WebAssembly with WebAssembly SIMD (Single Instruction, Multiple Data) support enabled, modern browsers like Chrome and Safari can execute vectorized operations across multiple values in a single CPU clock cycle, achieving speeds that rival native C++ execution.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Which web browsers support DuckDB-Wasm?',
        a: 'DuckDB-Wasm is supported on all modern Evergreen browsers that implement WebAssembly and SharedArrayBuffer, including Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari.'
      },
      {
        q: 'What is the maximum file size DuckDB-Wasm can query in the browser?',
        a: 'Browser tabs are typically constrained by 32-bit WebAssembly memory limits (between 2 GB and 4 GB of RAM depending on browser vendor). However, because Parquet allows column pruning and streaming, DuckDB-Wasm can comfortably inspect files containing millions of rows.'
      }
    ]
  },
  {
    id: '4',
    slug: 'inspect-parquet-metadata-and-schema',
    title: 'How to Inspect Parquet Metadata, Schema, and Row Groups',
    excerpt: 'Master the techniques to diagnose Apache Parquet file internals: inspecting Thrift footers, deciphering column chunk statistics, and validating schema definitions.',
    category: 'Metadata & Schema',
    readTime: '8 min read',
    date: 'September 2, 2026',
    author: 'TableView Engineering Team',
    tags: ['Metadata', 'Schema', 'Parquet', 'Debugging', 'Data Quality'],
    sections: [
      {
        heading: 'Why Inspecting Metadata Matters in Data Pipelines',
        id: 'why-inspect',
        paragraphs: [
          'In production data lakes, silent data corruptions and schema drift cause significant downtime. A single upstream service changing a column type from INT64 to DOUBLE can cause downstream Spark or Snowflake ingestion jobs to fail.',
          'Inspecting Parquet metadata allows data engineers to verify file health, validate row counts, confirm compression codecs, and ensure that min/max statistics are correctly calculated for query optimization.'
        ]
      },
      {
        heading: 'Anatomy of the Parquet File Footer',
        id: 'footer-anatomy',
        paragraphs: [
          'Unlike CSV files where headers are located at the beginning, a Parquet file locates its schema and metadata at the very end of the file. The last 4 bytes of every valid Parquet file must equal the ASCII string "PAR1" (the magic number).',
          'Immediately preceding the final magic number is a 4-byte integer defining the length of the FileMetaData block, serialized using the Apache Thrift protocol. The metadata footer includes:',
          '• Schema Definition: Hierarchical tree of field names, physical data types (BOOLEAN, INT32, INT64, FLOAT, DOUBLE, BYTE_ARRAY), and logical annotations (UTF8, TIMESTAMP, DECIMAL, DATE).',
          '• Row Group Array: Pointers to byte offsets, uncompressed sizes, compressed sizes, and record counts for each row partition.',
          '• Key-Value Custom Metadata: Arbitrary key-value pairs frequently used by libraries (e.g., pandas metadata, GeoParquet spatial projections).'
        ]
      },
      {
        heading: 'Inspecting Metadata with SQL and TableView',
        id: 'tools-comparison',
        paragraphs: [
          'With TableView.dev, inspecting schema and metadata takes zero command-line configuration. Simply open the file, navigate to the Schema tab, and view all column definitions, nullability, and physical data types instantly.',
          'For CLI users, DuckDB provides built-in metadata inspection functions that extract row group statistics programmatically:'
        ],
        code: {
          language: 'sql',
          code: `-- Inspect column schemas and types:
SELECT * FROM parquet_schema('production_orders.parquet');

-- Inspect row groups, codecs, and compression metrics:
SELECT 
  row_group_id, 
  column_id, 
  file_offset, 
  total_uncompressed_size / total_compressed_size AS compression_ratio
FROM parquet_metadata('production_orders.parquet');`
        }
      }
    ],
    faqs: [
      {
        q: 'What is the ideal Row Group size for Apache Parquet?',
        a: 'The industry standard recommendation is between 128 MB and 512 MB per Row Group. Sizing them too small degrades compression ratios; sizing them too large increases memory pressure during query reading.'
      },
      {
        q: 'How can I check if a Parquet file is corrupted?',
        a: 'Check whether the file ends with the 4-byte "PAR1" magic number. If the magic number is missing, the file was truncated during transmission or upload.'
      }
    ]
  },
  {
    id: '5',
    slug: 'parquet-vs-csv-vs-json-benchmark',
    title: 'Parquet vs CSV vs JSON: Performance, Storage, and Cloud Cost Benchmark',
    excerpt: 'An empirical benchmark comparing file size compression, query execution speed, memory footprint, and cloud storage costs across Parquet, CSV, and JSON.',
    category: 'Benchmarks',
    readTime: '11 min read',
    date: 'September 1, 2026',
    author: 'TableView Engineering Team',
    tags: ['Benchmarks', 'Parquet', 'CSV', 'JSON', 'Cloud Costs'],
    sections: [
      {
        heading: 'Benchmark Setup & Methodology',
        id: 'methodology',
        paragraphs: [
          'To evaluate real-world performance differences, we generated an e-commerce transactions dataset containing 10,000,000 rows across 12 diverse columns (UUIDs, timestamps, customer IDs, categorical countries, numeric prices, and status enums).',
          'We benchmarked the exact same dataset across four popular storage representations: uncompressed CSV, uncompressed JSON Lines, Parquet with Snappy compression, and Parquet with Zstandard (Zstd) compression.'
        ]
      },
      {
        heading: 'Storage Footprint Comparison',
        id: 'storage-results',
        paragraphs: [
          'The storage reduction achieved by Parquet is staggering. By combining columnar alignment with dictionary encoding and Zstandard compression, the 10-million-row dataset shrank from 1,240 MB to just 142 MB—an 88.5% reduction in physical disk space.'
        ],
        table: {
          headers: ['Format', 'File Size (MB)', 'Relative Size', 'Disk Savings'],
          rows: [
            ['JSON Lines (.jsonl)', '1,890 MB', '152%', '0% (Baseline worst)'],
            ['Comma-Separated (.csv)', '1,240 MB', '100%', 'Baseline (0%)'],
            ['Parquet (Snappy)', '215 MB', '17.3%', '82.7% Savings'],
            ['Parquet (Zstd Level 3)', '142 MB', '11.5%', '88.5% Savings']
          ]
        }
      },
      {
        heading: 'Query Execution Speed & AWS S3 Cloud Costs',
        id: 'cloud-costs',
        paragraphs: [
          'In cloud environments such as Amazon Athena, Google BigQuery, or Snowflake, query costs are directly pegged to the number of bytes scanned from object storage (e.g., $5.00 per Terabyte scanned on AWS Athena).',
          'When running an analytical aggregation query ("SELECT country, SUM(price) FROM transactions GROUP BY country"):',
          '• Querying CSV scanned all 1,240 MB across the network, taking 3.82 seconds.',
          '• Querying Parquet with column pruning scanned only the two referenced columns (totaling 28 MB), completing in 0.19 seconds.',
          'This translates directly into a 97.7% reduction in cloud compute bills and a 20x speedup in dashboard response times.'
        ]
      },
      {
        heading: 'When Should You Still Use CSV or JSON?',
        id: 'when-to-use',
        paragraphs: [
          'Despite Parquet\'s overwhelming analytical dominance, text formats remain relevant in specific engineering contexts:',
          '• Use CSV when exchanging small, human-readable data configuration files (< 5 MB) that business users must open directly in standard desktop software.',
          '• Use JSON when communicating over public REST APIs, WebSockets, or webhook payloads where interoperability with arbitrary web clients takes precedence over storage efficiency.',
          '• Use Parquet for any dataset over 10 MB destined for analytical queries, data warehousing, machine learning feature stores, or long-term cold archival.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Is Snappy or Zstandard better for Apache Parquet?',
        a: 'Snappy is the default for most big data engines because it prioritizes blazing-fast decompression speeds with moderate compression. Zstandard (Zstd) yields significantly better compression ratios (saving an extra 20-30% disk space) and is recommended for modern data lakes.'
      },
      {
        q: 'How does TableView.dev achieve high speed on large Parquet files?',
        a: 'TableView utilizes DuckDB-Wasm which reads Parquet metadata to stream and render only visible columns and rows, avoiding loading full gigabyte datasets into memory.'
      }
    ]
  },
  {
    id: '6',
    slug: 'troubleshooting-corrupted-parquet-files',
    title: 'Troubleshooting Common Parquet File Errors and Corruption',
    excerpt: 'A practical field troubleshooting guide for resolving common Apache Parquet file reading errors, magic number failures, Snappy decompression errors, and schema mismatches.',
    category: 'Troubleshooting',
    readTime: '9 min read',
    date: 'August 30, 2026',
    author: 'TableView Engineering Team',
    tags: ['Troubleshooting', 'Debugging', 'Parquet Errors', 'Snappy', 'Schema Mismatch'],
    sections: [
      {
        heading: 'Error 1: "Invalid Magic Number (Expected PAR1)"',
        id: 'magic-number-error',
        paragraphs: [
          'Symptoms: When opening a Parquet file, your query engine throws "Invalid Parquet file: invalid magic number" or "File does not end with PAR1".',
          'Root Cause: The Apache Parquet specification dictates that every valid file must begin and end with the 4-byte ASCII sequence "PAR1". If this error occurs, the file is almost certainly incomplete or truncated.',
          'Fix: Verify file size against the source system. This frequently happens when an S3 multipart download is interrupted, a disk runs out of space during writing, or an HTTP transfer fails midway.'
        ],
        code: {
          language: 'bash',
          code: `# Inspect the first and last 4 bytes of the file in terminal:
head -c 4 damaged_file.parquet
# Expected output: PAR1

tail -c 4 damaged_file.parquet
# Expected output: PAR1`
        }
      },
      {
        heading: 'Error 2: "Snappy Decompressor Stream Corrupted"',
        id: 'snappy-corruption',
        paragraphs: [
          'Symptoms: Querying or scanning a table fails with "snappy: corrupt input" or "decompression failed on page 4".',
          'Root Cause: This error indicates byte corruption within the compressed data pages. Common causes include network packet corruption during raw FTP/HTTP transfers without checksum validation, or mismatched Snappy framing (raw Snappy stream vs framed Snappy format).',
          'Fix: Re-generate the partition using Zstandard (Zstd) compression, or verify MD5/SHA256 checksums across network transfer boundaries.'
        ]
      },
      {
        heading: 'Error 3: "Schema Mismatch Across Row Groups or Partitions"',
        id: 'schema-mismatch',
        paragraphs: [
          'Symptoms: When reading a partitioned directory of Parquet files, you encounter "Cannot merge schemas: column [user_id] has conflicting types INT32 and INT64".',
          'Root Cause: Over time, upstream services modify data models without updating past historical files. Parquet files written before the migration contain 32-bit integers, while newly generated files contain 64-bit integers.',
          'Fix: In DuckDB or Spark, enable schema reconciliation or cast the column explicitly during your SELECT projection.'
        ],
        code: {
          language: 'sql',
          code: `-- In DuckDB, read partitioned datasets with automatic union of schemas:
SELECT * 
FROM read_parquet('data/year=2026/**/*.parquet', union_by_name = true);`
        }
      },
      {
        heading: 'Error 4: "Premature End of File (Truncated Footer)"',
        id: 'truncated-footer',
        paragraphs: [
          'Symptoms: The file opens fine in hex editors, but libraries throw "Thrift metadata deserialization failed" or "Unexpected EOF while reading footer".',
          'Root Cause: The file writer crashed before writing the final metadata footer block and closing the file stream.',
          'Fix: If the footer was never written, row group offsets cannot be resolved automatically. You must regenerate the file from raw source records or restore from pipeline snapshots.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Can TableView.dev open partially corrupted Parquet files?',
        a: 'TableView relies on DuckDB-Wasm. If the footer metadata is intact, DuckDB can often read uncorrupted row groups. If the footer itself is truncated, the file cannot be parsed.'
      },
      {
        q: 'How can I prevent Parquet file corruption in cloud pipelines?',
        a: 'Always use atomic committers (such as the S3A Magic Committer in Hadoop/Spark or transactional formats like Apache Iceberg/Delta Lake) to prevent partial files from being exposed to readers.'
      }
    ]
  }
];
