// server.js - PHIÊN BẢN ĐƠN GIẢN
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware cực đơn giản
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API đơn giản - KHÔNG DATABASE
app.get('/api/test', (req, res) => {
    res.json({ message: 'API đang hoạt động!', timestamp: new Date() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Quản lý Đảng' });
});

// API upload JSON đơn giản (lưu file, không database)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-json', upload.single('jsonFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file' });
        }
        
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Xử lý đơn giản: chỉ đếm số bản ghi
        const fileName = req.file.originalname;
        let chiBo = fileName.replace('.json','').replace(/-/g,' ');
        
        res.json({
            success: true,
            message: `Nhận được file ${fileName} với ${jsonData.length} bản ghi`,
            chi_bo: chiBo,
            count: jsonData.length,
            sample: jsonData.slice(0, 2) // Hiển thị 2 bản ghi đầu
        });
        
        // Xóa file tạm
        fs.unlinkSync(req.file.path);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Phục vụ frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API test: http://localhost:${PORT}/api/test`);
});
