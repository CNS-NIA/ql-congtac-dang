/**
 * Quản lý Đảng viên - Frontend Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    // ==================== BIẾN TOÀN CỤC ====================
    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = '';
    let dangvienToDelete = null;

    // ==================== DOM ELEMENTS ====================
    const formContainer = document.getElementById('formContainer');
    const dangvienForm = document.getElementById('dangvienForm');
    const formTitle = document.getElementById('formTitle');
    const submitText = document.getElementById('submitText');
    const dangvienId = document.getElementById('dangvienId');
    
    const addBtn = document.getElementById('addBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    const tableBody = document.getElementById('tableBody');
    const pagination = document.getElementById('pagination');
    
    const deleteModal = document.getElementById('deleteModal');
    const deleteMessage = document.getElementById('deleteMessage');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');

    // ==================== API FUNCTIONS ====================
    const API_BASE = 'http://localhost:3000/api';
    const API_TOKEN = 'Bearer admin123'; // Token mẫu

    // Lấy danh sách đảng viên
    async function fetchDangVien(page = 1, search = '') {
        try {
            showLoading();
            
            let url = `${API_BASE}/dangvien?page=${page}`;
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
                if (!search) {
                    updatePagination(page, Math.ceil(data.count / 10));
                }
            } else {
                showError('Không thể tải dữ liệu: ' + (data.error || 'Lỗi không xác định'));
            }
        } catch (error) {
            console.error('Lỗi khi fetch dữ liệu:', error);
            showError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        }
    }

    // Thêm/Chỉnh sửa đảng viên
    async function saveDangVien(formData) {
        try {
            const isEdit = formData.get('id');
            const url = isEdit ? `${API_BASE}/dangvien/${formData.get('id')}` : `${API_BASE}/dangvien`;
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_TOKEN
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess(isEdit ? 'Cập nhật đảng viên thành công!' : 'Thêm đảng viên thành công!');
                hideForm();
                fetchDangVien(currentPage, currentSearch);
            } else {
                showError(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi lưu đảng viên:', error);
            showError('Không thể kết nối đến server');
        }
    }

    // Xóa đảng viên
    async function deleteDangVien(id) {
        try {
            const response = await fetch(`${API_BASE}/dangvien/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': API_TOKEN
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('Đã xóa đảng viên thành công!');
                fetchDangVien(currentPage, currentSearch);
            } else {
                showError(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi khi xóa đảng viên:', error);
            showError('Không thể kết nối đến server');
        }
    }

    // ==================== RENDER FUNCTIONS ====================
    function renderTable(dangviens) {
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
            
            return `
                <tr>
                    <td>${(currentPage - 1) * 10 + index + 1}</td>
                    <td><strong>${dv.ho_ten || 'N/A'}</strong></td>
                    <td>${formatDate(dv.ngay_sinh)}</td>
                    <td>${dv.chuc_vu || 'N/A'}</td>
                    <td>${dv.chi_bo || 'N/A'}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="btn action-btn btn-primary" onclick="editDangVien(${dv.id}, '${dv.ho_ten}', '${dv.ngay_sinh}', '${dv.chuc_vu}', '${dv.chi_bo}', '${dv.ngay_vao_dang}', '${dv.trang_thai}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn action-btn btn-danger" onclick="showDeleteModal(${dv.id}, '${dv.ho_ten}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function updatePagination(current, total) {
        currentPage = current;
        totalPages = total;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Nút Previous
        if (currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }
        
        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }
        
        // Nút Next
        if (currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }
        
        pagination.innerHTML = paginationHTML;
    }

    // ==================== FORM FUNCTIONS ====================
    function showForm() {
        formContainer.style.display = 'block';
        window.scrollTo({ top: formContainer.offsetTop - 20, behavior: 'smooth' });
    }

    function hideForm() {
        formContainer.style.display = 'none';
        resetForm();
    }

    function resetForm() {
        dangvienForm.reset();
        dangvienId.value = '';
        formTitle.textContent = 'Thêm Đảng viên Mới';
        submitText.textContent = 'Thêm Đảng viên';
    }

    function setupEditForm(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai) {
        showForm();
        
        dangvienId.value = id;
        document.getElementById('ho_ten').value = ho_ten || '';
        document.getElementById('ngay_sinh').value = ngay_sinh ? ngay_sinh.split('T')[0] : '';
        document.getElementById('ngay_vao_dang').value = ngay_vao_dang ? ngay_vao_dang.split('T')[0] : '';
        document.getElementById('chuc_vu').value = chuc_vu || '';
        document.getElementById('chi_bo').value = chi_bo || '';
        document.getElementById('trang_thai').value = trang_thai || 'hoat_dong';
        
        formTitle.textContent = 'Chỉnh sửa Đảng viên';
        submitText.textContent = 'Cập nhật';
    }

    // ==================== HELPER FUNCTIONS ====================
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

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

    function showError(message) {
        alert(`Lỗi: ${message}`);
    }

    function showSuccess(message) {
        alert(`Thành công: ${message}`);
    }

    // ==================== EVENT HANDLERS ====================
    function changePage(page) {
        currentPage = page;
        fetchDangVien(page, currentSearch);
    }

    function editDangVien(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai) {
        setupEditForm(id, ho_ten, ngay_sinh, chuc_vu, chi_bo, ngay_vao_dang, trang_thai);
    }

    function showDeleteModal(id, name) {
        dangvienToDelete = id;
        deleteMessage.textContent = `Bạn có chắc chắn muốn xóa đảng viên "${name}"?`;
        deleteModal.style.display = 'flex';
    }

    // ==================== EVENT LISTENERS ====================
    addBtn.addEventListener('click', function() {
        resetForm();
        showForm();
    });

    cancelBtn.addEventListener('click', hideForm);

    refreshBtn.addEventListener('click', function() {
        fetchDangVien(currentPage, currentSearch);
    });

    searchBtn.addEventListener('click', function() {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchDangVien(1, currentSearch);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            fetchDangVien(1, currentSearch);
        }
    });

    dangvienForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        if (dangvienId.value) {
            formData.append('id', dangvienId.value);
        }
        
        saveDangVien(formData);
    });

    confirmDelete.addEventListener('click', function() {
        if (dangvienToDelete) {
            deleteDangVien(dangvienToDelete);
            deleteModal.style.display = 'none';
            dangvienToDelete = null;
        }
    });

    cancelDelete.addEventListener('click', function() {
        deleteModal.style.display = 'none';
        dangvienToDelete = null;
    });

    // Đóng modal khi click bên ngoài
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
            dangvienToDelete = null;
        }
    });

    // ==================== GLOBAL FUNCTIONS (cho onclick) ====================
    window.changePage = changePage;
    window.editDangVien = editDangVien;
    window.showDeleteModal = showDeleteModal;

    // ==================== KHỞI TẠO ====================
    fetchDangVien();
});
