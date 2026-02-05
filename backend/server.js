require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ql_cong_tac_dang',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối database
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
    } else {
        console.log('✅ Đã kết nối MySQL thành công');
        connection.release();
    }
});

// API: Lấy danh sách đảng viên
app.get('/api/dangvien', (req, res) => {
    const sql = 'SELECT * FROM dang_vien ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).json({ error: 'Lỗi database' });
        }
        res.json(results);
    });
});

// API: Thêm đảng viên mới
app.post('/api/dangvien', (req, res) => {
    const { ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu } = req.body;
    
    if (!ho_ten || !so_the_dang) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const sql = 'INSERT INTO dang_vien (ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [ho_ten, ngay_sinh || null, so_the_dang, chi_bo || '', chuc_vu || ''], (err, result) => {
        if (err) {
            console.error('Lỗi thêm đảng viên:', err);
            return res.status(500).json({ error: 'Không thể thêm đảng viên' });
        }
        res.json({ success: true, id: result.insertId, message: 'Đã thêm đảng viên thành công' });
    });
});

// API: Lấy danh sách chi bộ
app.get('/api/chibo', (req, res) => {
    const sql = 'SELECT DISTINCT chi_bo FROM dang_vien WHERE chi_bo IS NOT NULL ORDER BY chi_bo';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi database' });
        }
        res.json(results.map(row => row.chi_bo));
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Quản lý Công tác Đảng'
    });
});

// Phục vụ frontend cho tất cả route khác
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  /api/dangvien     - Lấy danh sách đảng viên`);
    console.log(`   POST /api/dangvien     - Thêm đảng viên mới`);
    console.log(`   GET  /api/chibo        - Lấy danh sách chi bộ`);
    console.log(`   GET  /health          - Kiểm tra tình trạng hệ thống`);
});
