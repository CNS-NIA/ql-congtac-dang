require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== KẾT NỐI DATABASE ====================
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

// ==================== CẤU HÌNH UPLOAD ====================
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`📁 Đã tạo thư mục uploads: ${UPLOADS_DIR}`);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, safeName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const isJson = file.mimetype === 'application/json' || 
                      file.originalname.toLowerCase().endsWith('.json');
        isJson ? cb(null, true) : cb(new Error('Chỉ chấp nhận file JSON'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ==================== IMPORT JSON IMPORTER ====================
const JsonImporter = require('./utils/json-importer');

// ==================== API ENDPOINTS ====================

// 1. Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Quản lý Công tác Đảng',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 2. Lấy danh sách đảng viên
app.get('/api/dangvien', (req, res) => {
    const sql = 'SELECT * FROM dang_vien ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn đảng viên:', err);
            return res.status(500).json({ error: 'Lỗi database' });
        }
        res.json(results);
    });
});

// 3. Thêm đảng viên mới (thủ công)
app.post('/api/dangvien', (req, res) => {
    const { ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu, trinh_do, que_quan, chuc_vu_dang, ngay_vao_dang } = req.body;
    
    if (!ho_ten) {
        return res.status(400).json({ error: 'Thiếu họ tên' });
    }

    const sql = `INSERT INTO dang_vien 
                 (ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu, trinh_do, que_quan, chuc_vu_dang, ngay_vao_dang) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [ho_ten, ngay_sinh || null, so_the_dang || '', chi_bo || '', chuc_vu || '', 
                   trinh_do || '', que_quan || '', chuc_vu_dang || '', ngay_vao_dang || null], 
        (err, result) => {
            if (err) {
                console.error('Lỗi thêm đảng viên:', err);
                return res.status(500).json({ error: 'Không thể thêm đảng viên' });
            }
            res.json({ 
                success: true, 
                id: result.insertId, 
                message: 'Đã thêm đảng viên thành công' 
            });
        }
    );
});

// 4. Lấy danh sách chi bộ
app.get('/api/chibo', (req, res) => {
    const sql = `SELECT DISTINCT chi_bo, COUNT(*) as so_luong 
                 FROM dang_vien 
                 WHERE chi_bo IS NOT NULL AND chi_bo != '' 
                 GROUP BY chi_bo 
                 ORDER BY chi_bo`;
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi database' });
        }
        res.json(results);
    });
});

// 5. Tìm kiếm đảng viên
app.get('/api/dangvien/search', (req, res) => {
    const { q, chibo } = req.query;
    let sql = 'SELECT * FROM dang_vien WHERE 1=1';
    const params = [];

    if (q) {
        sql += ' AND (ho_ten LIKE ? OR so_the_dang LIKE ? OR que_quan LIKE ?)';
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    if (chibo) {
        sql += ' AND chi_bo = ?';
        params.push(chibo);
    }

    sql += ' ORDER BY ho_ten';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Lỗi tìm kiếm:', err);
            return res.status(500).json({ error: 'Lỗi database' });
        }
        res.json(results);
    });
});

// 6. API UPLOAD FILE JSON
app.post('/api/upload-json', upload.single('jsonFile'), async (req, res) => {
    try {
        console.log('📤 Nhận file upload:', req.file?.originalname);
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng chọn file JSON' 
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        // Đọc file JSON
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let jsonData;
        
        try {
            jsonData = JSON.parse(fileContent);
        } catch (parseError) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                error: `File JSON không hợp lệ: ${parseError.message}`
            });
        }

        if (!Array.isArray(jsonData)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                success: false,
                error: 'Dữ liệu JSON phải là mảng []'
            });
        }

        console.log(`📊 Tìm thấy ${jsonData.length} bản ghi trong ${fileName}`);
        
        // Xác định chi bộ
        let chiBoName = req.body.chiBo;
        if (!chiBoName) {
            chiBoName = fileName
                .replace('.json', '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        }

        // Import dữ liệu
        const result = await JsonImporter.importFromJson(jsonData, fileName, chiBoName);

        // Xóa file tạm
        try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Đã xóa file tạm: ${fileName}`);
        } catch (unlinkError) {
            console.warn(`Không thể xóa file tạm: ${unlinkError.message}`);
        }

        // Trả kết quả
        res.json({
            success: true,
            message: `✅ Import thành công ${result.success}/${result.total} đảng viên`,
            details: {
                file: fileName,
                chi_bo: chiBoName,
                total: result.total,
                imported: result.success,
                skipped: result.skipped,
                errors: result.errors
            }
        });

    } catch (error) {
        console.error('🔥 Lỗi upload:', error);
        
        // Xóa file tạm nếu có lỗi
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch {}
        }
        
        res.status(500).json({ 
            success: false, 
            error: `Lỗi server: ${error.message}` 
        });
    }
});

