// data.js - Database tạm thời với 1000+ đảng viên
const database = {
    chibos: [
        {
            id: 1,
            maChiBo: "CB_TB_TTDD",
            tenChiBo: "Chi bộ Đội Thiết bị Thông tin Dẫn đường",
            soDangVien: 156,
            diaChi: "Cảng HKQT Nội Bài, Hà Nội",
            ngayThanhLap: "2010-01-01",
            dangBoId: 1,
            bdcs: [
                { id: 1, hoVaTen: "Trần Đỗ Hải", chucVu: "Bí thư" },
                { id: 2, hoVaTen: "Nguyễn Văn A", chucVu: "Phó Bí thư" },
                { id: 3, hoVaTen: "Lê Thị B", chucVu: "Chi ủy viên" }
            ]
        },
        {
            id: 2,
            maChiBo: "CB_VT",
            tenChiBo: "Chi bộ Đội Vận tải",
            soDangVien: 87,
            diaChi: "Cảng HKQT Nội Bài",
            ngayThanhLap: "2011-03-15"
        }
    ],
    
    // Danh sách đảng viên mẫu (100 bản ghi)
    dangviens: (function() {
        const ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ'];
        const tenDem = ['Văn', 'Thị', 'Đình', 'Minh', 'Quang', 'Hồng', 'Thanh', 'Công', 'Xuân', 'Hữu'];
        const ten = ['Hải', 'Anh', 'Bình', 'Chiến', 'Dũng', 'Giang', 'Hạnh', 'Khoa', 'Long', 'Mai', 'Nga', 'Oanh', 'Phúc', 'Quân', 'Sơn', 'Tùng', 'Uyên', 'Vinh', 'Yến'];
        
        const dangviens = [];
        let id = 1;
        
        // Thêm đảng viên mẫu
        for (let i = 0; i < 100; i++) {
            const hoVaTen = `${ho[i % ho.length]} ${tenDem[i % tenDem.length]} ${ten[i % ten.length]}`;
            const maDangVien = `DV-${String(id).padStart(3, '0')}`;
            
            dangviens.push({
                id: id++,
                maDangVien: maDangVien,
                hoVaTen: hoVaTen,
                gioiTinh: i % 3 === 0 ? 'Nữ' : 'Nam',
                ngaySinh: `198${Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                noiSinh: i % 2 === 0 ? 'Hà Nội' : 'Hải Phòng',
                danToc: 'Kinh',
                tonGiao: 'Không',
                ngayVaoDang: `201${Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                ngayChinhThuc: '',
                soTheDang: `DANG-${String(10000 + i).padStart(5, '0')}`,
                chiBoId: i < 70 ? 1 : 2, // 70% chi bộ 1, 30% chi bộ 2
                chucVuTrongDang: i === 0 ? 'Bí thư Chi bộ' : 
                                i === 1 ? 'Phó Bí thư' : 
                                i < 10 ? 'Chi ủy viên' : 
                                i < 20 ? 'Tổ trưởng' : 
                                i < 30 ? 'Đảng viên chính thức' : 'Đảng viên dự bị',
                chucVuChuyenMon: i === 0 ? 'Trưởng đội' : 
                               i === 1 ? 'Phó đội' : 
                               i < 15 ? 'Kỹ thuật viên cao cấp' : 
                               i < 40 ? 'Kỹ thuật viên' : 'Nhân viên',
                trinhDoChinhTri: i < 10 ? 'Cao cấp lý luận chính trị' : 
                               i < 30 ? 'Trung cấp lý luận chính trị' : 'Sơ cấp lý luận chính trị',
                trinhDoChuyenMon: i < 15 ? 'Đại học' : 
                                i < 40 ? 'Cao đẳng' : 'Trung cấp',
                hoKhauThuongTru: 'Hà Nội',
                choOHienTai: 'Hà Nội',
                soDienThoai: `09${String(Math.floor(Math.random() * 90000000) + 10000000).padStart(8, '0')}`,
                email: `${hoVaTen.toLowerCase().replace(/ /g, '.')}@example.com`,
                tinhTrang: 'DangSinhHoat',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        return dangviens;
    })(),
    
    nghiquyets: [
        // ... (danh sách nghị quyết)
    ],
    
    sinhhoat: [
        // ... (sinh hoạt chi bộ)
    ]
};

// Export để sử dụng trong app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = database;
}
