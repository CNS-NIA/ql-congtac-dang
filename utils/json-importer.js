const db = require('./database'); // Kết nối database

class JsonImporter {
    /**
     * Chuyển đổi định dạng ngày từ "15.05.76" hoặc "15/05/1976" sang "1976-05-15"
     */
    static normalizeDate(dateStr) {
        if (!dateStr || dateStr.trim() === '') return null;
        
        try {
            // Loại bỏ khoảng trắng
            dateStr = dateStr.trim();
            
            // Chuẩn hóa định dạng
            let day, month, year;
            
            if (dateStr.includes('.')) {
                // Định dạng "15.05.76" hoặc "15.05.1976"
                const parts = dateStr.split('.');
                day = parts[0];
                month = parts[1];
                year = parts[2];
            } else if (dateStr.includes('/')) {
                // Định dạng "15/05/1976"
                const parts = dateStr.split('/');
                day = parts[0];
                month = parts[1];
                year = parts[2];
            } else {
                // Định dạng "15-05-1976"
                const parts = dateStr.split('-');
                day = parts[0];
                month = parts[1];
                year = parts[2];
            }
            
            // Xử lý năm 2 chữ số
            if (year.length === 2) {
                const yearNum = parseInt(year);
                year = (yearNum < 30) ? `20${year}` : `19${year}`;
            }
            
            // Đảm bảo đủ 2 chữ số cho ngày và tháng
            day = day.padStart(2, '0');
            month = month.padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.warn(`Không thể parse ngày: ${dateStr}`, error);
            return null;
        }
    }

    /**
     * Xác định trạng thái đảng viên
     */
    static determineStatus(chucVuDang, soTheDang) {
        if (!soTheDang || soTheDang.trim() === '') {
            return 'Chưa có số thẻ';
        }
        
        const chucVu = chucVuDang || '';
        if (chucVu.includes('ĐVDB')) return 'Đảng viên dự bị';
        if (chucVu.includes('CUV') || chucVu.includes('Bí thư') || chucVu.includes('Phó BTCB')) {
            return 'Cấp ủy viên';
        }
        
        return 'Đảng viên chính thức';
    }

    /**
     * Import dữ liệu từ JSON
     */
    static async importFromJson(jsonData, fileName, chiBoName) {
        try {
            if (!Array.isArray(jsonData)) {
                throw new Error('Dữ liệu JSON phải là mảng');
            }

            console.log(`📥 Đang import ${jsonData.length} đảng viên từ file: ${fileName}`);
            
            const results = {
                total: jsonData.length,
                success: 0,
                skipped: 0,
                errors: []
            };

            // Xử lý từng đảng viên
            for (const [index, item] of jsonData.entries()) {
                try {
                    // Bỏ qua nếu không có họ tên
                    if (!item.Ho_va_Ten || item.Ho_va_Ten.trim() === '') {
                        results.skipped++;
                        continue;
                    }

                    // Chuẩn hóa dữ liệu
                    const dangVienData = {
                        ho_ten: item.Ho_va_Ten.trim(),
                        ngay_sinh: this.normalizeDate(item.Ngay_sinh),
                        so_the_dang: item.So_the_Dang ? item.So_the_Dang.trim() : '',
                        chi_bo: chiBoName || this.extractChiBoFromFileName(fileName),
                        chuc_vu: item.Chuc_vu || '',
                        chuc_vu_dang: item.Chuc_vu_Dang || '',
                        trinh_do: item.Trinh_do || '',
                        que_quan: item.Que_quan || '',
                        ngay_vao_dang: this.normalizeDate(item.Ngay_vao_Dang),
                        trang_thai: this.determineStatus(item.Chuc_vu_Dang, item.So_the_Dang),
                        file_nguon: fileName
                    };

                    // Kiểm tra trùng số thẻ đảng
                    if (dangVienData.so_the_dang) {
                        const [existing] = await db.execute(
                            'SELECT id FROM dang_vien WHERE so_the_dang = ?',
                            [dangVienData.so_the_dang]
                        );
                        
                        if (existing.length > 0) {
                            // Cập nhật nếu đã tồn tại
                            await db.execute(
                                `UPDATE dang_vien 
                                 SET ho_ten = ?, ngay_sinh = ?, chi_bo = ?, chuc_vu = ?,
                                     chuc_vu_dang = ?, trinh_do = ?, que_quan = ?,
                                     ngay_vao_dang = ?, trang_thai = ?, file_nguon = ?
                                 WHERE so_the_dang = ?`,
                                [
                                    dangVienData.ho_ten,
                                    dangVienData.ngay_sinh,
                                    dangVienData.chi_bo,
                                    dangVienData.chuc_vu,
                                    dangVienData.chuc_vu_dang,
                                    dangVienData.trinh_do,
                                    dangVienData.que_quan,
                                    dangVienData.ngay_vao_dang,
                                    dangVienData.trang_thai,
                                    dangVienData.file_nguon,
                                    dangVienData.so_the_dang
                                ]
                            );
                            console.log(`✓ Cập nhật: ${dangVienData.ho_ten}`);
                        } else {
                            // Thêm mới
                            await db.execute(
                                `INSERT INTO dang_vien 
                                 (ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu, 
                                  chuc_vu_dang, trinh_do, que_quan, ngay_vao_dang, 
                                  trang_thai, file_nguon)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                Object.values(dangVienData)
                            );
                            console.log(`+ Thêm mới: ${dangVienData.ho_ten}`);
                        }
                    } else {
                        // Không có số thẻ - thêm mới bình thường
                        await db.execute(
                            `INSERT INTO dang_vien 
                             (ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu, 
                              chuc_vu_dang, trinh_do, que_quan, ngay_vao_dang, 
                              trang_thai, file_nguon)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            Object.values(dangVienData)
                        );
                        console.log(`+ Thêm (không số thẻ): ${dangVienData.ho_ten}`);
                    }

                    results.success++;

                } catch (rowError) {
                    console.error(`❌ Lỗi tại dòng ${index + 1}:`, rowError.message);
                    results.errors.push({
                        row: index + 1,
                        name: item.Ho_va_Ten || 'Không có tên',
                        error: rowError.message
                    });
                }
            }

            console.log(`✅ Import hoàn tất! Thành công: ${results.success}, Bỏ qua: ${results.skipped}, Lỗi: ${results.errors.length}`);
            return results;

        } catch (error) {
            console.error('❌ Lỗi import JSON:', error);
            throw error;
        }
    }

    /**
     * Trích xuất tên chi bộ từ tên file
     */
    static extractChiBoFromFileName(fileName) {
        const mapping = {
            'doi-bao-tri-san-duong.json': 'Đội Bảo trì Sân đường',
            'doi-moi-truong-khu-bay.json': 'Đội Môi trường Khu bay',
            'doi-thiet-bi-co-dien-den-sb.json': 'Đội Thiết bị Cơ điện Đèn SB',
            'doi-thiet-bi-thong-tin-dan-duong.json': 'Đội Thiết bị Thông tin Dẫn đường',
            'van-phong-trung-tam.json': 'Văn phòng Trung tâm'
        };
        
        return mapping[fileName] || fileName.replace('.json', '').replace(/-/g, ' ');
    }
}

module.exports = JsonImporter;
