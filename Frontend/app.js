// ============================================
// HỆ THỐNG QUẢN LÝ CÔNG TÁC ĐẢNG
// Phiên bản 1.0 - App Logic
// ============================================

// Cơ sở dữ liệu tạm thời
const database = {
    chibos: [
        {
            id: 1,
            maChiBo: "CB_TB_TTDD",
            tenChiBo: "Chi bộ Đội Thiết bị Thông tin Dẫn đường",
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
        },
        {
            id: 3,
            maDangVien: "DV-003",
            hoVaTen: "Lê Thị B",
            gioiTinh: "Nữ",
            chiBoId: 1,
            chucVuTrongDang: "Chi ủy viên"
        }
    ],
    nghiquyets: [
        {
            id: 1,
            soHieu: "DTNQ/CB-01-2026",
            tieuDe: "lãnh đạo thực hiện nhiệm vụ tháng 01 năm 2026",
            thang: 1,
            nam: 2026,
            trangThai: "DA_DUYET",
            loai: "THANG"
        },
        {
            id: 2,
            soHieu: "DTNQ/CB-02-2026",
            tieuDe: "lãnh đạo thực hiện nhiệm vụ tháng 02 năm 2026",
            thang: 2,
            nam: 2026,
            trangThai: "CHO_DUYET",
            loai: "THANG"
        }
    ]
};

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    setupEventListeners();
});

// Cập nhật thống kê
function updateStats() {
    document.getElementById('countChiBo').textContent = database.chibos.length;
    document.getElementById('countDangVien').textContent = database.dangviens.length;
    document.getElementById('countNghiQuyet').textContent = database.nghiquyets.length;
    
    document.getElementById('sideChiBo').textContent = database.chibos.length;
    document.getElementById('sideDangVien').textContent = database.dangviens.length;
    document.getElementById('sideNghiQuyet').textContent = database.nghiquyets.length;
}

