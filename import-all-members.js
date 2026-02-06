// import-all-members.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importAllMembers() {
    console.log('🔄 Bắt đầu nhập dữ liệu từ all_members.json vào MySQL...');
    
    // 1. Kết nối database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dang_management',
    });
    
    try {
        // 2. Đọc file all_members.json
        const filePath = path.join(__dirname, 'data', 'all_members.json');
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File không tồn tại: ${filePath}`);
            process.exit(1);
        }
        
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📄 Đã đọc file all_members.json, có ${Object.keys(jsonData).length} chi bộ`);
        
        let totalImported = 0;
        
        // 3. Duyệt qua từng chi bộ
        for (const [chiBoKey, dangVienList] of Object.entries(jsonData)) {
            // Chuyển tên chi bộ từ key sang dạng đẹp hơn
            const chiBoName = convertChiBoName(chiBoKey);
            console.log(`\n📋 Chi bộ: ${chiBoName} (${dangVienList.length} đảng viên)`);
            
            // 4. Nhập từng đảng viên
            for (const item of dangVienList) {
                // Chuẩn hóa ngày tháng
                const ngaySinh = formatDate(item.Ngay_sinh);
                const ngayVaoDang = formatDate(item.Ngay_vao_Dang);
                
                // Kiểm tra trùng số thẻ đảng
                if (item.So_the_Dang && item.So_the_Dang.trim() !== '') {
                    const [existing] = await connection.execute(
                        'SELECT id FROM dang_vien WHERE so_the_dang = ?',
                        [item.So_the_Dang.trim()]
                    );
                    
                    if (existing.length > 0) {
                        console.log(`   ⏩ Bỏ qua (đã tồn tại): ${item.Ho_va_Ten}`);
                        continue;
                    }
                }
                
                // Chuẩn bị dữ liệu
                const dangVienData = {
                    ho_ten: item.Ho_va_Ten || '',
                    ngay_sinh: ngaySinh,
                    ngay_vao_dang: ngayVaoDang,
                    so_the_dang: item.So_the_Dang || '',
                    chuc_vu: item.Chuc_vu || '',
                    trinh_do: item.Trinh_do || '',
                    que_quan: item.Que_quan || '',
                    chuc_vu_dang: item.Chuc_vu_Dang || '',
                    chi_bo: chiBoName,
                    trang_thai: determineTrangThai(item.Chuc_vu_Dang, item.Ngay_vao_Dang)
                };
                
                // Thực hiện INSERT
                try {
                    const [result] = await connection.execute(
                        `INSERT INTO dang_vien 
                         (ho_ten, ngay_sinh, ngay_vao_dang, so_the_dang, chuc_vu, trinh_do, que_quan, chuc_vu_dang, chi_bo, trang_thai) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        Object.values(dangVienData)
                    );
                    
                    console.log(`   ✅ ${item.Ho_va_Ten}`);
                    totalImported++;
                } catch (error) {
                    console.log(`   ❌ Lỗi khi thêm ${item.Ho_va_Ten}:`, error.message);
                }
            }
        }
        
        console.log(`\n🎉 HOÀN THÀNH! Đã nhập ${totalImported} đảng viên vào database.`);
        
        // 5. Hiển thị thống kê
        const [stats] = await connection.execute(
            'SELECT chi_bo, COUNT(*) as so_luong FROM dang_vien GROUP BY chi_bo ORDER BY chi_bo'
        );
        
        console.log('\n📊 Thống kê theo chi bộ:');
        stats.forEach(stat => {
            console.log(`   ${stat.chi_bo}: ${stat.so_luong} đảng viên`);
        });
        
        const [total] = await connection.execute('SELECT COUNT(*) as total FROM dang_vien');
        console.log(`\n📈 Tổng cộng: ${total[0].total} đảng viên`);
        
    } catch (error) {
        console.error('❌ Lỗi khi nhập dữ liệu:', error);
    } finally {
        await connection.end();
        console.log('\n🔌 Đã đóng kết nối database.');
    }
}

// Hàm chuyển đổi tên chi bộ từ key sang tên đẹp
function convertChiBoName(key) {
    const nameMap = {
        'doi-bao-tri-san-duong': 'Đội bảo trì sân đường',
        'doi-moi-truong-khu-bay': 'Đội môi trường khu bay',
        'doi-thiet-bi-co-dien-den-sb': 'Đội thiết bị cơ điện đèn SB',
        'doi-thiet-bi-thong-tin-dan-duong': 'Đội thiết bị thông tin dẫn đường',
        'van-phong-trung-tam': 'Văn phòng trung tâm'
    };
    
    return nameMap[key] || key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Hàm xác định trạng thái đảng viên
function determineTrangThai(chucVuDang, ngayVaoDang) {
    if (chucVuDang && chucVuDang.includes('ĐVDB')) {
        return 'du_bi'; // Đảng viên dự bị
    }
    if (!ngayVaoDang || ngayVaoDang.trim() === '') {
        return 'chua_ket_nap'; // Chưa kết nạp
    }
    return 'hoat_dong'; // Đang hoạt động
}

// Hàm chuyển đổi định dạng ngày tháng (giữ nguyên từ script cũ)
function formatDate(dateStr) {
    if (!dateStr || dateStr.toString().trim() === '') return null;
    
    let cleanDate = dateStr.toString().trim();
    cleanDate = cleanDate.replace(/[^0-9./-]/g, '');
    
    // DD.MM.YY hoặc DD.MM.YYYY
    if (cleanDate.match(/^\d{1,2}\.\d{1,2}\.\d{2,4}$/)) {
        const parts = cleanDate.split('.');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        
        if (year.length === 2) {
            year = parseInt(year) < 30 ? `20${year}` : `19${year}`;
        }
        
        return `${year}-${month}-${day}`;
    }
    
    // DD/MM/YYYY
    if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = cleanDate.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    
    // YYYY-MM-DD
    if (cleanDate.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        return cleanDate;
    }
    
    console.log(`⚠️  Không thể parse ngày: "${dateStr}"`);
    return null;
}

// Chạy script
importAllMembers();
