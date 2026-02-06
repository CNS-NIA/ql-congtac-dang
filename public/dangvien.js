/**
 * Quản lý Đảng viên - Frontend Logic
 */

// ==================== BIẾN TOÀN CỤC ====================
window.currentPage = 1;
window.totalPages = 1;
window.currentSearch = '';
window.dangvienToDelete = null;

// ==================== FUNCTIONS ====================

// Lấy danh sách đảng viên
window.fetchDangVien = async function(page = 1, search = '') {
    try {
        showLoading();
        
        let url = `${window.API_BASE}/dangvien`;
        if (search) {
            url = `${window.API_BASE}/dangvien/search?q=${encodeURIComponent(search)}`;
        }
        
        console.log('DEBUG: Fetching URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': window.API_TOKEN
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('DEBUG: API Response:', data);
        
        if (data.success) {
            renderTable(data.data || []);
        } else {
            showError('Không thể tải dữ liệu: ' + (data.error || 'Lỗi không xác định'));
        }
    } catch (error) {
        console.error('Lỗi khi fetch dữ liệu:', error);
        showError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
};

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
        
        // Escape dữ liệu cho JavaScript
        const safeName = dv.ho_ten ? dv.ho_ten.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
        const safeChucVu = dv.chuc_vu ? dv.chuc_vu.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
        const safeChiBo = dv.chi_bo ? dv.chi_bo.replace(/'/g, "\\'").replace(/"/g, '\\"') : '';
        
        // Format ngày hiển thị
        const displayNgaySinh = formatDisplayDate(dv.ngay_sinh);
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${dv.ho_ten || 'N/A'}</strong></td>
                <td>${displayNgaySinh}</td>
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

function formatDisplayDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return dateString;
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
    console.log('DEBUG: Trang đã tải xong');
    
    // Nút "Thêm Đảng viên"
    document.getElementById('addBtn').addEventListener('click', function() {
        console.log('DEBUG: Click nút Thêm');
        
        // Reset form
        document.getElementById('dangvienId').value = '';
        document.getElementById('dangvienForm').reset();
        document.getElementById('formTitle').textContent = 'Thêm Đảng viên Mới';
        document.getElementById('submitText').textContent = 'Thêm Đảng viên';
        
        // Hiển thị form
        document.getElementById('formContainer').style.display = 'block';
        
        // Cuộn đến form
        window.scrollTo({
            top: document.getElementById('formContainer').offsetTop - 50,
            behavior: 'smooth'
        });
    });
    
    // Nút "Hủy bỏ"
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('formContainer').style.display = 'none';
    });
    
    // Nút "Làm mới"
    document.getElementById('refreshBtn').addEventListener('click', function() {
        window.fetchDangVien(1, window.currentSearch || '');
    });
    
    // Tìm kiếm
    document.getElementById('searchBtn').addEventListener('click', function() {
        window.currentSearch = document.getElementById('searchInput').value.trim();
        window.fetchDangVien(1, window.currentSearch);
    });
    
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            window.currentSearch = this.value.trim();
            window.fetchDangVien(1, window.currentSearch);
        }
    });
    
    // Submit form
    document.getElementById('dangvienForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const id = document.getElementById('dangvienId').value;
        
        try {
            const url = id ? `${window.API_BASE}/dangvien/${id}` : `${window.API_BASE}/dangvien`;
            const method = id ? 'PUT' : 'POST';
            
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            console.log('DEBUG: Sending data:', data);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': window.API_TOKEN
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('DEBUG: Save response:', result);
            
            if (result.success) {
                showSuccess(id ? 'Cập nhật thành công!' : 'Thêm thành công!');
                document.getElementById('formContainer').style.display = 'none';
                window.fetchDangVien(window.currentPage, window.currentSearch);
            } else {
                showError(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            showError('Không thể kết nối đến server');
        }
    });
    
    // Modal xóa
    document.getElementById('confirmDelete').addEventListener('click', async function() {
        if (window.dangvienToDelete) {
            try {
                const response = await fetch(`${window.API_BASE}/dangvien/${window.dangvienToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': window.API_TOKEN
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showSuccess('Đã xóa thành công!');
                    window.fetchDangVien(window.currentPage, window.currentSearch);
                } else {
                    showError(result.error || 'Có lỗi xảy ra');
                }
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                showError('Không thể kết nối đến server');
            }
            
            document.getElementById('deleteModal').style.display = 'none';
            window.dangvienToDelete = null;
        }
    });
    
    document.getElementById('cancelDelete').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
        window.dangvienToDelete = null;
    });
    
    // Đóng modal khi click bên ngoài
    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            window.dangvienToDelete = null;
        }
    });
    
    // Load dữ liệu ban đầu
    window.fetchDangVien();
});
