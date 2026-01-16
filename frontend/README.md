# Hệ thống Quản lý Công tác Đảng - Frontend

Frontend hoàn chỉnh cho hệ thống Quản lý Công tác Đảng, Chi bộ Đội Thiết bị Thông tin Dẫn đường.

## Tính năng
- ✅ Quản lý Chi bộ
- ✅ Quản lý Đảng viên (hỗ trợ 1000+ bản ghi)
- ✅ Phân trang, tìm kiếm, sắp xếp
- ✅ Thêm/Sửa/Xóa đảng viên
- ✅ Xuất Excel/Import Excel
- ✅ Quản lý Nghị quyết
- ✅ Báo cáo thống kê
- ✅ Responsive design

## Công nghệ
- HTML5, CSS3, JavaScript ES6+
- Bootstrap 5
- DataTables.js
- SheetJS (Excel import/export)

## Cài đặt
1. Clone repository
2. Mở file `index.html` trong trình duyệt
3. Không cần cài đặt thêm

## Deploy lên Render
1. Tạo Web Service mới
2. Build Command: (để trống)
3. Start Command: `npx serve -s .`
4. Hoặc dùng static site hosting khác

## API Integration
Để kết nối với backend, sửa biến `API_BASE_URL` trong `app.js`:
```javascript
const API_BASE_URL = "https://your-backend-url.com";
