export type ToolCategory = 'viewer' | 'converter' | 'sql' | 'analysis' | 'calculator' | 'media' | 'developer';

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
  iconType: 'csv' | 'excel' | 'parquet' | 'json' | 'sql' | 'schema' | 'calculator' | 'building' | 'hammer' | 'server' | 'savings' | 'home' | 'refinance' | 'video' | 'image' | 'file';
  acceptExtensions: string;
  acceptLabel: string;
  primaryExport: 'excel' | 'csv' | 'parquet' | 'json' | 'schema' | 'any';
  defaultTab?: 'grid' | 'schema' | 'sql' | 'json';
  faqs: { q: string; a: string }[];
  features: {
    icon: 'cpu' | 'shield' | 'download' | 'zap' | 'table' | 'database' | 'search';
    title: string;
    description: string;
  }[];
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  // ==========================================
  // VIEWERS
  // ==========================================
  'csv-viewer': {
    slug: 'csv-viewer',
    path: '/csv-viewer',
    badge: '100% In-Browser · Instant CSV Reader',
    title: 'Free Online CSV Viewer',
    shortTitle: 'CSV Viewer',
    metaTitle: 'Free Online CSV Viewer & Spreadsheet Reader | TableView',
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
    metaTitle: 'Free Online Excel Viewer (.xlsx) | TableView',
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
    metaTitle: 'Free Online Parquet Viewer & Inspector | TableView',
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
        icon: 'database',
        title: 'DuckDB-Wasm Columnar Parsing',
        description: 'Direct binary reader for snappy, gzip, zstd, and uncompressed Parquet data pages.'
      },
      {
        icon: 'search',
        title: 'Schema & Metadata Inspector',
        description: 'Examine field types, nested structs, physical compression algorithms, and row group counts.'
      },
      {
        icon: 'shield',
        title: 'Zero Cloud Storage Risk',
        description: 'Data engineering datasets stay on your workstation. Absolutely zero network requests during analysis.'
      }
    ],
    faqs: [
      {
        q: 'How does TableView open Parquet files without a backend server?',
        a: 'TableView compiles DuckDB and Apache Arrow directly into WebAssembly (Wasm). When you drop a .parquet file, your browser executes the C++ query engine natively inside your tab.'
      },
      {
        q: 'Can I inspect compression codecs and metadata?',
        a: 'Yes! TableView displays the complete Parquet metadata header, including row group distribution, dictionary pages, and compression codecs (Snappy, ZSTD, GZIP, LZ4).'
      }
    ]
  },

  'json-viewer': {
    slug: 'json-viewer',
    path: '/json-viewer',
    badge: 'Tabular & Tree Views · Client-Side',
    title: 'Free Online JSON Viewer & Tabular Inspector',
    shortTitle: 'JSON Viewer',
    metaTitle: 'Free Online JSON & NDJSON Viewer | TableView',
    metaDescription: 'Inspect, search, and flatten complex JSON documents and NDJSON lines into interactive tables in your browser. 100% private with DuckDB-Wasm.',
    h1: 'Free Online JSON',
    h1Highlight: 'Viewer',
    subtitle: 'Drop JSON files or NDJSON streams to automatically flatten nested keys, search values, sort arrays, and run SQL without uploading data.',
    category: 'viewer',
    color: 'amber',
    iconType: 'json',
    acceptExtensions: '.json,.jsonl,.ndjson',
    acceptLabel: 'Supports standard JSON (.json), JSON Lines (.jsonl), and NDJSON (.ndjson)',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'Auto-Flatten Nested Objects',
        description: 'Automatically unpacks nested JSON objects and arrays into clean, sortable tabular columns.'
      },
      {
        icon: 'zap',
        title: 'NDJSON & JSON Lines Support',
        description: 'Seamlessly reads line-delimited JSON logs and streaming event records.'
      },
      {
        icon: 'shield',
        title: 'Confidential API Payloads Safe',
        description: 'Inspect production payload logs and API secrets with complete confidence. Nothing leaves your browser.'
      }
    ],
    faqs: [
      {
        q: 'Does it support nested JSON structures?',
        a: 'Yes! DuckDB automatically infers schemas and provides dot-notation access to nested properties, flattening records into clean spreadsheet grids.'
      },
      {
        q: 'Can I open large NDJSON / JSON Lines files?',
        a: 'Yes, TableView streams and parses JSON Lines line-by-line in WebAssembly, making it fast and memory-efficient even on massive server logs.'
      }
    ]
  },

  // ==========================================
  // CONVERTERS
  // ==========================================
  'data-converter': {
    slug: 'data-converter',
    path: '/data-converter',
    badge: '100% In-Browser · DuckDB Wasm · Zero Uploads',
    title: 'Universal Data Converter (CSV, Excel, Parquet, JSON)',
    shortTitle: 'Data Converter',
    metaTitle: 'Convert CSV, Excel, Parquet & JSON Online | TableView',
    metaDescription: 'Convert datasets between Apache Parquet, Microsoft Excel (.xlsx), CSV, and JSON 100% in your browser. Fast DuckDB-Wasm engine, zero server uploads.',
    h1: 'Universal In-Browser',
    h1Highlight: 'Data Converter',
    subtitle: 'Transform datasets between Apache Parquet, Excel (.xlsx), CSV, and JSON with ZSTD compression and instant downloads in client-side WebAssembly.',
    category: 'converter',
    tag: 'Flagship',
    color: 'indigo',
    iconType: 'parquet',
    acceptExtensions: '.parquet,.geoparquet,.csv,.tsv,.xlsx,.xls,.json,.ndjson,.jsonl',
    acceptLabel: 'Drop CSV, Excel, Parquet, or JSON to convert formats',
    primaryExport: 'parquet',
    defaultTab: 'grid',
    features: [
      {
        icon: 'zap',
        title: 'All-in-One Format Conversion',
        description: 'Effortlessly switch between CSV, Excel, Parquet, and JSON in one unified workspace.'
      },
      {
        icon: 'shield',
        title: '100% Client-Side Privacy',
        description: 'All conversions run strictly in local browser memory. Sensitive datasets are never sent to external servers.'
      },
      {
        icon: 'download',
        title: 'High-Ratio ZSTD Compression',
        description: 'Compress bulky text spreadsheets into high-speed columnar Parquet files up to 90% smaller.'
      }
    ],
    faqs: [
      {
        q: 'Which formats can I convert between?',
        a: 'You can convert between CSV, TSV, Microsoft Excel (.xlsx), Apache Parquet, and JSON / NDJSON in any combination.'
      },
      {
        q: 'Do my files get uploaded to a cloud server?',
        a: 'No. Conversions run entirely inside your browser tab using DuckDB-Wasm and SheetJS in local RAM.'
      }
    ]
  },

  'csv-to-excel': {
    slug: 'csv-to-excel',
    path: '/csv-to-excel',
    badge: '1-Click Local .xlsx Generator',
    title: 'Convert CSV to Excel (.xlsx)',
    shortTitle: 'CSV to Excel',
    metaTitle: 'Convert CSV to Excel (.xlsx) Online Free | TableView',
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
    metaTitle: 'Convert Parquet to Excel (.xlsx) Online Free | TableView',
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
    metaTitle: 'Convert Parquet to CSV Online Free | TableView',
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
    metaTitle: 'Convert CSV to Parquet Online (ZSTD) | TableView',
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
    metaTitle: 'Convert Excel (.xlsx) to CSV Online Free | TableView',
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
    metaTitle: 'Convert Excel (.xlsx) to Parquet Online | TableView',
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
    metaTitle: 'Convert CSV to JSON Online Free | TableView',
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
    metaTitle: 'Convert Parquet to JSON Online Free | TableView',
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
    metaTitle: 'Convert JSON / JSONL to Parquet Online | TableView',
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
  // SQL & ANALYTICS
  // ==========================================
  'sql-workbench': {
    slug: 'sql-workbench',
    path: '/sql-workbench',
    badge: 'Vectorized DuckDB-Wasm Engine',
    title: 'SQL on CSV, Parquet & Excel',
    shortTitle: 'SQL Workbench',
    metaTitle: 'SQL on CSV, Parquet & Excel (DuckDB) | TableView',
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
    metaTitle: 'Parquet Schema & Metadata Inspector | TableView',
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
  },

  // ==========================================
  // CALCULATORS
  // ==========================================


  'snowflake-cost-calculator': {
    slug: 'snowflake-cost-calculator',
    path: '/snowflake-cost-calculator',
    badge: 'Cloud FinOps · Virtual Warehouse Modeler',
    title: 'Snowflake Warehouse Cost Calculator',
    shortTitle: 'Snowflake FinOps',
    metaTitle: 'Snowflake Cost & Credit Calculator | TableView',
    metaDescription: 'Estimate Snowflake compute credits, multi-cluster autoscaling costs, auto-suspend idle savings, and compressed cloud storage costs.',
    h1: 'Snowflake Warehouse Cost',
    h1Highlight: 'Calculator',
    subtitle: 'Model Snowflake virtual warehouse compute credits, cluster autoscaling, auto-suspend FinOps savings, and compressed cloud storage economics.',
    category: 'calculator',
    tag: 'Cloud FinOps',
    color: 'cyan',
    iconType: 'server',
    acceptExtensions: 'Interactive FinOps Model',
    acceptLabel: 'No file upload needed · Instant warehouse sizing & credit cost estimator',
    primaryExport: 'excel',
    defaultTab: 'grid',
    features: [
      {
        icon: 'cpu',
        title: 'T-Shirt Sizing & Cluster Matrix',
        description: 'Full credit consumption matrix from X-Small (1 credit/hr) up to 6X-Large (512 credits/hr).'
      },
      {
        icon: 'zap',
        title: 'Auto-Suspend FinOps Simulator',
        description: 'Calculates exact dollar waste from idle warehouses and demonstrates savings from 60-second auto-suspend.'
      },
      {
        icon: 'download',
        title: 'Excel Budget Export',
        description: 'Download executive cloud compute budget breakdowns directly into Microsoft Excel (.xlsx).'
      }
    ],
    faqs: [
      {
        q: 'How much does 1 Snowflake compute credit cost?',
        a: 'Standard Edition is approximately $2.00/credit, Enterprise Edition is $3.00/credit, and Business Critical is $4.00/credit.'
      },
      {
        q: 'How does auto-suspend reduce Snowflake bills?',
        a: 'Setting auto-suspend to 1 minute prevents warehouses from billing credits while waiting for queries during idle periods.'
      }
    ]
  },

  'parquet-storage-calculator': {
    slug: 'parquet-storage-calculator',
    path: '/parquet-storage-calculator',
    badge: 'Data Lake FinOps · Storage & Scan Savings',
    title: 'Parquet Storage & Query Savings Calculator',
    shortTitle: 'Cloud Storage Savings',
    metaTitle: 'Parquet S3 & Athena Cloud Savings Calculator | TableView',
    metaDescription: 'Calculate exact cloud storage byte reduction, AWS S3 monthly cost cuts, and Athena/BigQuery columnar projection scan savings when migrating from CSV/JSON to Parquet.',
    h1: 'Parquet Cloud Storage &',
    h1Highlight: 'Scan Savings',
    subtitle: 'Calculate AWS S3 byte reduction, monthly storage savings, and Amazon Athena / Google BigQuery query scan cost cuts achieved by migrating to Apache Parquet.',
    category: 'calculator',
    tag: 'S3 & Athena',
    color: 'emerald',
    iconType: 'savings',
    acceptExtensions: 'Interactive Lakehouse Model',
    acceptLabel: 'No file upload needed · Instant cloud storage & query scan cost estimator',
    primaryExport: 'excel',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: '5x–10x Storage Compression Factor',
        description: 'Calculates exact S3 standard storage dollar savings when moving away from bulky uncompressed CSV/JSON.'
      },
      {
        icon: 'zap',
        title: 'Athena & BigQuery Scan Cuts',
        description: 'Models columnar projection pushdown where queries only scan 10%–20% of dataset bytes, reducing per-TB query bills.'
      },
      {
        icon: 'shield',
        title: '100% Private In-Browser Math',
        description: 'Estimate enterprise petabyte storage migrations without uploading architecture details.'
      }
    ],
    faqs: [
      {
        q: 'Why does Parquet save 80%+ on Athena and BigQuery?',
        a: 'Because Parquet is columnar, analytical queries only scan columns in the SELECT and WHERE clauses instead of full row scans.'
      },
      {
        q: 'How much does Snappy/ZSTD compress CSV data?',
        a: 'Typical enterprise tabular data achieves 75% to 85% byte compression when converted from CSV to Parquet.'
      }
    ]
  },








  'json-formatter': {
    slug: 'json-formatter',
    path: '/json-formatter',
    badge: '100% In-Browser · Private JSON Validator',
    title: 'Free Online JSON Formatter & Validator',
    shortTitle: 'JSON Formatter',
    metaTitle: 'Online JSON Formatter & Validator | TableView',
    metaDescription: 'Format, indent, validate, and minify JSON online. 100% private in-browser tool with line and column syntax error detection. Zero server uploads.',
    h1: 'Free Online JSON',
    h1Highlight: 'Formatter & Validator',
    subtitle: 'Beautify, validate, fix, and minify JSON files directly in your web browser. 100% client-side privacy with precise syntax error pinpointer.',
    category: 'converter',
    tag: 'Popular',
    color: 'amber',
    iconType: 'json',
    acceptExtensions: '.json,.jsonl,.txt',
    acceptLabel: 'Drop or paste any JSON string or file · Zero server transmission',
    primaryExport: 'json',
    defaultTab: 'json',
    features: [
      {
        icon: 'shield',
        title: '100% Zero-Egress Privacy',
        description: 'Your JSON payloads never leave your computer. Completely safe for API keys, tokens, and confidential customer records.'
      },
      {
        icon: 'zap',
        title: 'Line & Column Syntax Error Pinpointer',
        description: 'Instantly identifies misplaced commas, unquoted keys, and mismatched braces with exact line and column numbers.'
      },
      {
        icon: 'download',
        title: 'Instant Minify & Beautify',
        description: 'Toggle between clean 2-space / 4-space / tab indentation and ultra-compact single-line minified JSON.'
      }
    ],
    faqs: [
      {
        q: 'Does this JSON formatter upload my data to any remote server?',
        a: 'No! The JSON formatter operates 100% locally in your web browser using JavaScript and WebAssembly. Your data never leaves your computer, making it completely safe for API keys, confidential customer records, and production tokens.'
      },
      {
        q: 'How does the in-browser JSON validator pinpoint syntax errors?',
        a: 'The parser analyzes JSON character by character. When invalid tokens, unquoted keys, trailing commas, or unclosed braces are encountered, it identifies the exact line number, column offset, and unexpected character snippet.'
      },
      {
        q: 'Can this tool format large JSON files with thousands of lines?',
        a: 'Yes, modern browser V8 engines can format multi-megabyte JSON payloads in milliseconds. For files exceeding hundreds of megabytes, you can also use TableView\'s DuckDB SQL engine to query NDJSON/JSONL directly.'
      },
      {
        q: 'What is the difference between JSON minification and beautification?',
        a: 'Beautification adds standard 2-space or 4-space indentation and line breaks for human readability. Minification strips all unnecessary whitespace, comments, and newlines to compress file size for HTTP transmission and API payloads.'
      }
    ]
  },

  'sql-formatter': {
    slug: 'sql-formatter',
    path: '/sql-formatter',
    badge: '100% In-Browser · Multi-Dialect SQL Formatter',
    title: 'Free Online SQL Formatter & Beautifier',
    shortTitle: 'SQL Formatter',
    metaTitle: 'Online SQL Formatter & Beautifier | TableView',
    metaDescription: 'Beautify, indent, format, and minify SQL queries online. Supports DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, and BigQuery. 100% in-browser.',
    h1: 'Free Online SQL',
    h1Highlight: 'Formatter & Beautifier',
    subtitle: 'Format, indent, beautify, and minify SQL queries across DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, and BigQuery. 100% in-browser.',
    category: 'sql',
    tag: 'Dev Tool',
    color: 'cyan',
    iconType: 'sql',
    acceptExtensions: '.sql,.txt',
    acceptLabel: 'Paste or type SQL queries · Multi-dialect formatting with DuckDB execution',
    primaryExport: 'any',
    defaultTab: 'sql',
    features: [
      {
        icon: 'table',
        title: 'Multi-Dialect Formatting Engine',
        description: 'Formatted by sql-formatter with support for DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, BigQuery, and Redshift.'
      },
      {
        icon: 'zap',
        title: '1-Click DuckDB Execution',
        description: 'Direct shortcut to run formatted queries against local CSV, Parquet, or Excel files in DuckDB-Wasm.'
      },
      {
        icon: 'shield',
        title: 'Confidential Query Privacy',
        description: 'Zero database schema or proprietary query logic ever leaves your device. Runs 100% client-side.'
      }
    ],
    faqs: [
      {
        q: 'Which SQL dialects are supported by this formatter?',
        a: 'Our SQL formatter supports DuckDB, PostgreSQL, MySQL, SQLite, Snowflake, Amazon Redshift, Google BigQuery, MariaDB, Transact-SQL (T-SQL), Spark SQL, and standard ANSI SQL.'
      },
      {
        q: 'Can I execute queries directly after formatting?',
        a: 'Yes! You can click "Open in DuckDB SQL Workbench" to immediately execute the formatted SQL query against local CSV, Parquet, or Excel files in your browser with zero database installation.'
      },
      {
        q: 'Is my SQL query or schema sent to external servers?',
        a: 'No. Formatting is executed entirely on your client device inside browser JavaScript. Confidential database schemas, table names, and proprietary business logic remain 100% private.'
      },
      {
        q: 'What does SQL Minify do?',
        a: 'SQL Minify removes redundant whitespace, comments, and line breaks to compress queries into a single compact string. This is ideal for embedding queries into source code, application config files, or URL parameters.'
      }
    ]
  },

  'json-to-csv': {
    slug: 'json-to-csv',
    path: '/json-to-csv',
    badge: '100% In-Browser · Instant JSON to CSV',
    title: 'Free Online JSON to CSV Converter',
    shortTitle: 'JSON to CSV',
    metaTitle: 'Convert JSON to CSV Online Free & Private | TableView',
    metaDescription: 'Convert JSON arrays, NDJSON, and nested objects to formatted CSV files directly in your web browser. 100% private, client-side DuckDB-Wasm with zero server uploads.',
    h1: 'Free Online JSON to',
    h1Highlight: 'CSV Converter',
    subtitle: 'Drop any .json, .jsonl, or .ndjson file to convert JSON into clean, standard UTF-8 CSV spreadsheets in seconds with zero server file uploads.',
    category: 'converter',
    tag: 'Popular',
    color: 'amber',
    iconType: 'csv',
    acceptExtensions: '.json,.jsonl,.ndjson,.txt',
    acceptLabel: 'Drop JSON (.json), JSON Lines (.jsonl), or NDJSON to convert to CSV',
    primaryExport: 'csv',
    defaultTab: 'grid',
    features: [
      {
        icon: 'download',
        title: 'RFC 4180 Compliant CSV',
        description: 'Properly escapes quotes, handles nested objects, and ensures clean UTF-8 comma-separated text.'
      },
      {
        icon: 'shield',
        title: 'Zero Cloud Storage or Egress',
        description: 'All JSON parsing, flattening, and conversion runs locally in browser WebAssembly memory.'
      },
      {
        icon: 'zap',
        title: 'Streams Large JSON & NDJSON',
        description: 'Powered by DuckDB read_json_auto for blazing-fast handling of large files.'
      }
    ],
    faqs: [
      {
        q: 'How do I convert JSON to CSV without uploading to an external server?',
        a: 'Drop your .json or .jsonl file onto TableView above and click "Export CSV". The file is parsed locally in your browser tab using WebAssembly and saved directly to your computer.'
      },
      {
        q: 'Can this tool convert JSON Lines (NDJSON) to CSV?',
        a: 'Yes! Both standard hierarchical JSON arrays and newline-delimited JSON Lines (NDJSON/JSONL) are automatically detected and converted into tabular CSV.'
      },
      {
        q: 'What happens to nested JSON objects and arrays?',
        a: 'DuckDB automatically flattens first-level scalar attributes and serializes nested objects and lists into structured text columns.'
      }
    ]
  },

  'json-to-excel': {
    slug: 'json-to-excel',
    path: '/json-to-excel',
    badge: 'Client-Side · Formatted .xlsx Export',
    title: 'Free Online JSON to Excel Converter (.xlsx)',
    shortTitle: 'JSON to Excel',
    metaTitle: 'Convert JSON to Excel (.xlsx) Online Free | TableView',
    metaDescription: 'Convert JSON and NDJSON files into formatted Microsoft Excel (.xlsx) spreadsheets online. 100% private in-browser conversion with zero cloud uploads.',
    h1: 'Free Online JSON to',
    h1Highlight: 'Excel Converter (.xlsx)',
    subtitle: 'Transform JSON arrays and nested data into multi-column Excel workbooks directly in your browser without uploading confidential data.',
    category: 'converter',
    tag: 'Popular',
    color: 'green',
    iconType: 'excel',
    acceptExtensions: '.json,.jsonl,.ndjson,.txt',
    acceptLabel: 'Drop JSON (.json) or JSON Lines (.jsonl) to convert to Excel (.xlsx)',
    primaryExport: 'excel',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'Formatted Microsoft Excel Output',
        description: 'Generates genuine binary .xlsx workbooks with proper column headers and data type recognition.'
      },
      {
        icon: 'shield',
        title: 'Zero Cloud Uploads',
        description: 'Your sensitive JSON feeds and API records never leave your local machine.'
      },
      {
        icon: 'zap',
        title: 'Fast Client-Side Generation',
        description: 'Utilizes SheetJS and DuckDB-Wasm for high-performance in-memory spreadsheet construction.'
      }
    ],
    faqs: [
      {
        q: 'Can I open the generated Excel file in Microsoft Excel or Google Sheets?',
        a: 'Yes! The exported file is an industry-standard OpenXML spreadsheet (.xlsx) fully compatible with Microsoft Excel, Google Sheets, Apple Numbers, and LibreOffice Calc.'
      },
      {
        q: 'Is there a limit on how many JSON rows can be exported to Excel?',
        a: 'Microsoft Excel supports up to 1,048,576 rows per worksheet. TableView handles large JSON datasets up to Excel\'s native limits.'
      },
      {
        q: 'Are dates and numbers formatted properly in the resulting spreadsheet?',
        a: 'Yes, numeric values, timestamps, and ISO date strings are parsed and formatted as appropriate Excel column types.'
      }
    ]
  },

  'excel-to-json': {
    slug: 'excel-to-json',
    path: '/excel-to-json',
    badge: 'Zero Server Upload · Fast Spreadsheet to JSON',
    title: 'Free Online Excel to JSON Converter (.xlsx to JSON)',
    shortTitle: 'Excel to JSON',
    metaTitle: 'Convert Excel (.xlsx) to JSON Online Free | TableView',
    metaDescription: 'Convert Microsoft Excel spreadsheets (.xlsx, .xls) to clean JSON array data online. Fast, secure in-browser parser with zero server file uploads.',
    h1: 'Free Online Excel to',
    h1Highlight: 'JSON Converter',
    subtitle: 'Drop any Excel workbook (.xlsx or .xls) to convert rows into clean, structured JSON format with zero server uploads.',
    category: 'converter',
    tag: 'Dev Tool',
    color: 'amber',
    iconType: 'json',
    acceptExtensions: '.xlsx,.xls',
    acceptLabel: 'Drop Microsoft Excel (.xlsx or .xls) file to convert to JSON',
    primaryExport: 'json',
    defaultTab: 'json',
    features: [
      {
        icon: 'download',
        title: 'Clean JSON Array Export',
        description: 'Transforms spreadsheet rows into an array of structured JSON objects with column headers as object keys.'
      },
      {
        icon: 'shield',
        title: 'Confidential Records Stay Private',
        description: 'Internal financial sheets and user rosters are parsed locally without reaching third-party servers.'
      },
      {
        icon: 'zap',
        title: 'Multi-Sheet Workbook Support',
        description: 'Inspect and convert any worksheet within multi-tab Excel workbooks.'
      }
    ],
    faqs: [
      {
        q: 'How does TableView convert Excel rows into JSON?',
        a: 'TableView parses the workbook client-side using SheetJS and DuckDB, using the first row as object keys and subsequent rows as values in a clean JSON array.'
      },
      {
        q: 'Does it support older .xls binary Excel files?',
        a: 'Yes, both modern XML Excel spreadsheets (.xlsx) and legacy binary Excel files (.xls) are supported.'
      },
      {
        q: 'Can I copy the JSON directly to my clipboard?',
        a: 'Yes, you can preview the generated JSON in our built-in JSON inspector, format it with indentation, and copy it to your clipboard with one click.'
      }
    ]
  },

  'tsv-viewer': {
    slug: 'tsv-viewer',
    path: '/tsv-viewer',
    badge: '100% In-Browser · Instant TSV Reader',
    title: 'Free Online TSV Viewer & Query Console',
    shortTitle: 'TSV Viewer',
    metaTitle: 'Free Online TSV Viewer & Query Tool | TableView',
    metaDescription: 'Open, search, filter, and execute SQL queries on tab-separated value (.tsv) files online. 100% private client-side DuckDB with zero server file uploads.',
    h1: 'Free Online TSV',
    h1Highlight: 'Viewer & Console',
    subtitle: 'Open large tab-separated values (.tsv) files instantly in your browser. Inspect schemas, filter records, and export to Excel, CSV, or Parquet.',
    category: 'viewer',
    color: 'cyan',
    iconType: 'csv',
    acceptExtensions: '.tsv,.txt',
    acceptLabel: 'Supports Tab-Separated Values (.tsv) and tab-delimited text files',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'Accurate Tab Delimiter Parsing',
        description: 'Automatically detects tab delimiters (\\t) without delimiter confusion on text containing commas.'
      },
      {
        icon: 'shield',
        title: 'Zero Server Uploads',
        description: 'Processes large genomics, bioinformatics, and TSV data feeds locally inside browser RAM.'
      },
      {
        icon: 'zap',
        title: 'DuckDB SQL Analysis Built-In',
        description: 'Filter, aggregate, and query TSV files using full standard analytical SQL syntax.'
      }
    ],
    faqs: [
      {
        q: 'What is the difference between CSV and TSV files?',
        a: 'CSV uses commas (,) as delimiters, whereas TSV uses tabs (\\t). TSV is especially popular in genomics, bioinformatics, and log processing because data fields frequently contain commas.'
      },
      {
        q: 'Can I convert my TSV file to Excel or CSV?',
        a: 'Yes! After dropping your TSV file, you can export it to formatted Microsoft Excel (.xlsx), standard CSV, or Apache Parquet with one click.'
      },
      {
        q: 'How large of a TSV file can I open?',
        a: 'Because parsing occurs client-side in WebAssembly, you can comfortably open TSV files with hundreds of thousands of rows depending on your device RAM.'
      }
    ]
  },

  'geoparquet-viewer': {
    slug: 'geoparquet-viewer',
    path: '/geoparquet-viewer',
    badge: 'DuckDB-Wasm Spatial · GeoParquet Inspector',
    title: 'Free Online GeoParquet Viewer & Schema Inspector',
    shortTitle: 'GeoParquet Viewer',
    metaTitle: 'Free Online GeoParquet Viewer & Inspector | TableView',
    metaDescription: 'Inspect and view GeoParquet (.geoparquet) files directly in your web browser. Examine bounding box metadata, spatial column types, and run analytical SQL queries.',
    h1: 'Online GeoParquet',
    h1Highlight: 'Viewer & Schema Inspector',
    subtitle: 'Preview geospatial Parquet datasets, inspect WKB/WKT geometry columns, examine bounding box metadata, and run spatial SQL queries in WebAssembly.',
    category: 'viewer',
    tag: 'GIS Tool',
    color: 'indigo',
    iconType: 'parquet',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Supports GeoParquet (.geoparquet) and Apache Parquet (.parquet)',
    primaryExport: 'any',
    defaultTab: 'grid',
    features: [
      {
        icon: 'table',
        title: 'GeoParquet Metadata Inspection',
        description: 'Inspect file-level geospatial metadata, coordinate reference systems (CRS), and geometry encodings.'
      },
      {
        icon: 'shield',
        title: '100% In-Browser GIS Privacy',
        description: 'Proprietary spatial boundaries, LiDAR scans, and GIS datasets remain strictly on your local computer.'
      },
      {
        icon: 'zap',
        title: 'DuckDB Spatial SQL Queries',
        description: 'Filter spatial features by bounding box, compute row counts, and inspect geometry columns.'
      }
    ],
    faqs: [
      {
        q: 'What is GeoParquet?',
        a: 'GeoParquet is an open geospatial vector data format built on Apache Parquet. It adds standardized metadata for geometry columns (points, lines, polygons) encoded in WKB (Well-Known Binary) format.'
      },
      {
        q: 'Can TableView open both .geoparquet and standard .parquet files?',
        a: 'Yes, TableView seamlessly parses both standard Apache Parquet files and GeoParquet files with spatial metadata.'
      },
      {
        q: 'Can I export GeoParquet records to Excel or CSV?',
        a: 'Yes, all tabular attributes and geometry representations can be exported to Excel, CSV, or JSON.'
      }
    ]
  },


};


