// utils.js - Các hàm tiện ích

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

// Export to Excel
function exportToExcel(data, filename = 'danh-sach-dang-vien.xlsx') {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
}

// Import from Excel
function importFromExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        callback(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

// Generate PDF
function generatePDF(content, filename = 'bao-cao.pdf') {
    // Implementation for PDF generation
}

// Validation
function validateDangVien(data) {
    const errors = [];
    if (!data.maDangVien) errors.push('Mã đảng viên là bắt buộc');
    if (!data.hoVaTen) errors.push('Họ tên là bắt buộc');
    if (!data.ngayVaoDang) errors.push('Ngày vào đảng là bắt buộc');
    return errors;
}

// Search functions
function searchDangVien(keyword) {
    return database.dangviens.filter(dv => 
        dv.hoVaTen.toLowerCase().includes(keyword.toLowerCase()) ||
        dv.maDangVien.toLowerCase().includes(keyword.toLowerCase()) ||
        dv.soTheDang.toLowerCase().includes(keyword.toLowerCase())
    );
}
