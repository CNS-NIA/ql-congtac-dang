/**
 * Server chính - Quản lý Công tác Đảng
 * Phiên bản: 1.0.0
 */

// ==================== IMPORT MODULES ====================
const express = require('express');
const mysql = require('mysql2/promise'); // Sử dụng promise-based
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// ==================== KHỞI TẠO APP ====================
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CẤU HÌNH BẢO MẬT ====================
app.use(helmet()); // Bảo mật HTTP headers
app.use(cors());   // Cho phép truy cập từ các domain khác

// ==================== MIDDLEWARE ====================
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static('public')); // Phục vụ file tĩnh

// Middleware ghi log
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ==================== CẤU HÌNH DATABASE ====================
const createDatabaseConnection = () => {
    return mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dang_management',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

let db;
(async () => {
    try {
        db = await createDatabaseConnection();
        console.log('✅ Đã kết nối database thành công');
    } catch (error) {
        console.error('❌ Lỗi kết nối database:', error.message);
        process.exit(1);
    }
})();

// ==================== CẤU HÌNH UPLOAD ====================
// Đảm bảo thư mục uploads tồn tại
const ensureUploadsDir = () => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`📁 Đã tạo thư mục uploads: ${uploadPath}`);
    }
    return uploadPath;
};

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ensureUploadsDir());
    },
    filename: (req, file, cb) => {
        // Tạo tên file an toàn: timestamp + random + extension
        const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${safeFilename}`;
        cb(null, uniqueName);
    }
});

// Lọc loại file được phép upload
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép file hình ảnh, PDF và văn bản'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// ==================== MIDDLEWARE XÁC THỰC (ĐƠN GIẢN) ====================
const authenticate = (req, res, next) => {
    // Trong phiên bản thực tế, sử dụng JWT hoặc session
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Token không được cung cấp' 
        });
    }
    
    // Giả lập kiểm tra token (thay bằng logic thực tế)
    if (token === 'Bearer admin123') {
        req.user = { id: 1, role: 'admin' };
        next();
    } else {
        res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Token không hợp lệ' 
        });
    }
};

// ==================== ROUTES ====================

// Route chính
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với Hệ thống Quản lý Công tác Đảng',
        version: '1.0.0',
        endpoints: {
            dangvien: '/api/dangvien',
            sinhhoat: '/api/sinhhoat',
            dangphi: '/api/dangphi',
            upload: '/api/upload',
            docs: '/api-docs'
        }
    });
});

// API Quản lý Đảng viên
app.route('/api/dangvien')
    .get(async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM dang_vien WHERE trang_thai = ?', ['hoat_dong']);
            res.json({ 
                success: true, 
                count: rows.length, 
                data: rows 
            });
        } catch (error) {
            console.error('Lỗi truy vấn đảng viên:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi server khi lấy danh sách đảng viên' 
            });
        }
    })
    .post(authenticate, async (req, res) => {
        try {
            const { ho_ten, ngay_sinh, chuc_vu, ngay_vao_dang, chi_bo } = req.body;
            
            // Kiểm tra dữ liệu bắt buộc
            if (!ho_ten) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Họ tên là bắt buộc' 
                });
            }
            
            const [result] = await db.query(
                'INSERT INTO dang_vien (ho_ten, ngay_sinh, chuc_vu, ngay_vao_dang, chi_bo) VALUES (?, ?, ?, ?, ?)',
                [ho_ten, ngay_sinh, chuc_vu, ngay_vao_dang, chi_bo]
            );
            
            res.status(201).json({
                success: true,
                message: 'Thêm đảng viên thành công',
                data: { id: result.insertId, ...req.body }
            });
        } catch (error) {
            console.error('Lỗi thêm đảng viên:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi server khi thêm đảng viên' 
            });
        }
    });

// API chi tiết đảng viên
app.route('/api/dangvien/:id')
    .get(async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM dang_vien WHERE id = ?', [req.params.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Không tìm thấy đảng viên' 
                });
            }
            
            res.json({ success: true, data: rows[0] });
        } catch (error) {
            console.error('Lỗi truy vấn đảng viên:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi server' 
            });
        }
    })
    .put(authenticate, async (req, res) => {
        try {
            const { ho_ten, ngay_sinh, chuc_vu, ngay_vao_dang, chi_bo, trang_thai } = req.body;
            
            const [result] = await db.query(
                `UPDATE dang_vien 
                 SET ho_ten = ?, ngay_sinh = ?, chuc_vu = ?, ngay_vao_dang = ?, chi_bo = ?, trang_thai = ?
                 WHERE id = ?`,
                [ho_ten, ngay_sinh, chuc_vu, ngay_vao_dang, chi_bo, trang_thai, req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Không tìm thấy đảng viên để cập nhật' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Cập nhật đảng viên thành công' 
            });
        } catch (error) {
            console.error('Lỗi cập nhật đảng viên:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi server khi cập nhật đảng viên' 
            });
        }
    })
    .delete(authenticate, async (req, res) => {
        try {
            // Thay vì xóa cứng, chúng ta đánh dấu là đã xóa (soft delete)
            const [result] = await db.query(
                'UPDATE dang_vien SET trang_thai = "da_xoa" WHERE id = ?',
                [req.params.id]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Không tìm thấy đảng viên' 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Đã đánh dấu xóa đảng viên thành công' 
            });
        } catch (error) {
            console.error('Lỗi xóa đảng viên:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Lỗi server khi xóa đảng viên' 
            });
        }
    });

// API Tìm kiếm đảng viên
app.get('/api/dangvien/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ 
                success: false, 
                error: 'Thiếu từ khóa tìm kiếm' 
            });
        }
        
        const [rows] = await db.query(
            `SELECT * FROM dang_vien 
             WHERE ho_ten LIKE ? OR chi_bo LIKE ? OR chuc_vu LIKE ?
             AND trang_thai = 'hoat_dong'`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        
        res.json({ 
            success: true, 
            count: rows.length, 
            data: rows 
        });
    } catch (error) {
        console.error('Lỗi tìm kiếm đảng viên:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi server khi tìm kiếm' 
        });
    }
});

// API Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Không có file được tải lên' 
            });
        }
        
        res.json({
            success: true,
            message: 'Upload file thành công',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Lỗi upload file:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi server khi upload file' 
        });
    }
});

// API Lấy danh sách file đã upload
app.get('/api/uploads', (req, res) => {
    try {
        const uploadPath = ensureUploadsDir();
        fs.readdir(uploadPath, (err, files) => {
            if (err) {
                throw err;
            }
            
            const fileList = files.map(file => {
                const filePath = path.join(uploadPath, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    url: `/uploads/${file}`
                };
            });
            
            res.json({ success: true, files: fileList });
        });
    } catch (error) {
        console.error('Lỗi đọc danh sách file:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi server khi đọc file' 
        });
    }
});

// API Thống kê cơ bản
app.get('/api/thongke', authenticate, async (req, res) => {
    try {
        const [dangvienStats] = await db.query(
            `SELECT 
                COUNT(*) as tong_dang_vien,
                SUM(CASE WHEN trang_thai = 'hoat_dong' THEN 1 ELSE 0 END) as dang_hoat_dong,
                SUM(CASE WHEN trang_thai = 'nghi_huu' THEN 1 ELSE 0 END) as da_nghi_huu
             FROM dang_vien`
        );
        
        const [chiBoStats] = await db.query(
            'SELECT chi_bo, COUNT(*) as so_luong FROM dang_vien GROUP BY chi_bo'
        );
        
        res.json({
            success: true,
            data: {
                dang_vien: dangvienStats[0],
                chi_bo: chiBoStats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Lỗi thống kê:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi server khi thống kê' 
        });
    }
});

// ==================== XỬ LÝ LỖI ====================
// 404 - Không tìm thấy route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Không tìm thấy endpoint',
        requestedUrl: req.originalUrl
    });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    console.error('Lỗi toàn cục:', err);
    
    // Lỗi từ Multer (upload file)
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            error: 'Lỗi upload file',
            message: err.message
        });
    }
    
    // Lỗi xác thực file
    if (err.message && err.message.includes('Chỉ cho phép')) {
        return res.status(400).json({
            success: false,
            error: 'Loại file không được hỗ trợ',
            message: err.message
        });
    }
    
    // Lỗi khác
    res.status(500).json({
        success: false,
        error: 'Lỗi server nội bộ',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Đã xảy ra lỗi'
    });
});

// ==================== KHỞI ĐỘNG SERVER ====================
const startServer = async () => {
    try {
        // Kiểm tra kết nối database
        if (!db) {
            throw new Error('Database chưa được kết nối');
        }
        
        // Đảm bảo thư mục upload tồn tại
        ensureUploadsDir();
        
        // Khởi động server
        app.listen(PORT, () => {
            console.log(`
🚀 Server đang chạy:
   ► Địa chỉ: http://localhost:${PORT}
   ► Môi trường: ${process.env.NODE_ENV || 'development'}
   ► Thời gian: ${new Date().toLocaleString('vi-VN')}
   
📋 Các endpoint chính:
   ► GET  /              - Trang chủ API
   ► GET  /api/dangvien  - Danh sách đảng viên
   ► POST /api/upload    - Upload file
   ► GET  /api/thongke   - Thống kê (cần xác thực)
   
🔧 Lưu ý:
   • Token mẫu cho xác thực: 'Bearer admin123'
   • File upload tối đa: 5MB
   • Thư mục upload: ./uploads/
            `);
        });
    } catch (error) {
        console.error('❌ Không thể khởi động server:', error.message);
        process.exit(1);
    }
};

// Xử lý tắt server
process.on('SIGTERM', () => {
    console.log('🛑 Nhận tín hiệu tắt server...');
    if (db) {
        db.end();
        console.log('✅ Đã đóng kết nối database');
    }
    process.exit(0);
});

// Bắt đầu server
startServer();

module.exports = app; // Cho mục đích testing