// 7. API import từ URL
app.post('/api/import-from-url', express.json(), async (req, res) => {
    try {
        const { url, chiBo } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'Thiếu URL' });
        }

        console.log(`🌐 Đang tải từ URL: ${url}`);
        
        // Tải file từ URL (cần cài thêm node-fetch nếu cần)
        const response = await fetch(url);
        const jsonData = await response.json();
        
        const fileName = path.basename(url);
        const result = await JsonImporter.importFromJson(jsonData, fileName, chiBo);

        res.json({
            success: true,
            message: `✅ Đã import ${result.success} đảng viên từ ${fileName}`,
            details: result
        });

    } catch (error) {
        console.error('Lỗi import từ URL:', error);
        res.status(500).json({ error: error.message });
    }
});

// 8. Thống kê hệ thống
app.get('/api/thongke', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total FROM dang_vien',
        'SELECT COUNT(*) as co_so_the FROM dang_vien WHERE so_the_dang IS NOT NULL AND so_the_dang != ""',
        'SELECT COUNT(DISTINCT chi_bo) as so_chibo FROM dang_vien WHERE chi_bo IS NOT NULL',
        'SELECT chi_bo, COUNT(*) as soluong FROM dang_vien GROUP BY chi_bo ORDER BY soluong DESC'
    ];

    db.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi kết nối database' });
        }

        Promise.all(queries.map(query => {
            return new Promise((resolve, reject) => {
                connection.query(query, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });
        }))
        .then(results => {
            connection.release();
            res.json({
                tong_dang_vien: results[0].total,
                co_so_the: results[1].co_so_the,
                so_chi_bo: results[2].so_chibo,
                phan_bo_theo_chibo: results[3]
            });
        })
        .catch(error => {
            connection.release();
            console.error('Lỗi thống kê:', error);
            res.status(500).json({ error: 'Lỗi thống kê' });
        });
    });
});

// 9. Xóa đảng viên
app.delete('/api/dangvien/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM dang_vien WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Lỗi xóa đảng viên:', err);
            return res.status(500).json({ error: 'Không thể xóa đảng viên' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy đảng viên' });
        }
        
        res.json({ success: true, message: 'Đã xóa đảng viên' });
    });
});

// 10. Cập nhật đảng viên
app.put('/api/dangvien/:id', (req, res) => {
    const { id } = req.params;
    const { ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu, trinh_do, que_quan, chuc_vu_dang, ngay_vao_dang } = req.body;
    
    if (!ho_ten) {
        return res.status(400).json({ error: 'Thiếu họ tên' });
    }

    const sql = `UPDATE dang_vien 
                 SET ho_ten = ?, ngay_sinh = ?, so_the_dang = ?, chi_bo = ?, 
                     chuc_vu = ?, trinh_do = ?, que_quan = ?, chuc_vu_dang = ?, ngay_vao_dang = ?
                 WHERE id = ?`;
    
    db.query(sql, [ho_ten, ngay_sinh || null, so_the_dang || '', chi_bo || '', 
                   chuc_vu || '', trinh_do || '', que_quan || '', chuc_vu_dang || '', 
                   ngay_vao_dang || null, id], 
        (err, result) => {
            if (err) {
                console.error('Lỗi cập nhật đảng viên:', err);
                return res.status(500).json({ error: 'Không thể cập nhật' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Không tìm thấy đảng viên' });
            }
            
            res.json({ success: true, message: 'Đã cập nhật đảng viên' });
        }
    );
});

// ==================== PHỤC VỤ FRONTEND ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== KHỞI ĐỘNG SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  /api/dangvien           - Danh sách đảng viên`);
    console.log(`   POST /api/dangvien           - Thêm đảng viên`);
    console.log(`   POST /api/upload-json        - Upload file JSON`);
    console.log(`   GET  /api/chibo              - Danh sách chi bộ`);
    console.log(`   GET  /api/thongke            - Thống kê hệ thống`);
    console.log(`   GET  /health                 - Health check`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📁 Upload folder: ${UPLOADS_DIR}`);
});

// Xử lý lỗi toàn cục
process.on('uncaughtException', (err) => {
    console.error('🔥 Lỗi nghiêm trọng:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Promise bị từ chối:', reason);
});