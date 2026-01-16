require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const chiboRoutes = require('./routes/chibo');
const dangvienRoutes = require('./routes/dangvien');
const nghiquyetRoutes = require('./routes/nghiquyet');

// Use routes
app.use('/api/chibo', chiboRoutes);
app.use('/api/dangvien', dangvienRoutes);
app.use('/api/nghiquyet', nghiquyetRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'QL Công tác Đảng Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: 'Connected'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on port ${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   GET  /api/chibo         - Danh sách Chi bộ`);
    console.log(`   GET  /api/dangvien      - Danh sách Đảng viên`);
    console.log(`   POST /api/dangvien      - Thêm Đảng viên`);
    console.log(`   GET  /health           - Health check`);
});
