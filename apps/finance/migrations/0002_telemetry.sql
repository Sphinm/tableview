-- Migration: 0002_telemetry.sql
-- Behaviour telemetry ingested by POST /api/track.
--
-- Lives in the dedicated `tableview_logs` D1 database, separate from
-- `tableview_db` (which holds identity and credits), so analytics volume can
-- never contend with authentication traffic.
--
-- One row per event. Country is derived at the edge from the connection and is
-- the coarsest useful geography; no IP address is read or stored.

CREATE TABLE IF NOT EXISTS telemetry_events (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id          TEXT    NOT NULL,
  app                 TEXT    NOT NULL,
  path                TEXT,
  event_type          TEXT    NOT NULL, -- c=click r=route e=error a=custom action
  name                TEXT    NOT NULL,
  detail              TEXT,             -- JSON, capped on ingest
  t_offset_ms         INTEGER,          -- ms since session start
  country             TEXT,             -- ISO 3166-1 alpha-2, from request.cf
  received_at         INTEGER NOT NULL, -- epoch ms, when the batch arrived
  session_duration_s  INTEGER,
  session_active_s    INTEGER,
  session_actions     INTEGER,
  session_errors      INTEGER
);

-- Reporting reads are almost always "recent window, grouped by country/app".
CREATE INDEX IF NOT EXISTS idx_telemetry_received_at ON telemetry_events(received_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_country      ON telemetry_events(country);
CREATE INDEX IF NOT EXISTS idx_telemetry_app_type     ON telemetry_events(app, event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_session      ON telemetry_events(session_id);
