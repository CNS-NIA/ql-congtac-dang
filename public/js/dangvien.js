/**
 * Quản lý Đảng viên - Frontend Logic
 */

// ==================== BIẾN VÀ HÀM GLOBAL ====================
let currentPage = 1;
let totalPages = 1;
let currentSearch = '';
let dangvienToDelete = null;

// API endpoints
const API_BASE = 'http://localhost:3000/api';
const API_TOKEN = 'Bearer admin123';

// HÀM GLOBAL - Được gọi từ onclick trong HTML
function editDangVien(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai) {
    setupEditForm(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai);
}

function showDeleteModal(id, name) {
    dangvienToDelete = id;
    document.getElementById('deleteMessage').textContent = `Bạn có chắc chắn muốn xóa đảng viên "${name}"?`;
    document.getElementById('deleteModal').style.display = 'flex';
}

function changePage(page) {
    currentPage = page;
    fetchDangVien(page, currentSearch);
}

// ==================== FUNCTIONS ====================

// Lấy danh sách đảng viên
async function fetchDangVien(page = 1, search = '') {
    try {
        showLoading();
        
        let url = `${API_BASE}/dangvien`;
        if (search) {
            url = `${API_BASE}/dangvien/search?q=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': API_TOKEN
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderTable(data.data);
        } else {
            showError('Không thể tải dữ liệu: ' + (data.error || 'Lỗi không xác định'));
        }
    } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
        showError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
}

// Hiển thị form chỉnh sửa
function setupEditForm(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai) {
    console.log('Đang mở form chỉnh sửa cho ID:', id); // Debug log
    
    // Hiển thị form container
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Điền dữ liệu vào form
        document.getElementById('dangvienId').value = id;
        document.getElementById('ho_ten').value = ho_ten || '';
        document.getElementById('ngay_sinh').value = ngay_sinh ? formatDateForInput(ngay_sinh) : '';
        document.getElementById('ngay_vao_dang').value = ngay_vao_dang ? formatDateForInput(ngay_vao_dang) : '';
        document.getElementById('chuc_vu').value = chuc_vu || '';
        document.getElementById('chi_bo').value = chi_bo || '';
        document.getElementById('trang_thai').value = trang_thai || 'hoat_dong';
        
        // Thay đổi tiêu đề form
        document.getElementById('formTitle').textContent = 'Chỉnh sửa Đảng viên';
        document.getElementById('submitText').textContent = 'Cập nhật';
        
        // Cuộn đến form
        window.scrollTo({
            top: formContainer.offsetTop - 20,
            behavior: 'smooth'
        });
        
        console.log('Form đã được hiển thị'); // Debug log
    } else {
        console.error('Không tìm thấy formContainer');
        alert('Lỗi: Không thể tìm thấy form. Vui lòng làm mới trang.');
    }
}

// Format date cho input type="date"
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Format date hiển thị
function formatDisplayDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hiển thị bảng
function renderTable(dangviens) {
    const tableBody = document.getElementById('tableBody');
    
    if (!dangviens || dangviens.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="loading">
                        <i class="fas fa-info-circle"></i> Không có dữ liệu
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = dangviens.map((dv, index) => {
        const statusClass = getStatusClass(dv.trang_thai);
        const statusText = getStatusText(dv.trang_thai);
        
        // Escape các ký tự đặc biệt để tránh lỗi JavaScript
        const safeName = dv.ho_ten ? dv.ho_ten.replace(/'/g, "\\'") : '';
        const safeChucVu = dv.chuc_vu ? dv.chuc_vu.replace(/'/g, "\\'") : '';
        const safeChiBo = dv.chi_bo ? dv.chi_bo.replace(/'/g, "\\'") : '';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${dv.ho_ten || 'N/A'}</strong></td>
                <td>${formatDisplayDate(dv.ngay_sinh)}</td>
                <td>${dv.chuc_vu || 'N/A'}</td>
                <td>${dv.chi_bo || 'N/A'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    <button class="btn action-btn btn-primary" 
                            onclick="editDangVien(${dv.id}, '${safeName}', '${dv.ngay_sinh || ''}', '${safeChucVu}', '${safeChiBo}', '${dv.ngay_vao_dang || ''}', '${dv.trang_thai || 'hoat_dong'}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn action-btn btn-danger" 
                            onclick="showDeleteModal(${dv.id}, '${safeName}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Helper functions
function getStatusClass(status) {
    switch(status) {
        case 'hoat_dong': return 'status-active';
        case 'nghi_huu': return 'status-retired';
        case 'chuyen_cong_tac': return 'status-transferred';
        default: return '';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'hoat_dong': return 'Đang hoạt động';
        case 'nghi_huu': return 'Đã nghỉ hưu';
        case 'chuyen_cong_tac': return 'Chuyển công tác';
        default: return status;
    }
}

function showLoading() {
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
                    </div>
                </td>
            </tr>
        `;
    }
}

function showError(message) {
    alert(`Lỗi: ${message}`);
}

function showSuccess(message) {
    alert(`Thành công: ${message}`);
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Trang đã tải xong'); // Debug log
    
    // Lấy các phần tử DOM
    const addBtn = document.getElementById('addBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const dangvienForm = document.getElementById('dangvienForm');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const deleteModal = document.getElementById('deleteModal');
    
    // Kiểm tra nếu các phần tử tồn tại
    if (!addBtn || !dangvienForm) {
        console.error('Không tìm thấy các phần tử cần thiết');
        return;
    }
    
    // Nút "Thêm Đảng viên"
    addBtn.addEventListener('click', function() {
        console.log('Click nút Thêm Đảng viên'); // Debug log
        
        // Reset form
        document.getElementById('dangvienId').value = '';
        document.getElementById('dangvienForm').reset();
        document.getElementById('formTitle').textContent = 'Thêm Đảng viên Mới';
        document.getElementById('submitText').textContent = 'Thêm Đảng viên';
        
        // Hiển thị form
        const formContainer = document.getElementById('formContainer');
        if (formContainer) {
            formContainer.style.display = 'block';
            window.scrollTo({
                top: formContainer.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    });
    
    // Nút "Hủy bỏ" trên form
    cancelBtn.addEventListener('click', function() {
        document.getElementById('formContainer').style.display = 'none';
    });
    
    // Nút "Làm mới"
    refreshBtn.addEventListener('click', function() {
        fetchDangVien(1, currentSearch);
    });
    
    // Tìm kiếm
    searchBtn.addEventListener('click', function() {
        currentSearch = searchInput.value.trim();
        fetchDangVien(1, currentSearch);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearch = this.value.trim();
            fetchDangVien(1, currentSearch);
        }
    });
    
    // Submit form
    dangvienForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const id = document.getElementById('dangvienId').value;
        
        try {
            const url = id ? `${API_BASE}/dangvien/${id}` : `${API_BASE}/dangvien`;
            const method = id ? 'PUT' : 'POST';
            
            // Chuyển FormData thành object
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_TOKEN
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess(id ? 'Cập nhật thành công!' : 'Thêm thành công!');
                
                // Ẩn form
                document.getElementById('formContainer').style.display = 'none';
                
                // Làm mới danh sách
                fetchDangVien(currentPage, currentSearch);
            } else {
                showError(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            showError('Không thể kết nối đến server');
        }
    });
    
    // Modal xóa
    confirmDelete.addEventListener('click', async function() {
        if (dangvienToDelete) {
            try {
                const response = await fetch(`${API_BASE}/dangvien/${dangvienToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': API_TOKEN
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess('Đã xóa thành công!');
                    fetchDangVien(currentPage, currentSearch);
                } else {
                    showError(result.error || 'Có lỗi xảy ra');
                }
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                showError('Không thể kết nối đến server');
            }
            
            // Đóng modal
            document.getElementById('deleteModal').style.display = 'none';
            dangvienToDelete = null;
        }
    });
    
    cancelDelete.addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
        dangvienToDelete = null;
    });
    
    // Đóng modal khi click bên ngoài
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            this.style.display = 'none';
            dangvienToDelete = null;
        }
    });
    
    // Load dữ liệu ban đầu
    fetchDangVien();
});
