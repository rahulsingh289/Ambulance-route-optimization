'use strict';

const path      = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express   = require('express');
const mysql     = require('mysql2/promise');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const crypto    = require('crypto');
const ExcelJS   = require('exceljs');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '..')));

/* ── MySQL pool ─────────────────────────────────────────── */
const pool = mysql.createPool(
  process.env.MYSQL_URL || {
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'portfolio_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
  }
);

/* ── Rate limiters ──────────────────────────────────────── */
const contactLimiter  = rateLimit({ windowMs: 15*60*1000, max: 5,  message: { error: 'Too many messages. Try again later.' } });
const reactionLimiter = rateLimit({ windowMs: 60*1000,    max: 20, message: { error: 'Slow down.' } });

/* ── Helpers ────────────────────────────────────────────── */
function sanitize(str) { return String(str || '').trim().slice(0, 1000); }
function hashIp(ip)    { return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'rs_salt')).digest('hex'); }
function adminAuth(req, res) {
  const auth     = req.headers.authorization;
  const expected = 'Basic ' + Buffer.from(`${process.env.ADMIN_USER||'admin'}:${process.env.ADMIN_PASS||'admin123'}`).toString('base64');
  if (auth !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

/* ══════════════════════════════════════════════════════════
   CONTACT
══════════════════════════════════════════════════════════ */
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address.' });
  try {
    await pool.execute(
      'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [sanitize(name), sanitize(email), sanitize(subject), sanitize(message)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/messages', async (req, res) => {
  if (!adminAuth(req, res)) return;
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, subject, message, is_read, created_at FROM messages ORDER BY created_at DESC'
    );
    res.json({ messages: rows });
  } catch (err) { res.status(500).json({ error: 'Could not fetch messages.' }); }
});

/* ══════════════════════════════════════════════════════════
   VISITS
══════════════════════════════════════════════════════════ */
app.get('/api/visits', async (_req, res) => {
  try {
    const [[row]] = await pool.execute('SELECT count FROM visits WHERE id = 1');
    res.json({ visits: row?.count || 0 });
  } catch (err) { res.status(500).json({ error: 'Could not fetch visits.' }); }
});

app.post('/api/visits', async (req, res) => {
  try {
    await pool.execute('UPDATE visits SET count = count + 1 WHERE id = 1');
    const [[row]] = await pool.execute('SELECT count FROM visits WHERE id = 1');
    // also log page_view
    const referrer = sanitize(req.body?.referrer || '').slice(0, 500) || null;
    await pool.execute('INSERT INTO page_views (referrer) VALUES (?)', [referrer]);
    res.json({ visits: row?.count || 0 });
  } catch (err) { res.status(500).json({ error: 'Could not update visits.' }); }
});

/* ══════════════════════════════════════════════════════════
   PROJECTS
══════════════════════════════════════════════════════════ */
app.get('/api/projects', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, description, tech_stack, github_url, live_url, thumbnail, featured FROM projects ORDER BY sort_order ASC'
    );
    // attach reaction counts
    const ids = rows.map(r => r.id);
    let reactionMap = {};
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      const [rrows] = await pool.execute(
        `SELECT project_id, type, COUNT(*) as cnt FROM reactions WHERE project_id IN (${placeholders}) GROUP BY project_id, type`,
        ids
      );
      rrows.forEach(r => {
        if (!reactionMap[r.project_id]) reactionMap[r.project_id] = { fire: 0, like: 0, idea: 0 };
        reactionMap[r.project_id][r.type] = Number(r.cnt);
      });
    }
    rows.forEach(r => { r.reactions = reactionMap[r.id] || { fire: 0, like: 0, idea: 0 }; r.tech_stack = r.tech_stack.split(',').map(t => t.trim()); });
    res.json({ projects: rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Could not fetch projects.' });
  }
});

/* ══════════════════════════════════════════════════════════
   REACTIONS
══════════════════════════════════════════════════════════ */
app.post('/api/reactions', reactionLimiter, async (req, res) => {
  const { project_id, type } = req.body;
  if (!project_id || !['fire','like','idea'].includes(type))
    return res.status(400).json({ error: 'Invalid reaction.' });
  try {
    await pool.execute('INSERT INTO reactions (project_id, type) VALUES (?, ?)', [project_id, type]);
    const [[row]] = await pool.execute(
      'SELECT type, COUNT(*) as cnt FROM reactions WHERE project_id = ? GROUP BY type',
      [project_id]
    );
    // return updated counts for this project
    const [rrows] = await pool.execute(
      'SELECT type, COUNT(*) as cnt FROM reactions WHERE project_id = ? GROUP BY type',
      [project_id]
    );
    const counts = { fire: 0, like: 0, idea: 0 };
    rrows.forEach(r => { counts[r.type] = Number(r.cnt); });
    res.json({ success: true, reactions: counts });
  } catch (err) { res.status(500).json({ error: 'Could not save reaction.' }); }
});

/* ══════════════════════════════════════════════════════════
   CV DOWNLOAD TRACKER
══════════════════════════════════════════════════════════ */
app.post('/api/cv-download', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    await pool.execute('INSERT INTO cv_downloads (ip_hash) VALUES (?)', [hashIp(ip)]);
    const [[row]] = await pool.execute('SELECT COUNT(*) as total FROM cv_downloads');
    res.json({ success: true, total: Number(row.total) });
  } catch (err) { res.status(500).json({ error: 'Could not log download.' }); }
});

