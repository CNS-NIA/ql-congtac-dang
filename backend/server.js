const JsonImporter = require('./utils/json-importer');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Cấu hình upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file JSON'), false);
        }
    }
});

// API upload file JSON
app.post('/api/upload-json', upload.single('jsonFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng chọn file JSON' 
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        
        // Đọc file JSON
        const fileContent = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        // Xác định chi bộ
        let chiBoName = req.body.chiBo;
        if (!chiBoName) {
            chiBoName = JsonImporter.extractChiBoFromFileName(fileName);
        }

        // Import dữ liệu
        const result = await JsonImporter.importFromJson(jsonData, fileName, chiBoName);

        // Xóa file tạm
        await fs.unlink(filePath);

        res.json({
            success: true,
            message: `Đã import ${result.success}/${result.total} đảng viên`,
            details: result
        });

    } catch (error) {
        console.error('Lỗi upload:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API import từ URL (nếu bạn có file trên server)
app.post('/api/import-from-url', async (req, res) => {
    try {
        const { url, chiBo } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'Thiếu URL' });
        }

        // Tải file từ URL
        const response = await fetch(url);
        const jsonData = await response.json();
        
        const fileName = path.basename(url);
        const result = await JsonImporter.importFromJson(jsonData, fileName, chiBo);

        res.json({
            success: true,
            message: `Đã import ${result.success} đảng viên từ ${fileName}`,
            details: result
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API lấy danh sách chi bộ từ database
app.get('/api/danhsach-chibo', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT DISTINCT chi_bo, COUNT(*) as so_luong FROM dang_vien WHERE chi_bo IS NOT NULL GROUP BY chi_bo ORDER BY chi_bo'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