// Thiết lập sự kiện
function setupEventListeners() {
    // Menu click
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.list-group-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Điều hướng trang
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

// Trang chủ
function loadHome() {
    document.getElementById('content').innerHTML = `
        <h2 class="mb-4"><i class="bi bi-house-door text-danger"></i> Tổng quan hệ thống</h2>
        
        <div class="row mb-4">
            <div class="col-md-4 mb-3">
                <div class="card card-stat text-white bg-primary">
                    <div class="card-body text-center">
                        <h1 class="display-4">${database.chibos.length}</h1>
                        <p class="card-text">Chi bộ</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card card-stat text-white bg-success">
                    <div class="card-body text-center">
                        <h1 class="display-4">${database.dangviens.length}</h1>
                        <p class="card-text">Đảng viên</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card card-stat text-white bg-warning">
                    <div class="card-body text-center">
                        <h1 class="display-4">${database.nghiquyets.length}</h1>
                        <p class="card-text">Nghị quyết</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h5 class="mb-0"><i class="bi bi-building me-2"></i>Chi bộ hiện có</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            ${database.chibos.map(cb => `
                                <div class="list-group-item">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">${cb.maChiBo}</h6>
                                        <span class="badge bg-primary">${cb.soDangVien} ĐV</span>
                                    </div>
                                    <p class="mb-1">${cb.tenChiBo}</p>
                                    <small>${cb.diaChi}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Hoạt động gần đây</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            <div class="list-group-item">
                                <small class="text-muted">Hôm nay</small>
                                <p class="mb-1">Đang soạn thảo Nghị quyết tháng 02/2026</p>
                            </div>
                            <div class="list-group-item">
                                <small class="text-muted">03/01/2026</small>
                                <p class="mb-1">Ban hành Nghị quyết tháng 01/2026</p>
                            </div>
                            <div class="list-group-item">
                                <small class="text-muted">15/12/2025</small>
                                <p class="mb-1">Hoàn thành báo cáo tổng kết năm 2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Quản lý Chi bộ
function loadChiBo() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-building text-danger me-2"></i>Quản lý Chi bộ</h2>
            <button class="btn btn-dang" onclick="themChiBo()">
                <i class="bi bi-plus-circle me-1"></i>Thêm Chi bộ
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Mã Chi bộ</th>
                        <th>Tên Chi bộ</th>
                        <th>Số Đảng viên</th>
                        <th>Địa chỉ</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${database.chibos.map(cb => `
                        <tr>
                            <td><strong>${cb.maChiBo}</strong></td>
                            <td>${cb.tenChiBo}</td>
                            <td><span class="badge bg-primary">${cb.soDangVien}</span></td>
                            <td><small>${cb.diaChi}</small></td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning me-1">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Quản lý Đảng viên
function loadDangVien() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-people text-danger me-2"></i>Quản lý Đảng viên</h2>
            <button class="btn btn-dang" onclick="themDangVien()">
                <i class="bi bi-person-plus me-1"></i>Thêm Đảng viên
            </button>
        </div>
        
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Mã ĐV</th>
                        <th>Họ và tên</th>
                        <th>Giới tính</th>
                        <th>Chức vụ Đảng</th>
                        <th>Ngày vào Đảng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${database.dangviens.map(dv => `
                        <tr>
                            <td><strong class="text-primary">${dv.maDangVien}</strong></td>
                            <td>${dv.hoVaTen}</td>
                            <td>${dv.gioiTinh}</td>
                            <td>${dv.chucVuTrongDang || '-'}</td>
                            <td>${dv.ngayVaoDang || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary me-1">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="card mt-4">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0"><i class="bi bi-pie-chart me-2"></i>Phân bố Đảng viên</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-4">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Chi bộ Thiết bị:</span>
                            <span class="badge bg-primary">${database.dangviens.length} đảng viên</span>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-primary" style="width: 100%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Quản lý Nghị quyết
function loadNghiQuyet() {
    document.getElementById('content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-file-text text-danger me-2"></i>Quản lý Nghị quyết</h2>
            <button class="btn btn-dang" onclick="themNghiQuyet()">
                <i class="bi bi-file-earmark-plus me-1"></i>Thêm Nghị quyết
            </button>
        </div>
        
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Tìm nghị quyết...">
                </div>
            </div>
            <div class="col-md-4">
                <select class="form-select">
                    <option>Tất cả trạng thái</option>
                    <option>Bản nháp</option>
                    <option>Chờ duyệt</option>
                    <option>Đã duyệt</option>
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select">
                    <option>Tất cả loại</option>
                    <option>Tháng</option>
                    <option>Quý</option>
                    <option>Năm</option>
                </select>
            </div>
        </div>
        
        <div class="list-group">
            ${database.nghiquyets.map(nq => {
                const badgeClass = nq.trangThai === 'DA_DUYET' ? 'bg-success' : 
                                 nq.trangThai === 'CHO_DUYET' ? 'bg-warning' : 'bg-secondary';
                return `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <div>
                                <h5 class="mb-1">
                                    <span class="badge ${badgeClass} me-2">${nq.trangThai}</span>
                                    ${nq.soHieu}
                                </h5>
                                <p class="mb-1">${nq.tieuDe}</p>
                                <small class="text-muted">
                                    <i class="bi bi-calendar"></i> Tháng ${nq.thang}/${nq.nam} | 
                                    <i class="bi bi-tag"></i> ${nq.loai}
                                </small>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-warning">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Báo cáo
function loadBaoCao() {
    document.getElementById('content').innerHTML = `
        <h2 class="mb-4"><i class="bi bi-bar-chart text-danger me-2"></i>Báo cáo thống kê</h2>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Thống kê Đảng viên</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="chartDangVien" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">Thống kê Nghị quyết</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="chartNghiQuyet" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header bg-warning text-white">
                <h5 class="mb-0">Báo cáo nhanh</h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-md-3">
                        <div class="display-6 text-primary">${database.chibos.length}</div>
                        <small>Chi bộ</small>
                    </div>
                    <div class="col-md-3">
                        <div class="display-6 text-success">${database.dangviens.length}</div>
                        <small>Đảng viên</small>
                    </div>
                    <div class="col-md-3">
                        <div class="display-6 text-warning">${database.nghiquyets.length}</div>
                        <small>Nghị quyết</small>
                    </div>
                    <div class="col-md-3">
                        <div class="display-6 text-danger">${database.nghiquyets.filter(nq => nq.trangThai === 'DA_DUYET').length}</div>
                        <small>Đã duyệt</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Các hàm thêm mới (đơn giản)
function themChiBo() {
    alert('Chức năng Thêm Chi bộ - Đang phát triển');
}

function themDangVien() {
    alert('Chức năng Thêm Đảng viên - Đang phát triển');
}

function themNghiQuyet() {
    alert('Chức năng Thêm Nghị quyết - Đang phát triển');
}

