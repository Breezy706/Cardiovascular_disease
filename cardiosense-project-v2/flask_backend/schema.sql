-- CardioSense database schema
-- Import this file via phpMyAdmin (Import tab) or run:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS cardiosense CHARACTER SET utf8mb4;
USE cardiosense;

CREATE TABLE IF NOT EXISTS patients (
  id            VARCHAR(20)  NOT NULL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  age           INT          NOT NULL,
  sex           ENUM('M','F') NOT NULL,
  bp            INT          NOT NULL,
  chol          INT          NOT NULL,
  risk          ENUM('High','Low') NOT NULL,
  probability   DECIMAL(6,4) NOT NULL,
  date          DATE         NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Starting data (Jamal Washington removed as requested)
INSERT INTO patients (id, name, age, sex, bp, chol, risk, probability, date) VALUES
  ('P-10428', 'Marcus Chen',       58, 'M', 148, 244, 'High', 0.8700, '2026-06-30'),
  ('P-10427', 'Priya Nair',        42, 'F', 122, 198, 'Low',  0.1400, '2026-06-30'),
  ('P-10426', 'Elena Rossi',       63, 'F', 156, 271, 'High', 0.9100, '2026-06-29'),
  ('P-10424', 'Sofia Alvarez',     37, 'F', 118, 176, 'Low',  0.0900, '2026-06-28'),
  ('P-10423', 'Henrik Lindqvist',  71, 'M', 162, 289, 'High', 0.9400, '2026-06-28'),
  ('P-10422', 'Aiko Tanaka',       45, 'F', 128, 210, 'Low',  0.2100, '2026-06-27')
ON DUPLICATE KEY UPDATE name = VALUES(name);
