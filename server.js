const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình upload
const upload = multer({ dest: 'uploads/' });

// ==================== API CƠ BẢN ====================

// 1. Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'QL Công tác Đảng',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// 2. API test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API đang hoạt động!',
        endpoints: [
            'GET  /health',
            'GET  /api/test', 
            'POST /api/upload-json',
            'GET  /api/dangvien'
        ]
    });
});

// 3. API upload JSON (ĐƠN GIẢN - KHÔNG DATABASE)
app.post('/api/upload-json', upload.single('jsonFile'), (req, res) => {
    try {
        console.log('📤 Nhận file upload:', req.file?.originalname);
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng chọn file JSON' 
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname || 'unknown.json';
        
        // Đọc file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        if (!Array.isArray(jsonData)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ 
                success: false, 
                error: 'Dữ liệu JSON phải là mảng []' 
            });
        }

        // Xác định chi bộ từ tên file
        let chiBo = fileName
            .replace('.json', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        // Xử lý đơn giản: Chỉ trả về thông tin
        console.log(`📊 File ${fileName} có ${jsonData.length} bản ghi`);
        
        // Xóa file tạm
        fs.unlinkSync(filePath);
        
        // Trả kết quả
        res.json({
            success: true,
            message: `✅ Đã nhận file ${fileName}`,
            details: {
                file_name: fileName,
                chi_bo: chiBo,
                record_count: jsonData.length,
                sample_records: jsonData.slice(0, 3) // 3 bản ghi đầu
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
            error: `Lỗi: ${error.message}` 
        });
    }
});

// 4. API giả lập danh sách đảng viên
app.get('/api/dangvien', (req, res) => {
    res.json([
        { 
            id: 1, 
            ho_ten: "Nguyễn Văn Mẫu", 
            so_the_dang: "NB-001",
            chi_bo: "Chi bộ Mẫu",
            chuc_vu: "Đảng viên",
            trang_thai: "Đang sinh hoạt"
        },
        { 
            id: 2, 
            ho_ten: "Trần Thị Demo", 
            so_the_dang: "NB-002",
            chi_bo: "Chi bộ Demo", 
            chuc_vu: "Bí thư",
            trang_thai: "Đang sinh hoạt"
        }
    ]);
});

// ==================== PHỤC VỤ FRONTEND ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== KHỞI ĐỘNG ====================
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại port ${PORT}`);
    console.log(`🌐 Địa chỉ: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  /health           - Kiểm tra tình trạng`);
    console.log(`   GET  /api/test         - Test API`);
    console.log(`   POST /api/upload-json  - Upload file JSON`);
    console.log(`   GET  /api/dangvien     - Danh sách đảng viên mẫu`);
    console.log(`=============================================`);
});
