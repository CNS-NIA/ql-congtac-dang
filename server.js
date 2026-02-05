const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Kết nối database (CẦN CẤU HÌNH LẠI)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // ĐỔI THÀNH USER CỦA BẠN
  password: '', // ĐỔI THÀNH PASSWORD CỦA BẠN
  database: 'dang_management' // ĐẢM BẢO ĐÃ TẠO DATABASE
});

// Cấu hình upload file
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes cơ bản
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API mẫu cho quản lý đảng viên
app.get('/api/dangvien', (req, res) => {
  db.query('SELECT * FROM dang_vien', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/dangvien', (req, res) => {
  const { ho_ten, ngay_sinh, chuc_vu } = req.body;
  db.query(
    'INSERT INTO dang_vien (ho_ten, ngay_sinh, chuc_vu) VALUES (?, ?, ?)',
    [ho_ten, ngay_sinh, chuc_vu],
    (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

// Route upload file
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ 
    message: 'File uploaded successfully', 
    filename: req.file.filename 
  });
});

// Khởi động server
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối database:', err);
    return;
  }
  console.log('Đã kết nối database thành công');
  
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
});
