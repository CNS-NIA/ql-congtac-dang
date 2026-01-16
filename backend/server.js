require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database tạm thời (sẽ thay bằng PostgreSQL)
const database = {
    chibos: [
        {
            id: 1,
            maChiBo: "CB_TB_TTDD",
            tenChiBo: "Chi bộ Đội Thiết bị Thông tin Dẫn đường",
            soDangVien: 15,
            diaChi: "Cảng HKQT Nội Bài",
            ngayThanhLap: "2010-01-01"
        }
    ],
    dangviens: [
        {
            id: 1,
            maDangVien: "DV-001",
            hoVaTen: "Trần Đỗ Hải",
            gioiTinh: "Nam",
            chiBoId: 1,
            chucVuTrongDang: "Bí thư Chi bộ",
            chucVuChuyenMon: "Trưởng đội",
            ngayVaoDang: "2015-06-15",
            trinhDoChinhTri: "Cao cấp lý luận chính trị",
            tinhTrang: "DangSinhHoat"
        },
        {
            id: 2,
            maDangVien: "DV-002",
            hoVaTen: "Nguyễn Văn A",
            gioiTinh: "Nam",
            chiBoId: 1,
            chucVuTrongDang: "Phó Bí thư",
            chucVuChuyenMon: "Phó đội",
            ngayVaoDang: "2018-03-10",
            tinhTrang: "DangSinhHoat"
        }
    ],
    nghiquyets: [
        {
            id: 1,
            soHieu: "DTNQ/CB-01-2026",
            chiBoId: 1,
            loai: "THANG",
            tieuDe: "lãnh đạo thực hiện nhiệm vụ tháng 01 năm 2026",
            thang: 1,
            nam: 2026,
            trangThai: "DA_DUYET",
            nguoiTaoId: 1,
            ngayTao: "2026-01-03"
        }
    ]
};

// ============== API CHI BỘ ==============
app.get('/api/chibo', (req, res) => {
    res.json({
        success: true,
        data: database.chibos,
        total: database.chibos.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/chibo/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const chiBo = database.chibos.find(cb => cb.id === id);
    
    if (chiBo) {
        res.json({ success: true, data: chiBo });
    } else {
        res.status(404).json({ success: false, message: 'Không tìm thấy Chi bộ' });
    }
});

// ============== API ĐẢNG VIÊN ==============
app.get('/api/dangvien', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    
    let filtered = database.dangviens;
    
    // Tìm kiếm
    if (search) {
        filtered = filtered.filter(dv => 
            dv.hoVaTen.toLowerCase().includes(search.toLowerCase()) ||
            dv.maDangVien.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Phân trang
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginated = filtered.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginated,
        pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit)
        }
    });
});

app.post('/api/dangvien', (req, res) => {
    const newId = database.dangviens.length > 0 
        ? Math.max(...database.dangviens.map(d => d.id)) + 1 
        : 1;
    
    const newDangVien = {
        id: newId,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    database.dangviens.push(newDangVien);
    
    res.status(201).json({
        success: true,
        message: 'Đã thêm đảng viên thành công',
        data: newDangVien
    });
});

// ============== API NGHỊ QUYẾT ==============
app.get('/api/nghiquyet', (req, res) => {
    res.json({
        success: true,
        data: database.nghiquyets,
        total: database.nghiquyets.length
    });
});

app.post('/api/nghiquyet', (req, res) => {
    const newId = database.nghiquyets.length > 0 
        ? Math.max(...database.nghiquyets.map(n => n.id)) + 1 
        : 1;
    
    const newNghiQuyet = {
        id: newId,
        ...req.body,
        ngayTao: new Date().toISOString(),
        trangThai: req.body.trangThai || 'DRAFT'
    };
    
    database.nghiquyets.push(newNghiQuyet);
    
    res.status(201).json({
        success: true,
        message: 'Đã tạo nghị quyết thành công',
        data: newNghiQuyet
    });
});

// ============== HEALTH CHECK ==============
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'QL Công tác Đảng Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/chibo',
            '/api/dangvien',
            '/api/nghiquyet'
        ]
    });
});

// ============== SERVER START ==============
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`   GET  /api/chibo         - Lấy danh sách Chi bộ`);
    console.log(`   GET  /api/dangvien      - Lấy danh sách Đảng viên (có phân trang)`);
    console.log(`   POST /api/dangvien      - Thêm Đảng viên mới`);
    console.log(`   GET  /api/nghiquyet     - Lấy danh sách Nghị quyết`);
    console.log(`   GET  /health           - Kiểm tra tình trạng server`);
});
