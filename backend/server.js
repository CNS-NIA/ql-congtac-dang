const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== DATABASE MOCK ====================
// Đây là dữ liệu giả, sau sẽ thay bằng PostgreSQL
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
            ngayVaoDang: "2015-06-15"
        },
        {
            id: 2,
            maDangVien: "DV-002",
            hoVaTen: "Nguyễn Văn A",
            gioiTinh: "Nam",
            chiBoId: 1,
            chucVuTrongDang: "Phó Bí thư"
        }
    ],
    nghiquyets: [
        {
            id: 1,
            soHieu: "DTNQ/CB-01-2026",
            tieuDe: "lãnh đạo thực hiện nhiệm vụ tháng 01 năm 2026",
            thang: 1,
            nam: 2026,
            trangThai: "DA_DUYET"
        }
    ]
};

// ==================== API ROUTES ====================

// 1. API CHI BỘ
app.get('/api/chibo', (req, res) => {
    res.json({
        success: true,
        data: database.chibos,
        total: database.chibos.length
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

// 2. API ĐẢNG VIÊN (có phân trang)
app.get('/api/dangvien', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search
