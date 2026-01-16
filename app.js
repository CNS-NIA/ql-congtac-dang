// Database (tạm thời dùng localStorage)
let database = {
    chibos: [
        {
            id: 1,
            maChiBo: "CB_TB_TTDD",
            tenChiBo: "Chi bộ Đội Thiết bị Thông tin Dẫn đường",
            dangBoId: 1,
            soDangVien: 15,
            diaChi: "Cảng HKQT Nội Bài",
            ngayThanhLap: "2010-01-01"
        }
    ],
    dangviens: [
        {
            id: 1,
            maDangVien: "DV-001",
            hoVaTen: "Trần Đỗ Hải",
            gioiTinh: "Nam",
            chiBoId: 1,
            chucVuTrongDang: "Bí thư Chi bộ",
            chucVuChuyenMon: "Trưởng đội",
            ngayVaoDang: "2015-06-15"
        },
        {
            id: 2,
            maDangVien: "DV-002",
            hoVaTen: "Nguyễn Văn A",
            gioiTinh: "Nam",
            chiBoId: 1,
            chucVuTrongDang: "Phó Bí thư",
            chucVuChuyenMon: "Phó đội"
        }
    ],
    nghiquyets: [
        {
            id: 1,
            soHieu: "DTNQ/CB-01-2026",
            chiBoId: 1,
            loai: "THANG",
            tieuDe: "lãnh đạo thực hiện nhiệm vụ tháng 01 năm 2026",
            thang: 1,
            nam: 2026,
            trangThai: "DA_DUYET",
            nguoiTaoId: 1
        }
    ]
};

// Load trang
function loadPage(page) {
    updateStats();
    
    if (page === 'home') {
        loadHome();
    } else if (page === 'chibo') {
        loadChiBo();
    } else if (page === 'dangvien') {
        loadDangVien();
    } else if (page === 'nghiquyet') {
        loadNghiQuyet();
    } else if (page === 'baocao') {
        loadBaoCao();
    }
}

// Cập nhật thống kê
function updateStats() {
    document.getElementById('count-chibo').textContent = database.chibos.length;
    document.getElementById('count-dangvien').textContent = database.dangviens.length;
    document.getElementById('count-nghiquyet').textContent = database.nghiquyets.length;
    
    document.getElementById('stats-chibo').textContent = database.chibos.length;
    document.getElementById('stats-dangvien').textContent = database.dangviens.length;
    document.getElementById('stats-nghiquyet').textContent = database.nghiquyets.length;
}

