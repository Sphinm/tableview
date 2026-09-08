export interface ToolConfig {
  slug: string;
  path: string;
  badge: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h1Highlight: string;
  subtitle: string;
  acceptExtensions: string;
  acceptLabel: string;
  primaryExport: 'excel' | 'csv' | 'parquet' | 'schema' | 'any';
  faqs: { q: string; a: string }[];
  features: {
    icon: 'cpu' | 'shield' | 'download' | 'zap' | 'table';
    title: string;
    description: string;
  }[];
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  'parquet-viewer': {
    slug: 'parquet-viewer',
    path: '/parquet-viewer',
    badge: 'DuckDB-Wasm · Instant Local Parser',
    title: 'Free Online Parquet Viewer',
    metaTitle: 'Free Online Parquet Viewer — Fast, In-Browser Apache Parquet Inspector',
    metaDescription: 'Inspect and view Apache Parquet files online directly in your browser. 100% private in-browser DuckDB-Wasm engine with zero server file uploads.',
    h1: 'Online Apache Parquet',
    h1Highlight: 'Viewer',
    subtitle: 'Drop any .parquet or .geoparquet file to instantly preview table rows, inspect column schemas, and execute SQL queries without installing Python.',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Supports Apache Parquet (.parquet) and GeoParquet (.geoparquet)',
    primaryExport: 'any',
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

  'parquet-to-excel': {
    slug: 'parquet-to-excel',
    path: '/parquet-to-excel',
    badge: 'Client-Side .xlsx Generator',
    title: 'Parquet to Excel Converter',
    metaTitle: 'Convert Parquet to Excel (.xlsx) Online — Free & 100% Private',
    metaDescription: 'Convert Apache Parquet files directly to native Microsoft Excel (.xlsx) workbooks in your browser. Instant client-side conversion with no file size limits.',
    h1: 'Convert Parquet to',
    h1Highlight: 'Excel (.xlsx)',
    subtitle: 'Transform complex columnar Parquet datasets into clean, beautifully formatted Microsoft Excel spreadsheets with proper headers and data types.',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to export directly to Microsoft Excel (.xlsx)',
    primaryExport: 'excel',
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
      },
      {
        q: 'Is there a row limit when converting to Excel?',
        a: 'Excel (.xlsx) has a format limit of 1,048,576 rows. For datasets exceeding this limit, you can use our "Convert to CSV" or "Convert to Parquet" tools.'
      }
    ]
  },

  'parquet-to-csv': {
    slug: 'parquet-to-csv',
    path: '/parquet-to-csv',
    badge: 'High-Throughput In-Memory Stream',
    title: 'Parquet to CSV Converter',
    metaTitle: 'Convert Parquet to CSV Online — In-Browser High Speed Converter',
    metaDescription: 'Extract and export Apache Parquet files to Comma-Separated Values (.csv). Zero server uploads, instant streaming DuckDB-Wasm engine.',
    h1: 'Convert Parquet to',
    h1Highlight: 'CSV Online',
    subtitle: 'Streamline data pipelines by converting Apache Parquet files into standard UTF-8 Comma-Separated Values (.csv) with custom delimiters and filters.',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to export standard comma-delimited CSV',
    primaryExport: 'csv',
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
        a: 'Yes! Use the search bar or switch to the SQL Console tab to filter rows (e.g. WHERE status = "ACTIVE") and export only the matching slice.'
      }
    ]
  },

  'csv-to-parquet': {
    slug: 'csv-to-parquet',
    path: '/csv-to-parquet',
    badge: 'ZSTD & Snappy Columnar Compression',
    title: 'CSV to Parquet Converter',
    metaTitle: 'Convert CSV to Parquet Online — High-Compression ZSTD & Snappy',
    metaDescription: 'Convert CSV or TSV files to Apache Parquet (.parquet) directly in your browser with ZSTD or Snappy compression. 100% private local processing.',
    h1: 'Convert CSV to',
    h1Highlight: 'Apache Parquet',
    subtitle: 'Shrink massive CSV/TSV spreadsheets by up to 90% into high-performance, query-optimized Apache Parquet files directly on your machine.',
    acceptExtensions: '.csv,.tsv,.txt',
    acceptLabel: 'Drop CSV or TSV files to compress into Apache Parquet (.parquet)',
    primaryExport: 'parquet',
    features: [
      {
        icon: 'download',
        title: 'Up to 90% File Size Reduction',
        description: 'Columnar layout with ZSTD or Snappy compression drastically cuts storage footprints compared to bloated raw text CSVs.'
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
        a: 'ZSTD (default) offers the best balance of high compression ratio and decompression speed. Snappy is recommended if you plan to query with legacy Hadoop/Hive systems.'
      },
      {
        q: 'How does DuckDB detect column types in CSV?',
        a: 'DuckDB inspects sample chunks of the CSV to automatically infer correct types (integers, doubles, timestamps, boolean) rather than storing everything as plain text.'
      }
    ]
  },

  'json-to-parquet': {
    slug: 'json-to-parquet',
    path: '/json-to-parquet',
    badge: 'Structured & NDJSON Ingestion',
    title: 'JSON to Parquet Converter',
    metaTitle: 'Convert JSON / JSONL to Parquet Online — In-Browser Converter',
    metaDescription: 'Convert JSON, NDJSON, and JSON Lines into Apache Parquet format locally with schema inference and ZSTD compression.',
    h1: 'Convert JSON to',
    h1Highlight: 'Apache Parquet',
    subtitle: 'Convert JSON arrays, JSON Lines (.jsonl), and NDJSON documents into compact, highly-efficient Apache Parquet columnar files.',
    acceptExtensions: '.json,.jsonl,.ndjson',
    acceptLabel: 'Drop JSON, JSONL, or NDJSON to convert to Apache Parquet',
    primaryExport: 'parquet',
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
      },
      {
        q: 'Can I query the JSON with SQL before converting?',
        a: 'Yes, once loaded you can inspect the schema, run SQL queries in the console, and export either the whole table or filtered results.'
      }
    ]
  },

  'parquet-schema-inspector': {
    slug: 'parquet-schema-inspector',
    path: '/parquet-schema-inspector',
    badge: 'Deep Column Profiling & DDL',
    title: 'Parquet Schema & Metadata Inspector',
    metaTitle: 'Parquet Schema & Metadata Inspector Online — DuckDB Powered',
    metaDescription: 'Inspect Apache Parquet schemas, column types, null counts, row groups, and encoding statistics in your browser.',
    h1: 'Parquet Schema &',
    h1Highlight: 'Metadata Inspector',
    subtitle: 'Inspect physical and logical column data types, null percentages, distinct value estimates, and summary statistics without running heavy desktop software.',
    acceptExtensions: '.parquet,.geoparquet',
    acceptLabel: 'Drop .parquet to inspect full schema, column stats, and null rates',
    primaryExport: 'schema',
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
