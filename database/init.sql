-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS ql_cong_tac_dang;
USE ql_cong_tac_dang;

-- Bảng đảng viên
CREATE TABLE IF NOT EXISTS dang_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    so_the_dang VARCHAR(20) UNIQUE NOT NULL,
    chi_bo VARCHAR(50),
    chuc_vu VARCHAR(50),
    trang_thai VARCHAR(20) DEFAULT 'Đang sinh hoạt',
    ngay_vao_dang DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE dang_vien
ADD COLUMN trinh_do VARCHAR(100),
ADD COLUMN que_quan VARCHAR(200),
ADD COLUMN chuc_vu_dang VARCHAR(50),
ADD COLUMN ngay_vao_dang_chinh_thuc DATE,
ADD COLUMN file_nguon VARCHAR(100); -- Lưu tên file gốc (vd: doi-bao-tri-san-duong.json)

-- Hoặc tạo bảng mới nếu chưa chạy init.sql
CREATE TABLE IF NOT EXISTS dang_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    so_the_dang VARCHAR(50) UNIQUE,
    chi_bo VARCHAR(100),
    chuc_vu VARCHAR(100),
    chuc_vu_dang VARCHAR(50),
    trinh_do VARCHAR(150),
    que_quan VARCHAR(200),
    ngay_vao_dang DATE,
    trang_thai VARCHAR(30) DEFAULT 'Đang sinh hoạt',
    file_nguon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Chèn dữ liệu mẫu
INSERT INTO dang_vien (ho_ten, ngay_sinh, so_the_dang, chi_bo, chuc_vu) VALUES
('Nguyễn Văn A', '1985-03-15', 'NB-001', 'Chi bộ Khai thác 1', 'Đảng viên'),
('Trần Thị B', '1990-08-22', 'NB-002', 'Chi bộ Kỹ thuật', 'Bí thư Chi bộ'),
('Lê Văn C', '1988-11-30', 'NB-003', 'Chi bộ Hành chính', 'Phó Bí thư'),
('Phạm Thị D', '1992-05-10', 'NB-004', 'Chi bộ Khai thác 1', 'Đảng viên'),
('Hoàng Văn E', '1983-12-05', 'NB-005', 'Chi bộ Kỹ thuật', 'Ủy viên Ban chấp hành');

-- Tạo bảng người dùng (cho chức năng đăng nhập sau này)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'can_bo', 'dang_vien') DEFAULT 'dang_vien',
    dang_vien_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dang_vien_id) REFERENCES dang_vien(id)
);

-- Chèn tài khoản admin mẫu (mật khẩu: admin123)
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2b$10$7V2A3q4wW8cP6dKp5fL6ZuY9gQrS1tU2v3wX4y5zA6B7C8D9E0F1G2H', 'Quản trị viên Hệ thống', 'admin');
