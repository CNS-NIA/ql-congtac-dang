// ==================== QUẢN LÝ ĐẢNG VIÊN ====================
let currentPage = 1;
const itemsPerPage = 10;

// Load danh sách đảng viên
async function loadDangVien(page = 1) {
    try {
        showLoading();
        const response = await fetch('/api/dangvien');
        if (!response.ok) throw new Error('Lỗi kết nối server');
        
        const dangVienList = await response.json();
        displayDangVien(dangVienList);
        updateStats(dangVienList.length);
        hideLoading();
        
    } catch (error) {
        console.error('Lỗi tải danh sách:', error);
        document.getElementById('membersTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="error-message">
                    ❌ Lỗi tải dữ liệu: ${error.message}
                    <button onclick="loadDangVien()" class="btn-retry">Thử lại</button>
                </td>
            </tr>`;
        hideLoading();
    }
}
// ==================== TỰ ĐỘNG CẬP NHẬT SAU KHI IMPORT ====================
function setupAutoRefresh() {
    // Kiểm tra mỗi 10 giây xem có dữ liệu mới không
    setInterval(async () => {
        try {
            const response = await fetch('/api/dangvien/count');
            const count = await response.json();
            const currentCount = document.querySelectorAll('#membersTableBody tr').length;
            
            // Nếu số lượng khác nhau -> reload
            if (count !== currentCount && currentCount > 0) {
                console.log('🔄 Phát hiện dữ liệu mới, đang reload...');
                loadDangVien();
            }
        } catch (error) {
            // Bỏ qua lỗi
        }
    }, 10000); // 10 giây kiểm tra 1 lần
    
    // Thêm event listener cho upload thành công
    document.addEventListener('uploadSuccess', function() {
        console.log('📬 Nhận tín hiệu upload thành công, reload danh sách...');
        setTimeout(() => loadDangVien(), 2000); // Chờ 2 giây rồi reload
    });
}

// Thêm API đếm số lượng
// (Thêm vào server.js)
app.get('/api/dangvien/count', (req, res) => {
    db.query('SELECT COUNT(*) as count FROM dang_vien', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results[0].count);
    });
});

// Hiển thị danh sách
function displayDangVien(dangVienList) {
    const tbody = document.getElementById('membersTableBody');
    
    if (!dangVienList || dangVienList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    📭 Chưa có dữ liệu đảng viên
                    <br><small>Hãy <a href="/import.html">import dữ liệu</a> hoặc thêm đảng viên mới</small>
                </td>
            </tr>`;
        return;
    }
    
    let html = '';
    dangVienList.forEach((member, index) => {
        html += `
        <tr data-id="${member.id}">
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(member.ho_ten || 'Chưa có')}</strong></td>
            <td>${escapeHtml(member.so_the_dang || 'Chưa có')}</td>
            <td><span class="chip">${escapeHtml(member.chi_bo || 'Chưa phân bổ')}</span></td>
            <td>${escapeHtml(member.chuc_vu || 'Đảng viên')}</td>
            <td><span class="status-badge ${getStatusClass(member.trang_thai)}">${member.trang_thai || 'Đang sinh hoạt'}</span></td>
            <td class="action-buttons">
                <button class="btn-icon btn-edit" title="Sửa" onclick="openEditModal(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-view" title="Xem chi tiết" onclick="viewDetail(${member.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-delete" title="Xóa" onclick="confirmDelete(${member.id}, '${escapeHtml(member.ho_ten)}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
}

// ==================== THÊM ĐẢNG VIÊN MỚI ====================
async function addDangVien() {
    const hoTen = document.getElementById('hoTen').value.trim();
    const soTheDang = document.getElementById('soTheDang').value.trim();
    const ngaySinh = document.getElementById('ngaySinh').value;
    const chiBo = document.getElementById('chiBo').value.trim();
    const chucVu = document.getElementById('chucVu').value.trim();
    
    if (!hoTen) {
        showAlert('Vui lòng nhập Họ tên', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/dangvien', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ho_ten: hoTen,
                so_the_dang: soTheDang,
                ngay_sinh: ngaySinh || null,
                chi_bo: chiBo,
                chuc_vu: chucVu
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('✅ Đã thêm đảng viên thành công!', 'success');
            document.getElementById('addMemberForm').reset();
            loadDangVien();
            loadChiBoList();
        } else {
            showAlert(`❌ Lỗi: ${result.error}`, 'error');
        }
        
    } catch (error) {
        showAlert(`❌ Lỗi kết nối: ${error.message}`, 'error');
    }
}

// ==================== SỬA ĐẢNG VIÊN ====================
async function openEditModal(id) {
    try {
        const response = await fetch(`/api/dangvien/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy đảng viên');
        
        const member = await response.json();
        
        // Hiển thị modal sửa
        document.getElementById('editId').value = member.id;
        document.getElementById('editHoTen').value = member.ho_ten || '';
        document.getElementById('editSoTheDang').value = member.so_the_dang || '';
        document.getElementById('editNgaySinh').value = member.ngay_sinh || '';
        document.getElementById('editChiBo').value = member.chi_bo || '';
        document.getElementById('editChucVu').value = member.chuc_vu || '';
        document.getElementById('editTrinhDo').value = member.trinh_do || '';
        document.getElementById('editQueQuan').value = member.que_quan || '';
        
        // Hiển thị modal
        document.getElementById('editModal').style.display = 'block';
        
    } catch (error) {
        showAlert(`❌ Lỗi: ${error.message}`, 'error');
    }
}

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const hoTen = document.getElementById('editHoTen').value.trim();
    
    if (!hoTen) {
        showAlert('Vui lòng nhập Họ tên', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/dangvien/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ho_ten: hoTen,
                so_the_dang: document.getElementById('editSoTheDang').value.trim(),
                ngay_sinh: document.getElementById('editNgaySinh').value || null,
                chi_bo: document.getElementById('editChiBo').value.trim(),
                chuc_vu: document.getElementById('editChucVu').value.trim(),
                trinh_do: document.getElementById('editTrinhDo').value.trim(),
                que_quan: document.getElementById('editQueQuan').value.trim()
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showAlert('✅ Đã cập nhật đảng viên thành công!', 'success');
            closeEditModal();
            loadDangVien();
        } else {
            showAlert(`❌ Lỗi: ${result.error}`, 'error');
        }
        
    } catch (error) {
        showAlert(`❌ Lỗi kết nối: ${error.message}`, 'error');
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// ==================== XÓA ĐẢNG VIÊN ====================
function confirmDelete(id, name) {
    if (confirm(`Bạn có chắc chắn muốn xóa đảng viên:\n"${name}"?`)) {
        deleteDangVien(id);
    }
}

async function deleteDangVien(id) {
    try {
        const response = await fetch(`/api/dangvien/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showAlert('✅ Đã xóa đảng viên thành công!', 'success');
            loadDangVien();
            updateStats();
        } else {
            showAlert(`❌ Lỗi: ${result.error}`, 'error');
        }
        
    } catch (error) {
        showAlert(`❌ Lỗi kết nối: ${error.message}`, 'error');
    }
}

// ==================== TÌM KIẾM ====================
let searchTimer;
function searchDangVien() {
    clearTimeout(searchTimer);
    const keyword = document.getElementById('searchMember').value.trim();
    
    searchTimer = setTimeout(async () => {
        if (!keyword) {
            loadDangVien();
            return;
        }
        
        try {
            const response = await fetch(`/api/dangvien/search?q=${encodeURIComponent(keyword)}`);
            const results = await response.json();
            displayDangVien(results);
            
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
        }
    }, 500);
}

// ==================== XEM CHI TIẾT ====================
async function viewDetail(id) {
    try {
        const response = await fetch(`/api/dangvien/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy');
        
        const member = await response.json();
        
        // Hiển thị modal chi tiết
        document.getElementById('detailContent').innerHTML = `
            <h3>${escapeHtml(member.ho_ten)}</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Số thẻ đảng:</strong>
                    <span>${escapeHtml(member.so_the_dang || 'Chưa có')}</span>
                </div>
                <div class="detail-item">
                    <strong>Chi bộ:</strong>
                    <span>${escapeHtml(member.chi_bo || 'Chưa phân bổ')}</span>
                </div>
                <div class="detail-item">
                    <strong>Chức vụ:</strong>
                    <span>${escapeHtml(member.chuc_vu || 'Đảng viên')}</span>
                </div>
                <div class="detail-item">
                    <strong>Chức vụ Đảng:</strong>
                    <span>${escapeHtml(member.chuc_vu_dang || 'Không')}</span>
                </div>
                <div class="detail-item">
                    <strong>Ngày sinh:</strong>
                    <span>${formatDate(member.ngay_sinh) || 'Chưa có'}</span>
                </div>
                <div class="detail-item">
                    <strong>Ngày vào Đảng:</strong>
                    <span>${formatDate(member.ngay_vao_dang) || 'Chưa có'}</span>
                </div>
                <div class="detail-item">
                    <strong>Trình độ:</strong>
                    <span>${escapeHtml(member.trinh_do || 'Chưa có')}</span>
                </div>
                <div class="detail-item">
                    <strong>Quê quán:</strong>
                    <span>${escapeHtml(member.que_quan || 'Chưa có')}</span>
                </div>
                <div class="detail-item">
                    <strong>Trạng thái:</strong>
                    <span class="status-badge ${getStatusClass(member.trang_thai)}">${member.trang_thai || 'Đang sinh hoạt'}</span>
                </div>
            </div>
        `;
        
        document.getElementById('detailModal').style.display = 'block';
        
    } catch (error) {
        showAlert(`❌ Lỗi: ${error.message}`, 'error');
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// ==================== TIỆN ÍCH ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

function getStatusClass(status) {
    if (!status) return 'status-active';
    if (status.includes('dự bị')) return 'status-pending';
    if (status.includes('Cấp ủy')) return 'status-leader';
    return 'status-active';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

async function updateStats() {
    try {
        const response = await fetch('/api/dangvien');
        const data = await response.json();
        document.getElementById('totalMembers').textContent = data.length || 0;
    } catch (error) {
        console.error('Lỗi cập nhật thống kê:', error);
    }
}

async function loadChiBoList() {
    try {
        const response = await fetch('/api/chibo');
        const chiBoList = await response.json();
        
        const selects = document.querySelectorAll('.chi-bo-select');
        selects.forEach(select => {
            select.innerHTML = '<option value="">-- Chọn chi bộ --</option>';
            chiBoList.forEach(cb => {
                const option = document.createElement('option');
                option.value = cb;
                option.textContent = cb;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Lỗi tải chi bộ:', error);
    }
}

// ==================== KHỞI TẠO ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load dữ liệu ban đầu
    loadDangVien();
    loadChiBoList();
    
    // Gán sự kiện
    document.getElementById('addMemberForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addDangVien();
    });
    
    document.getElementById('searchMember').addEventListener('input', searchDangVien);
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editModal');
        const detailModal = document.getElementById('detailModal');
        
        if (event.target === editModal) closeEditModal();
        if (event.target === detailModal) closeDetailModal();
    });
    
    // Đóng modal bằng ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeEditModal();
            closeDetailModal();
        }
    });
});

// Thêm vào CSS inline
const style = document.createElement('style');
style.textContent = `
    /* Modal */
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .modal-content { background: white; margin: 5% auto; padding: 25px; border-radius: 10px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
    
    /* Form */
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #333; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    
    /* Alert */
    .alert { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 6px; z-index: 9999; max-width: 400px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
    .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .alert-close { background: none; border: none; float: right; font-size: 20px; cursor: pointer; }
    
    /* Status badges */
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-active { background: #d4edda; color: #155724; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-leader { background: #cce5ff; color: #004085; }
    
    /* Action buttons */
    .action-buttons { display: flex; gap: 5px; }
    .btn-icon { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; }
    .btn-edit { background: #e3f2fd; color: #1a237e; }
    .btn-view { background: #e8f5e9; color: #2e7d32; }
    .btn-delete { background: #ffebee; color: #c62828; }
    .btn-icon:hover { opacity: 0.8; }
    
    /* Detail view */
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
    .detail-item { padding: 10px; background: #f8f9fa; border-radius: 6px; }
    .detail-item strong { display: block; color: #666; font-size: 14px; }
    .detail-item span { font-size: 16px; }
    
    /* Loading */
    #loading { display: none; text-align: center; padding: 20px; }
    .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #1a237e; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    
    /* Responsive */
    @media (max-width: 768px) {
        .modal-content { width: 95%; margin: 10% auto; }
        .detail-grid { grid-template-columns: 1fr; }
    }
`;
document.head.appendChild(style);
