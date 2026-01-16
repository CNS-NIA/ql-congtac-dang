# Backend - Hệ thống Quản lý Công tác Đảng

Backend API cho hệ thống Quản lý Công tác Đảng - Chi bộ Đội Thiết bị Thông tin Dẫn đường.

## API Endpoints

### Chi bộ
- `GET /api/chibo` - Lấy danh sách Chi bộ
- `GET /api/chibo/:id` - Lấy thông tin Chi bộ theo ID

### Đảng viên
- `GET /api/dangvien` - Lấy danh sách Đảng viên (có phân trang)
- `POST /api/dangvien` - Thêm Đảng viên mới

### Nghị quyết
- `GET /api/nghiquyet` - Lấy danh sách Nghị quyết
- `POST /api/nghiquyet` - Tạo Nghị quyết mới

### Health Check
- `GET /health` - Kiểm tra tình trạng server

## Deploy trên Render

1. Tạo Web Service mới trên Render
2. Connect với repository này
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables: Không cần (cho phiên bản này)

## Local Development

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start

# Chạy với nodemon (auto reload)
npm run dev