app.get('/api/cv-downloads', async (req, res) => {
  if (!adminAuth(req, res)) return;
  try {
    const [[row]] = await pool.execute('SELECT COUNT(*) as total FROM cv_downloads');
    const [recent] = await pool.execute(
      'SELECT DATE(downloaded_at) as date, COUNT(*) as cnt FROM cv_downloads GROUP BY DATE(downloaded_at) ORDER BY date DESC LIMIT 30'
    );
    res.json({ total: Number(row.total), by_day: recent });
  } catch (err) { res.status(500).json({ error: 'Could not fetch downloads.' }); }
});

/* ══════════════════════════════════════════════════════════
   EXCEL EXPORT (admin only)
   GET /api/export  →  downloads portfolio_data.xlsx
══════════════════════════════════════════════════════════ */
app.get('/api/export', async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Rahul Singh Portfolio';
    wb.created = new Date();

    // helper: style header row
    function styleHeader(sheet, cols) {
      sheet.columns = cols;
      const row = sheet.getRow(1);
      row.eachCell(cell => {
        cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border    = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
      });
      row.height = 28;
    }

    // ── Messages ──────────────────────────────────────────
    const [messages] = await pool.execute(
      'SELECT id, name, email, subject, message, is_read, created_at FROM messages ORDER BY created_at DESC'
    );
    const msSheet = wb.addWorksheet('Messages');
    styleHeader(msSheet, [
      { header: 'ID',         key: 'id',         width: 6  },
      { header: 'Name',       key: 'name',        width: 20 },
      { header: 'Email',      key: 'email',       width: 28 },
      { header: 'Subject',    key: 'subject',     width: 30 },
      { header: 'Message',    key: 'message',     width: 50 },
      { header: 'Read',       key: 'is_read',     width: 8  },
      { header: 'Date',       key: 'created_at',  width: 22 },
    ]);
    messages.forEach(r => msSheet.addRow(r));

    // ── Visits ────────────────────────────────────────────
    const [[visit]] = await pool.execute('SELECT count FROM visits WHERE id = 1');
    const [views]   = await pool.execute(
      'SELECT DATE(visited_at) as date, COUNT(*) as views FROM page_views GROUP BY DATE(visited_at) ORDER BY date DESC'
    );
    const vSheet = wb.addWorksheet('Visits');
    styleHeader(vSheet, [
      { header: 'Date', key: 'date',  width: 18 },
      { header: 'Views', key: 'views', width: 12 },
    ]);
    vSheet.addRow({ date: 'TOTAL', views: visit?.count || 0 });
    views.forEach(r => vSheet.addRow(r));

    // ── CV Downloads ──────────────────────────────────────
    const [downloads] = await pool.execute(
      'SELECT DATE(downloaded_at) as date, COUNT(*) as downloads FROM cv_downloads GROUP BY DATE(downloaded_at) ORDER BY date DESC'
    );
    const [[dlTotal]] = await pool.execute('SELECT COUNT(*) as total FROM cv_downloads');
    const dlSheet = wb.addWorksheet('CV Downloads');
    styleHeader(dlSheet, [
      { header: 'Date',      key: 'date',      width: 18 },
      { header: 'Downloads', key: 'downloads', width: 14 },
    ]);
    dlSheet.addRow({ date: 'TOTAL', downloads: dlTotal.total });
    downloads.forEach(r => dlSheet.addRow(r));

    // ── Projects ──────────────────────────────────────────
    const [projects] = await pool.execute(
      'SELECT id, title, description, tech_stack, github_url, live_url, featured FROM projects ORDER BY sort_order'
    );
    const pSheet = wb.addWorksheet('Projects');
    styleHeader(pSheet, [
      { header: 'ID',          key: 'id',          width: 6  },
      { header: 'Title',       key: 'title',        width: 28 },
      { header: 'Description', key: 'description',  width: 50 },
      { header: 'Tech Stack',  key: 'tech_stack',   width: 30 },
      { header: 'GitHub',      key: 'github_url',   width: 35 },
      { header: 'Live URL',    key: 'live_url',     width: 35 },
      { header: 'Featured',    key: 'featured',     width: 10 },
    ]);
    projects.forEach(r => pSheet.addRow(r));

    // ── Reactions ─────────────────────────────────────────
    const [reactions] = await pool.execute(
      `SELECT p.title, r.type, COUNT(*) as count
       FROM reactions r JOIN projects p ON p.id = r.project_id
       GROUP BY p.title, r.type ORDER BY p.title`
    );
    const rSheet = wb.addWorksheet('Reactions');
    styleHeader(rSheet, [
      { header: 'Project', key: 'title', width: 28 },
      { header: 'Type',    key: 'type',  width: 10 },
      { header: 'Count',   key: 'count', width: 10 },
    ]);
    reactions.forEach(r => rSheet.addRow(r));

    // ── Send file ─────────────────────────────────────────
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio_data.xlsx"');
    await wb.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Export failed.' });
  }
});

/* ── Health ─────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Portfolio backend → http://localhost:${PORT}`));
