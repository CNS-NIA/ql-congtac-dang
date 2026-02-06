// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Phục vụ file frontend

// API GET /api/dangvien - Trả về danh sách đảng viên từ file JSON
app.get('/api/dangvien', async (req, res) => {
    try {
        // Đọc file JSON từ thư mục data/
        const dataPath = path.join(__dirname, 'data', 'all_members.json');
        const data = await fs.readFile(dataPath, 'utf8');
        const members = JSON.parse(data);
        
        // Trả về dữ liệu
        res.json(members);
        
    } catch (error) {
        console.error('Lỗi khi đọc file JSON:', error);
        res.status(500).json({ error: 'Không thể đọc dữ liệu' });
    }
});

// API GET /api/dangvien/:id - Trả về 1 đảng viên
app.get('/api/dangvien/:id', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'all_members.json');
        const data = await fs.readFile(dataPath, 'utf8');
        const members = JSON.parse(data);
        
        const member = members.find(m => m.id == req.params.id);
        
        if (!member) {
            return res.status(404).json({ error: 'Không tìm thấy đảng viên' });
        }
        
        res.json(member);
        
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API POST /api/dangvien - Thêm đảng viên mới
app.post('/api/dangvien', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'all_members.json');
        const data = await fs.readFile(dataPath, 'utf8');
        const members = JSON.parse(data);
        
        const newMember = {
            id: Date.now(), // Tạo ID mới
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        members.push(newMember);
        
        // Lưu lại file
        await fs.writeFile(dataPath, JSON.stringify(members, null, 2), 'utf8');
        
        res.status(201).json(newMember);
        
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm đảng viên' });
    }
});

// API DELETE /api/dangvien/:id - Xóa đảng viên
app.delete('/api/dangvien/:id', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data', 'all_members.json');
        const data = await fs.readFile(dataPath, 'utf8');
        let members = JSON.parse(data);
        
        const initialLength = members.length;
        members = members.filter(m => m.id != req.params.id);
        
        if (members.length === initialLength) {
            return res.status(404).json({ error: 'Không tìm thấy đảng viên' });
        }
        
        // Lưu lại file
        await fs.writeFile(dataPath, JSON.stringify(members, null, 2), 'utf8');
        
        res.json({ success: true, message: 'Đã xóa đảng viên' });
        
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi xóa đảng viên' });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/index.html`);
    console.log(`📊 API: http://localhost:${PORT}/api/dangvien`);
});
