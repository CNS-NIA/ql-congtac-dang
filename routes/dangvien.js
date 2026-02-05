const express = require('express');
const router = express.Router();

// Mock database (sẽ thay bằng PostgreSQL)
let dangviens = [
    {
        id: 1,
        maDangVien: "DV-001",
        hoVaTen: "Trần Đỗ Hải",
        gioiTinh: "Nam",
        chiBoId: 1,
        chucVuTrongDang: "Bí thư Chi bộ",
        createdAt: new Date().toISOString()
    }
];

// GET /api/dangvien - Danh sách đảng viên (có phân trang)
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    
    // Filter by search
    let filtered = dangviens;
    if (search) {
        filtered = filtered.filter(dv => 
            dv.hoVaTen.toLowerCase().includes(search.toLowerCase()) ||
            dv.maDangVien.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Pagination
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

// POST /api/dangvien - Thêm đảng viên mới
router.post('/', (req, res) => {
    const newId = dangviens.length > 0 
        ? Math.max(...dangviens.map(d => d.id)) + 1 
        : 1;
    
    const newDangVien = {
        id: newId,
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    dangviens.push(newDangVien);
    
    res.status(201).json({
        success: true,
        message: 'Đã thêm đảng viên thành công',
        data: newDangVien
    });
});

module.exports = router;
