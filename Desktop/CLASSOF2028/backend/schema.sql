-- ============================================================
--  portfolio_db — MySQL Schema
--  Run: mysql -u root -p < backend/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- ── Contact messages ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(254)  NOT NULL,
  subject     VARCHAR(255)  NOT NULL,
  message     TEXT          NOT NULL,
  is_read     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email      (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ── Persistent visit counter (single row) ────────────────
CREATE TABLE IF NOT EXISTS visits (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  count BIGINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT IGNORE INTO visits (id, count) VALUES (1, 0);

-- ── Projects ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(120)  NOT NULL,
  description TEXT          NOT NULL,
  tech_stack  VARCHAR(255)  NOT NULL,   -- comma-separated e.g. "Node.js,MySQL,HTML"
  github_url  VARCHAR(500)  DEFAULT NULL,
  live_url    VARCHAR(500)  DEFAULT NULL,
  thumbnail   VARCHAR(500)  DEFAULT NULL,
  featured    TINYINT(1)    NOT NULL DEFAULT 0,
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed sample projects
INSERT IGNORE INTO projects (id, title, description, tech_stack, github_url, live_url, featured, sort_order) VALUES
(1, 'Portfolio Website', 'Fully responsive personal portfolio with dark mode, contact form, QR code and MySQL backend.', 'HTML,CSS,JavaScript,Node.js,MySQL', 'https://github.com/', NULL, 1, 1),
(2, 'Task Automation Bot', 'Python script that automates repetitive file management and web scraping tasks.', 'Python,BeautifulSoup,Schedule', 'https://github.com/', NULL, 1, 2),
(3, 'DSA Visualizer', 'Interactive web tool to visualize sorting algorithms with step-by-step animation.', 'HTML,CSS,JavaScript', 'https://github.com/', NULL, 0, 3),
(4, 'Student Management System', 'Full-stack CRUD app for managing student records with Node.js and MongoDB.', 'Node.js,Express,MongoDB,EJS', 'https://github.com/', NULL, 0, 4);

-- ── CV download tracker ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cv_downloads (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_hash      VARCHAR(64)  NOT NULL,   -- SHA-256 of IP, never raw IP
  downloaded_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (downloaded_at)
) ENGINE=InnoDB;

-- ── Project reactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id  INT UNSIGNED NOT NULL,
  type        ENUM('fire','like','idea') NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project (project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Page analytics ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referrer    VARCHAR(500)  DEFAULT NULL,
  country     VARCHAR(60)   DEFAULT NULL,
  visited_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visited (visited_at)
) ENGINE=InnoDB;
