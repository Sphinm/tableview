export type ToolCategory = 'viewer' | 'converter' | 'sql' | 'analysis';

export interface ToolConfig {
  slug: string;
  path: string;
  badge: string;
  title: string;
  shortTitle?: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h1Highlight: string;
  subtitle: string;
  category: ToolCategory;
  tag?: string;
  color: 'emerald' | 'green' | 'indigo' | 'cyan' | 'amber' | 'purple';
  iconType: 'csv' | 'excel' | 'parquet' | 'json' | 'sql' | 'schema';
  acceptExtensions: string;
  acceptLabel: string;
  primaryExport: 'excel' | 'csv' | 'parquet' | 'json' | 'schema' | 'any';
  defaultTab?: 'grid' | 'schema' | 'sql' | 'json';
  faqs: { q: string; a: string }[];
  features: {
    icon: 'cpu' | 'shield' | 'download' | 'zap' | 'table';
    title: string;
    description: string;
  }[];
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  // ==========================================
  // VIEWERS (数据查看器)
  // ==========================================
  'csv-viewer': {
    slug: 'csv-viewer',
    path: '/csv-viewer',
    badge: '100% In-Browser · Instant CSV Reader',
    title: 'Free Online CSV Viewer',
    shortTitle: 'CSV Viewer',
    metaTitle: 'Free Online CSV Viewer — Fast, Private In-Browser Spreadsheet Reader',
    metaDescription: 'Open, inspect, search, filter, and sort large CSV and TSV files directly in your web browser. Zero server uploads with high-performance DuckDB-Wasm.',
    h1: 'Free Online CSV',
    h1Highlight: 'Viewer',
    subtitle: 'Drop any .csv or .tsv file to instantly preview millions of rows, sort columns, execute SQL queries, and search without installing Microsoft Excel or Python.',
    category: 'viewer',
    tag: 'Popular',
    color: 'emerald',
    iconType: 'csv',
    acceptExtensions: '.csv,.tsv,.txt',
    acceptLabel: 'Supports CSV (.csv), TSV (.tsv), and comma/tab-delimited text files',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'shield',
        title: '100% Local Device Privacy',
        description: 'Your CSV spreadsheets never leave your device. All parsing and indexing runs locally inside WebAssembly.'
      },
      {
        icon: 'zap',
        title: 'Instant Fast Search & Sorting',
        description: 'Instant column filtering, ascending/descending sorting, and pagination on massive datasets.'
      },
      {
        icon: 'table',
        title: 'DuckDB SQL Analysis Built-In',
        description: 'Filter rows, compute group-by aggregations, and join tables using standard analytical SQL.'
      }
    ],
    faqs: [
      {
        q: 'Do I need Microsoft Excel installed to open CSV files?',
        a: 'No! TableView runs completely in your web browser. You can open, view, search, and query any CSV or TSV file without Microsoft Excel, Office 365, or Python.'
      },
      {
        q: 'What is the maximum CSV file size supported?',
        a: 'Because DuckDB-Wasm streams and parses data directly into memory, TableView comfortably opens CSV files with hundreds of thousands of rows, limited only by your browser RAM.'
      },
      {
        q: 'Can I export the CSV to Excel or Parquet?',
        a: 'Yes! You can convert your CSV into native formatted Excel (.xlsx), compressed Apache Parquet (ZSTD), or JSON with a single click.'
      }
    ]
  },

  'excel-viewer': {
    slug: 'excel-viewer',
    path: '/excel-viewer',
    badge: 'No Microsoft Office Required · Client-Side',
    title: 'Free Online Excel Viewer (.xlsx / .xls)',
    shortTitle: 'Excel Viewer',
    metaTitle: 'Free Online Excel Viewer (.xlsx) — Open Spreadsheets Without Office',
    metaDescription: 'Open and view Microsoft Excel spreadsheets (.xlsx, .xls) online for free. Fast table rendering, sorting, and SQL queries with zero server file uploads.',
    h1: 'Free Online Excel',
    h1Highlight: 'Viewer (.xlsx)',
    subtitle: 'View, search, and analyze Microsoft Excel workbooks online in seconds without installing MS Office, Office 365, or signing up.',
    category: 'viewer',
    tag: 'Popular',
    color: 'green',
    iconType: 'excel',
    acceptExtensions: '.xlsx,.xls',
    acceptLabel: 'Supports Microsoft Excel (.xlsx) and Excel 97-2004 (.xls)',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'No Office License Required',
        description: 'Open .xlsx and .xls workbooks on any Mac, Windows, Linux, or Chromebook without Microsoft Office.'
      },
      {
        icon: 'shield',
        title: 'Confidential Business Data Safe',
        description: 'Your internal financial sheets and client lists stay on your machine. Zero bytes are uploaded to cloud servers.'
      },
      {
        icon: 'zap',
        title: 'Convert to CSV or Parquet',
        description: 'Quickly export any Excel sheet to standard UTF-8 CSV or high-compression Apache Parquet.'
      }
    ],
    faqs: [
      {
        q: 'Can I view Excel files without Microsoft Office?',
        a: 'Yes! TableView parses Excel workbooks directly in your browser using client-side JavaScript, allowing you to preview rows, sort data, and run SQL queries without Microsoft Office.'
      },
      {
        q: 'Does it support both .xlsx and .xls files?',
        a: 'Yes, both modern XML Excel spreadsheets (.xlsx) and legacy binary Excel files (.xls) are supported.'
      }
    ]
  },

  'parquet-viewer': {
    slug: 'parquet-viewer',
    path: '/parquet-viewer',
    badge: 'DuckDB-Wasm · Instant Local Parser',
    title: 'Free Online Parquet Viewer',
    shortTitle: 'Parquet Viewer',
    metaTitle: 'Free Online Parquet Viewer — Fast, In-Browser Apache Parquet Inspector',
    metaDescription: 'Inspect and view Apache Parquet files online directly in your browser. 100% private in-browser DuckDB-Wasm engine with zero server file uploads.',
    h1: 'Online Apache Parquet',
    h1Highlight: 'Viewer',
    subtitle: 'Drop any .parquet or .geoparquet file to instantly preview table rows, inspect column schemas, and execute SQL queries without installing Python.',
    category: 'viewer',
    tag: 'Core',
    color: 'indigo',
    iconType: 'parquet',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Supports Apache Parquet (.parquet) and GeoParquet (.geoparquet)',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'shield',
        title: '100% In-Browser Privacy',
        description: 'Zero data leaves your machine. Your datasets are read and indexed strictly inside your local browser memory sandbox.'
      },
      {
        icon: 'cpu',
        title: 'Vectorized Wasm Query Engine',
        description: 'Powered by DuckDB-Wasm. Column pruning and dictionary decoding deliver blazing-fast exploration on files with hundreds of thousands of rows.'
      },
      {
        icon: 'table',
        title: 'Full Column Schema & Profiling',
        description: 'Instant visibility into column types, null percentages, distinct counts, and minimum/maximum values.'
      }
    ],
    faqs: [
      {
        q: 'Do I need to install Python, Pandas, or PyArrow to view a Parquet file?',
        a: 'No! TableView runs an embedded analytical database (DuckDB) compiled to WebAssembly inside your web browser. It reads and parses Parquet files completely client-side.'
      },
      {
        q: 'What is the maximum Parquet file size supported?',
        a: 'Because Parquet is a columnar format and DuckDB streams only the necessary column pages, TableView can comfortably open and query files up to hundreds of megabytes, limited only by your available device RAM.'
      },
      {
        q: 'Does it support GeoParquet files?',
        a: 'Yes, GeoParquet files with geometry columns and metadata are supported and can be queried using standard SQL.'
      }
    ]
  },

  'json-viewer': {
    slug: 'json-viewer',
    path: '/json-viewer',
    badge: 'Structured & NDJSON Inspector',
    title: 'Free Online JSON & NDJSON Viewer',
    shortTitle: 'JSON Viewer',
    metaTitle: 'Free Online JSON Viewer — Inspect JSON Arrays & NDJSON Online',
    metaDescription: 'Inspect, format, search, and tabularize JSON files, JSON Lines (JSONL), and NDJSON in your browser with interactive tree view and DuckDB SQL.',
    h1: 'Online JSON & NDJSON',
    h1Highlight: 'Viewer',
    subtitle: 'Drop any .json, .jsonl, or .ndjson file to explore interactive collapsible JSON trees, preview tabular structures, and run SQL queries.',
    category: 'viewer',
    color: 'amber',
    iconType: 'json',
    acceptExtensions: '.json,.jsonl,.ndjson',
    acceptLabel: 'Supports JSON (.json), JSON Lines (.jsonl), and NDJSON (.ndjson)',
    primaryExport: 'any',
    defaultTab: 'json',
    features: [
      {
        icon: 'table',
        title: 'Interactive JSON Tree & Grid',
        description: 'Switch between an expandable JSON tree view and an analytical relational table grid with a single click.'
      },
      {
        icon: 'zap',
        title: 'Streaming NDJSON / JSONL Support',
        description: 'Seamlessly reads server log files and streaming JSON Lines with automatic schema detection.'
      },
      {
        icon: 'shield',
        title: 'Strictly Local Sandbox',
        description: 'Zero telemetry or server requests. Safe for proprietary production logs and confidential JSON dumps.'
      }
    ],
    faqs: [
      {
        q: 'Does this tool support both standard JSON arrays and JSON Lines (.jsonl)?',
        a: 'Yes! You can drop single JSON objects, JSON arrays, or newline-delimited JSON (NDJSON/JSONL) log files.'
      },
      {
        q: 'Can I convert JSON to Excel or Parquet?',
        a: 'Yes, DuckDB automatically flattens and types your JSON records so you can export to Excel (.xlsx) or Apache Parquet.'
      }
    ]
  },

  // ==========================================
  // CONVERTERS (格式转换)
  // ==========================================
  'csv-to-excel': {
    slug: 'csv-to-excel',
    path: '/csv-to-excel',
    badge: '1-Click Local .xlsx Generator',
    title: 'Convert CSV to Excel (.xlsx)',
    shortTitle: 'CSV to Excel',
    metaTitle: 'Convert CSV to Excel (.xlsx) Online Free — 100% Client-Side',
    metaDescription: 'Convert CSV and TSV files to genuine Microsoft Excel (.xlsx) workbooks directly in your browser. Proper column formatting, zero file uploads, fast & free.',
    h1: 'Convert CSV to',
    h1Highlight: 'Excel (.xlsx)',
    subtitle: 'Transform raw comma-separated values into beautifully formatted Microsoft Excel (.xlsx) spreadsheets with preserved data types and zero cloud uploads.',
    category: 'converter',
    tag: 'Popular',
    color: 'emerald',
    iconType: 'excel',
    acceptExtensions: '.csv,.tsv,.txt',
    acceptLabel: 'Drop CSV or TSV file to convert to Microsoft Excel (.xlsx)',
    primaryExport: 'excel',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: 'Native .xlsx Workbooks',
        description: 'Generates genuine Microsoft Excel XML workbooks (.xlsx) compatible with Excel 2016+, Office 365, and Google Sheets.'
      },
      {
        icon: 'zap',
        title: 'Smart Type Detection',
        description: 'Numbers, currency values, dates, and timestamps are detected and formatted with native Excel data types.'
      },
      {
        icon: 'shield',
        title: '100% Private Local Conversion',
        description: 'Sensitive sales reports and user lists are converted strictly inside your browser memory.'
      }
    ],
    faqs: [
      {
        q: 'How do I convert CSV to Excel without software?',
        a: 'Simply drag your CSV file into the drop zone above, preview the table, and click "Export to Excel (.xlsx)". The .xlsx file is generated instantly in your browser.'
      },
      {
        q: 'Does it handle special characters and UTF-8 encoding?',
        a: 'Yes, full UTF-8 encoding is preserved so non-English text, symbols, and accented characters open properly in Excel without garbled text.'
      }
    ]
  },

  'parquet-to-excel': {
    slug: 'parquet-to-excel',
    path: '/parquet-to-excel',
    badge: 'Client-Side .xlsx Generator',
    title: 'Convert Parquet to Excel (.xlsx)',
    shortTitle: 'Parquet to Excel',
    metaTitle: 'Convert Parquet to Excel (.xlsx) Online — Free & 100% Private',
    metaDescription: 'Convert Apache Parquet files directly to native Microsoft Excel (.xlsx) workbooks in your browser. Instant client-side conversion with no file size limits.',
    h1: 'Convert Parquet to',
    h1Highlight: 'Excel (.xlsx)',
    subtitle: 'Transform complex columnar Parquet datasets into clean, beautifully formatted Microsoft Excel spreadsheets with proper headers and data types.',
    category: 'converter',
    tag: 'Popular',
    color: 'indigo',
    iconType: 'excel',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to export directly to Microsoft Excel (.xlsx)',
    primaryExport: 'excel',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: 'Native .xlsx Workbook Output',
        description: 'Generates genuine Microsoft Excel XML workbooks (.xlsx) that open smoothly in Excel 2016+, Office 365, Google Sheets, and LibreOffice.'
      },
      {
        icon: 'shield',
        title: 'Confidential Enterprise Data Safe',
        description: 'Enterprise production dumps, financial ledgers, and customer logs never touch external cloud servers.'
      },
      {
        icon: 'zap',
        title: 'Smart Type Mapping',
        description: 'Timestamps, floating-point currencies, booleans, and integers are mapped to their respective native Excel cell formats.'
      }
    ],
    faqs: [
      {
        q: 'How do I convert Parquet to Excel online?',
        a: 'Simply drag and drop your .parquet file onto the drop zone above, review the instant data preview, and click "Export to Excel (.xlsx)". The workbook will download immediately.'
      },
      {
        q: 'Are nested structs or arrays supported in Excel?',
        a: 'Nested JSON structures and arrays are serialized to readable formatted JSON strings within the Excel cells so no data is truncated.'
      }
    ]
  },

  'parquet-to-csv': {
    slug: 'parquet-to-csv',
    path: '/parquet-to-csv',
    badge: 'High-Throughput In-Memory Stream',
    title: 'Convert Parquet to CSV',
    shortTitle: 'Parquet to CSV',
    metaTitle: 'Convert Parquet to CSV Online — In-Browser High Speed Converter',
    metaDescription: 'Extract and export Apache Parquet files to Comma-Separated Values (.csv). Zero server uploads, instant streaming DuckDB-Wasm engine.',
    h1: 'Convert Parquet to',
    h1Highlight: 'CSV Online',
    subtitle: 'Streamline data pipelines by converting Apache Parquet files into standard UTF-8 Comma-Separated Values (.csv) with custom delimiters and filters.',
    category: 'converter',
    tag: 'Fast',
    color: 'indigo',
    iconType: 'csv',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to export standard comma-delimited CSV',
    primaryExport: 'csv',
    defaultTab: 'grid',
    features: [
      {
        icon: 'zap',
        title: 'Ultra-Fast Streaming',
        description: 'DuckDB leverages vectorized execution to unpack and serialize Parquet column pages directly into RFC 4180 compliant CSV.'
      },
      {
        icon: 'shield',
        title: 'Completely Offline & Air-Gapped',
        description: 'Works even without an active internet connection after the page loads. Zero bandwidth consumed uploading files.'
      },
      {
        icon: 'cpu',
        title: 'SQL Filter Before Export',
        description: 'Filter rows or prune unnecessary columns with SQL before exporting to save time and disk space.'
      }
    ],
    faqs: [
      {
        q: 'Does this tool preserve UTF-8 encoding in CSV?',
        a: 'Yes, generated CSV files are encoded in standard UTF-8 with automatic quote escaping for fields containing commas or line breaks.'
      },
      {
        q: 'Can I filter data before downloading the CSV?',
        a: 'Yes! Use the search bar or switch to the SQL Console tab to filter rows and export only the matching slice.'
      }
    ]
  },

  'csv-to-parquet': {
    slug: 'csv-to-parquet',
    path: '/csv-to-parquet',
    badge: 'ZSTD & Snappy Columnar Compression',
    title: 'Convert CSV to Parquet',
    shortTitle: 'CSV to Parquet',
    metaTitle: 'Convert CSV to Parquet Online — High-Compression ZSTD & Snappy',
    metaDescription: 'Convert CSV or TSV files to Apache Parquet (.parquet) directly in your browser with ZSTD or Snappy compression. 100% private local processing.',
    h1: 'Convert CSV to',
    h1Highlight: 'Apache Parquet',
    subtitle: 'Shrink massive CSV/TSV spreadsheets by up to 90% into high-performance, query-optimized Apache Parquet files directly on your machine.',
    category: 'converter',
    tag: 'ZSTD',
    color: 'emerald',
    iconType: 'parquet',
    acceptExtensions: '.csv,.tsv,.txt',
    acceptLabel: 'Drop CSV or TSV files to compress into Apache Parquet (.parquet)',
    primaryExport: 'parquet',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: 'Up to 90% File Size Reduction',
        description: 'Columnar layout with ZSTD or Snappy compression cuts storage footprints compared to bloated raw text CSVs.'
      },
      {
        icon: 'cpu',
        title: 'Automatic Schema Inference',
        description: 'DuckDB intelligently detects column data types (integers, floats, dates, timestamps, boolean) during parsing.'
      },
      {
        icon: 'shield',
        title: 'Private & Secure',
        description: 'Never upload proprietary business spreadsheets to third-party conversion servers. Everything runs in your browser.'
      }
    ],
    faqs: [
      {
        q: 'Which compression codec should I choose?',
        a: 'ZSTD (default) offers the best balance of high compression ratio and decompression speed. Snappy is recommended for legacy Hadoop/Hive systems.'
      },
      {
        q: 'How does DuckDB detect column types in CSV?',
        a: 'DuckDB inspects sample chunks of the CSV to automatically infer correct types rather than storing everything as plain text.'
      }
    ]
  },

  'excel-to-csv': {
    slug: 'excel-to-csv',
    path: '/excel-to-csv',
    badge: 'Fast Local Conversion · UTF-8 Clean',
    title: 'Convert Excel to CSV',
    shortTitle: 'Excel to CSV',
    metaTitle: 'Convert Excel to CSV Online — Extract .xlsx & .xls to UTF-8 CSV',
    metaDescription: 'Convert Microsoft Excel (.xlsx and .xls) workbooks to clean, comma-separated UTF-8 CSV files in your browser. 100% free with zero file uploads.',
    h1: 'Convert Excel to',
    h1Highlight: 'CSV Online',
    subtitle: 'Convert Microsoft Excel spreadsheets into standard RFC 4180 UTF-8 CSV files ready for databases, ETL pipelines, and Python analysis.',
    category: 'converter',
    tag: 'Fast',
    color: 'green',
    iconType: 'csv',
    acceptExtensions: '.xlsx,.xls',
    acceptLabel: 'Drop Microsoft Excel (.xlsx or .xls) file to convert to CSV',
    primaryExport: 'csv',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: 'Clean UTF-8 Formatting',
        description: 'Exports RFC 4180 standard CSV with proper quotes and UTF-8 encoding without Excel character corruption.'
      },
      {
        icon: 'shield',
        title: 'Zero Cloud Storage',
        description: 'Files are processed in memory and immediately discarded. Never stored or logged.'
      },
      {
        icon: 'zap',
        title: 'Works With All Excel Formats',
        description: 'Supports modern .xlsx workbooks as well as legacy .xls spreadsheets.'
      }
    ],
    faqs: [
      {
        q: 'How to convert Excel to CSV without opening Excel?',
        a: 'Drop your Excel file onto TableView above and click "Export CSV". Your CSV will download immediately without needing Microsoft Office.'
      },
      {
        q: 'Will commas in my cells break the CSV columns?',
        a: 'No! Cells containing commas, quotes, or newlines are automatically quoted in compliance with RFC 4180 standards.'
      }
    ]
  },

  'excel-to-parquet': {
    slug: 'excel-to-parquet',
    path: '/excel-to-parquet',
    badge: 'Modernize Spreadsheets to Parquet',
    title: 'Convert Excel to Parquet',
    shortTitle: 'Excel to Parquet',
    metaTitle: 'Convert Excel (.xlsx) to Parquet Online — High-Speed Columnar Converter',
    metaDescription: 'Convert Microsoft Excel (.xlsx, .xls) files directly into optimized Apache Parquet format with ZSTD compression for Databricks, Snowflake & S3.',
    h1: 'Convert Excel to',
    h1Highlight: 'Apache Parquet',
    subtitle: 'Transform Excel business spreadsheets into cloud-ready Apache Parquet columnar files for AWS Athena, Snowflake, Databricks, and BigQuery.',
    category: 'converter',
    color: 'green',
    iconType: 'parquet',
    acceptExtensions: '.xlsx,.xls',
    acceptLabel: 'Drop Excel (.xlsx or .xls) file to convert to Apache Parquet',
    primaryExport: 'parquet',
    defaultTab: 'grid',
    features: [
      {
        icon: 'cpu',
        title: 'Cloud Data Warehouse Ready',
        description: 'Generates standard Apache Parquet with metadata headers ready for S3, AWS Athena, Snowflake, and BigQuery.'
      },
      {
        icon: 'download',
        title: 'Huge Storage Savings',
        description: 'Columnar compression reduces file size by up to 80% compared to bloated Excel XML files.'
      },
      {
        icon: 'shield',
        title: 'Completely Local Execution',
        description: 'Financial models and confidential company spreadsheets remain 100% on your computer.'
      }
    ],
    faqs: [
      {
        q: 'Why convert Excel to Parquet?',
        a: 'Parquet is optimized for analytical queries (OLAP). Cloud query engines like AWS Athena and Snowflake query Parquet 10x to 50x faster than Excel or CSV.'
      }
    ]
  },

  'csv-to-json': {
    slug: 'csv-to-json',
    path: '/csv-to-json',
    badge: 'Tabular to JSON Array / JSONL',
    title: 'Convert CSV to JSON',
    shortTitle: 'CSV to JSON',
    metaTitle: 'Convert CSV to JSON Online — Free Client-Side Tabular Converter',
    metaDescription: 'Convert CSV and TSV tables into clean JSON objects, arrays, and JSON Lines format directly in your browser. 100% private local conversion.',
    h1: 'Convert CSV to',
    h1Highlight: 'JSON Online',
    subtitle: 'Convert comma-separated tables into clean JSON array objects or newline-delimited JSON (NDJSON) format with type preservation.',
    category: 'converter',
    color: 'emerald',
    iconType: 'json',
    acceptExtensions: '.csv,.tsv,.txt',
    acceptLabel: 'Drop CSV or TSV file to convert to JSON',
    primaryExport: 'json',
    defaultTab: 'grid',
    features: [
      {
        icon: 'zap',
        title: 'Structured JSON Output',
        description: 'Outputs formatted JSON arrays where each CSV row becomes a typed JSON object keyed by column names.'
      },
      {
        icon: 'table',
        title: 'Automatic Number & Boolean Parsing',
        description: 'Integers, floats, and booleans are parsed as native JSON types rather than strings.'
      },
      {
        icon: 'shield',
        title: 'Zero Server Uploads',
        description: 'Fast, secure, and offline-capable conversion inside your browser.'
      }
    ],
    faqs: [
      {
        q: 'Does it support nested JSON keys?',
        a: 'If your CSV columns contain serialized JSON, TableView parses and preserves them in the exported JSON output.'
      }
    ]
  },

  'parquet-to-json': {
    slug: 'parquet-to-json',
    path: '/parquet-to-json',
    badge: 'Columnar to JSON Converter',
    title: 'Convert Parquet to JSON',
    shortTitle: 'Parquet to JSON',
    metaTitle: 'Convert Parquet to JSON Online — Fast, In-Browser Converter',
    metaDescription: 'Export Apache Parquet columnar files to formatted JSON arrays and JSON Lines (NDJSON) in your browser with zero server uploads.',
    h1: 'Convert Parquet to',
    h1Highlight: 'JSON Online',
    subtitle: 'Extract binary columnar Parquet records into readable JSON arrays or streaming JSON Lines with full support for nested structs and maps.',
    category: 'converter',
    color: 'indigo',
    iconType: 'json',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to export to JSON',
    primaryExport: 'json',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'Preserves Complex Nested Types',
        description: 'Nested structs, lists, and maps in Parquet are seamlessly exported to native nested JSON objects and arrays.'
      },
      {
        icon: 'zap',
        title: 'Instant In-Browser Processing',
        description: 'Converts Parquet records to JSON directly in memory without uploading files to third-party cloud servers.'
      },
      {
        icon: 'shield',
        title: '100% Private Sandbox',
        description: 'Your data never leaves your browser sandbox.'
      }
    ],
    faqs: [
      {
        q: 'Can I export filtered rows to JSON?',
        a: 'Yes, you can run a SQL query or filter rows in the workbench and export only the matching dataset to JSON.'
      }
    ]
  },

  'json-to-parquet': {
    slug: 'json-to-parquet',
    path: '/json-to-parquet',
    badge: 'Structured & NDJSON Ingestion',
    title: 'Convert JSON to Parquet',
    shortTitle: 'JSON to Parquet',
    metaTitle: 'Convert JSON / JSONL to Parquet Online — In-Browser Converter',
    metaDescription: 'Convert JSON, NDJSON, and JSON Lines into Apache Parquet format locally with schema inference and ZSTD compression.',
    h1: 'Convert JSON to',
    h1Highlight: 'Apache Parquet',
    subtitle: 'Convert JSON arrays, JSON Lines (.jsonl), and NDJSON documents into compact, highly-efficient Apache Parquet columnar files.',
    category: 'converter',
    color: 'amber',
    iconType: 'parquet',
    acceptExtensions: '.json,.jsonl,.ndjson',
    acceptLabel: 'Drop JSON, JSONL, or NDJSON to convert to Apache Parquet',
    primaryExport: 'parquet',
    defaultTab: 'grid',
    features: [
      {
        icon: 'cpu',
        title: 'Supports JSON & JSON Lines',
        description: 'Seamlessly processes standard JSON arrays as well as streaming newline-delimited JSON (NDJSON/JSONL) log dumps.'
      },
      {
        icon: 'zap',
        title: 'Schema Consolidation',
        description: 'Consolidates flexible JSON structures into structured Arrow columns ready for Databricks, Snowflake, or AWS Athena.'
      },
      {
        icon: 'shield',
        title: '100% Client-Side Conversion',
        description: 'No data telemetry or API calls. Confidential API responses and server logs remain strictly local.'
      }
    ],
    faqs: [
      {
        q: 'Does it support NDJSON (newline-delimited JSON)?',
        a: 'Yes! Both .json array files and .jsonl / .ndjson line-by-line dumps are fully supported.'
      }
    ]
  },

  // ==========================================
  // SQL & ANALYTICS (SQL分析与查询)
  // ==========================================
  'sql-workbench': {
    slug: 'sql-workbench',
    path: '/sql-workbench',
    badge: 'Vectorized DuckDB-Wasm Engine',
    title: 'SQL on CSV, Parquet & Excel',
    shortTitle: 'SQL Workbench',
    metaTitle: 'SQL on CSV, Parquet & Excel Online — In-Browser DuckDB Workbench',
    metaDescription: 'Run analytical SQL queries directly on CSV, Parquet, and Excel files in your browser. GROUP BY, window functions, and joins powered by DuckDB-Wasm.',
    h1: 'In-Browser SQL',
    h1Highlight: 'Workbench',
    subtitle: 'Query local Parquet, CSV, Excel, and JSON datasets with high-performance DuckDB SQL. Filter rows, compute aggregations, and export query results without a database server.',
    category: 'sql',
    tag: 'Differentiated',
    color: 'cyan',
    iconType: 'sql',
    acceptExtensions: '.parquet,.geoparquet,.csv,.tsv,.json,.jsonl,.ndjson,.xlsx,.xls',
    acceptLabel: 'Supports Parquet, CSV, Excel (.xlsx/.xls), and JSON files',
    primaryExport: 'any',
    defaultTab: 'sql',
    features: [
      {
        icon: 'cpu',
        title: 'Full Analytical SQL Dialect',
        description: 'Execute GROUP BY, HAVING, subqueries, CTEs (WITH clause), regex matches, and window functions on local files.'
      },
      {
        icon: 'zap',
        title: 'Vectorized SIMD Execution',
        description: 'DuckDB-Wasm executes columnar queries directly on your CPU cores with near-native database speeds.'
      },
      {
        icon: 'download',
        title: 'Export Filtered Slices',
        description: 'Export query results directly to formatted Microsoft Excel (.xlsx), clean CSV, or compressed Parquet.'
      }
    ],
    faqs: [
      {
        q: 'What SQL dialect does this workbench support?',
        a: 'It supports standard PostgreSQL-compatible analytical SQL via DuckDB, including window functions, CTEs, string regex, and date/time functions.'
      },
      {
        q: 'Can I query multiple files or join tables?',
        a: 'Yes! DuckDB can query and join any files loaded into the virtual WebAssembly filesystem.'
      }
    ]
  },

  'parquet-schema-inspector': {
    slug: 'parquet-schema-inspector',
    path: '/parquet-schema-inspector',
    badge: 'Deep Column Profiling & DDL',
    title: 'Parquet Schema & Metadata Inspector',
    shortTitle: 'Schema Inspector',
    metaTitle: 'Parquet Schema & Metadata Inspector Online — DuckDB Powered',
    metaDescription: 'Inspect Apache Parquet schemas, column types, null counts, row groups, and encoding statistics in your browser.',
    h1: 'Parquet Schema &',
    h1Highlight: 'Metadata Inspector',
    subtitle: 'Inspect physical and logical column data types, null percentages, distinct value estimates, and summary statistics without running heavy desktop software.',
    category: 'analysis',
    color: 'purple',
    iconType: 'schema',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to inspect full schema, column stats, and null rates',
    primaryExport: 'schema',
    defaultTab: 'schema',
    features: [
      {
        icon: 'table',
        title: 'Full Column Distribution Profiling',
        description: 'Calculates min, max, avg, standard deviation, quartiles, and exact null rates for every single column.'
      },
      {
        icon: 'cpu',
        title: 'One-Click DDL Generation',
        description: 'Generate copy-paste ready SQL CREATE TABLE statements and Python/Pandas schemas directly from your dataset.'
      },
      {
        icon: 'shield',
        title: 'Private & Instant',
        description: 'Deep metadata extraction occurs directly inside your browser memory in milliseconds.'
      }
    ],
    faqs: [
      {
        q: 'What schema details does this inspector reveal?',
        a: 'It displays column names, physical/logical data types, null percentage, approx unique count, minimum/maximum values, and summary statistics.'
      },
      {
        q: 'Can I export the schema definition?',
        a: 'Yes, you can copy the generated SQL DDL (CREATE TABLE) statement or Python Polars/Pandas type definitions with a single click.'
      }
    ]
  }
};