// Trang chủ
function loadHome() {
    document.getElementById('content').innerHTML = `
        <h2 class="mb-4">Tổng quan hệ thống</h2>
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-primary">
                    <div class="card-body text-center">
                        <h1>${database.chibos.length}</h1>
                        <p class="card-text">Chi bộ</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-success">
                    <div class="card-body text-center">
                        <h1>${database.dangviens.length}</h1>
                        <p class="card-text">Đảng viên</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-white bg-warning">
                    <div class="card-body text-center">
                        <h1>${database.nghiquyets.length}</h1>
                        <p class="card-text">Nghị quyết</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <h4>Chi bộ hiện có</h4>
                <ul class="list-group">
                    ${database.chibos.map(cb => `
                        <li class="list-group-item">
                            <strong>${cb.maChiBo}</strong>: ${cb.tenChiBo}
                            <span class="badge bg-primary float-end">${cb.soDangVien} ĐV</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="col-md-6">
                <h4>Hoạt động gần đây</h4>
                <div class="list-group">
                    <a href="#" class="list-group-item list-group-item-action">
                        <small class="text-muted">Hôm nay</small><br>
                        Thêm 01 đảng viên mới
                    </a>
                    <a href="#" class="list-group-item list-group-item-action">
                        <small class="text-muted">01/02/2026</small><br>
                        Ban hành Nghị quyết tháng 1/2026
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Quản lý Chi bộ
function loadChiBo() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý Chi bộ</h2>
            <button class="btn btn-success" onclick="themChiBo()">
                <i class="bi bi-plus-circle"></i> Thêm Chi bộ mới
            </button>
        </div>
        
        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Mã Chi bộ</th>
                    <th>Tên Chi bộ</th>
                    <th>Số Đảng viên</th>
                    <th>Ngày thành lập</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${database.chibos.map(cb => `
                    <tr>
                        <td><strong>${cb.maChiBo}</strong></td>
                        <td>${cb.tenChiBo}</td>
                        <td><span class="badge bg-primary">${cb.soDangVien}</span></td>
                        <td>${cb.ngayThanhLap || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-info me-1" onclick="suaChiBo(${cb.id})">Sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="xoaChiBo(${cb.id})">Xóa</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function themChiBo() {
    document.getElementById('content').innerHTML = `
        <h2 class="mb-4">Thêm Chi bộ mới</h2>
        <form onsubmit="return luuChiBoMoi(event)">
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Mã Chi bộ *</label>
                    <input type="text" class="form-control" id="maChiBo" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Tên Chi bộ *</label>
                    <input type="text" class="form-control" id="tenChiBo" required>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Ngày thành lập</label>
                    <input type="date" class="form-control" id="ngayThanhLap">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Số Đảng viên</label>
                    <input type="number" class="form-control" id="soDangVien" value="0">
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <textarea class="form-control" id="diaChi" rows="2"></textarea>
            </div>
            
            <div class="mt-3">
                <button type="submit" class="btn btn-primary">Lưu Chi bộ</button>
                <button type="button" class="btn btn-secondary" onclick="loadChiBo()">Hủy</button>
            </div>
        </form>
    `;
}

function luuChiBoMoi(event) {
    event.preventDefault();
    
    const newId = Math.max(...database.chibos.map(c => c.id)) + 1;
    
    database.chibos.push({
        id: newId,
        maChiBo: document.getElementById('maChiBo').value,
        tenChiBo: document.getElementById('tenChiBo').value,
        ngayThanhLap: document.getElementById('ngayThanhLap').value,
        soDangVien: parseInt(document.getElementById('soDangVien').value) || 0,
        diaChi: document.getElementById('diaChi').value,
        dangBoId: 1
    });
    
    alert('Đã thêm Chi bộ mới thành công!');
    loadChiBo();
    updateStats();
    return false;
}

// Quản lý Đảng viên
function loadDangVien() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý Đảng viên</h2>
            <button class="btn btn-success" onclick="themDangVien()">
                <i class="bi bi-person-plus"></i> Thêm Đảng viên
            </button>
        </div>
        
        <table class="table table-striped table-hover">
            <thead class="table-dark">
                <tr>
                    <th>Mã ĐV</th>
                    <th>Họ và tên</th>
                    <th>Giới tính</th>
                    <th>Chức vụ Đảng</th>
                    <th>Chi bộ</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${database.dangviens.map(dv => `
                    <tr>
                        <td><strong>${dv.maDangVien}</strong></td>
                        <td>${dv.hoVaTen}</td>
                        <td>${dv.gioiTinh}</td>
                        <td>${dv.chucVuTrongDang || ''}</td>
                        <td>${database.chibos.find(cb => cb.id === dv.chiBoId)?.tenChiBo || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-info me-1">Sửa</button>
                            <button class="btn btn-sm btn-danger">Xóa</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Quản lý Nghị quyết
function loadNghiQuyet() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Quản lý Nghị quyết</h2>
            <button class="btn btn-success" onclick="themNghiQuyet()">
                <i class="bi bi-file-earmark-plus"></i> Thêm Nghị quyết
            </button>
        </div>
        
        <div class="mb-3">
            <div class="btn-group">
                <button class="btn btn-outline-primary active">Tất cả</button>
                <button class="btn btn-outline-primary">Tháng</button>
                <button class="btn btn-outline-primary">Quý</button>
                <button class="btn btn-outline-primary">Năm</button>
            </div>
        </div>
        
        <div class="list-group">
            ${database.nghiquyets.map(nq => `
                <a href="#" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${nq.soHieu} - ${nq.tieuDe}</h5>
                        <span class="badge ${nq.trangThai === 'DA_DUYET' ? 'bg-success' : 'bg-warning'}">
                            ${nq.trangThai}
                        </span>
                    </div>
                    <p class="mb-1">Tháng ${nq.thang}/${nq.nam} - Chi bộ: ${database.chibos.find(cb => cb.id === nq.chiBoId)?.tenChiBo}</p>
                    <small class="text-muted">Người tạo: ${database.dangviens.find(dv => dv.id === nq.nguoiTaoId)?.hoVaTen}</small>
                </a>
            `).join('')}
        </div>
    `;
}

// Khởi động
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    loadHome();
});