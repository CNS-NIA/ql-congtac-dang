// DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load dữ liệu khi trang được tải
    loadDangVien();
    loadChiBo();
    updateStats();
    
    // Xử lý form thêm đảng viên
    document.getElementById('addMemberForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addDangVien();
    });
    
    // Xử lý tìm kiếm
    document.getElementById('searchMember').addEventListener('input', function(e) {
        searchDangVien(e.target.value);
    });
});

// Hàm tải danh sách đảng viên
async function loadDangVien() {
    try {
        const response = await fetch('/api/dangvien');
        if (!response.ok) throw new Error('Lỗi kết nối server');
        
        const dangVienList = await response.json();
        displayDangVien(dangVienList);
        updateMemberCount(dangVienList.length);
        
    } catch (error) {
        console.error('Lỗi tải danh sách đảng viên:', error);
        document.getElementById('membersTableBody').innerHTML = 
            `<tr><td colspan="6" style="text-align: center; color: red;">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
    }
}

// Hiển thị danh sách đảng viên lên bảng
function displayDangVien(dangVienList) {
    const tbody = document.getElementById('membersTableBody');
    
    if (!dangVienList || dangVienList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Chưa có dữ liệu đảng viên</td></tr>`;
        return;
    }
    
    let html = '';
    dangVienList.forEach((member, index) => {
        html += `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${member.ho_ten || 'Chưa có'}</strong></td>
            <td>${member.so_the_dang || 'Chưa có'}</td>
            <td><span class="chip">${member.chi_bo || 'Chưa phân bổ'}</span></td>
            <td>${member.chuc_vu || 'Đảng viên'}</td>
            <td>
                <button class="btn-icon" title="Sửa" onclick="editMember(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" title="Xóa" onclick="deleteMember(${member.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
}

// Hàm thêm đảng viên mới
async function addDangVien() {
    const form = document.getElementById('addMemberForm');
    const hoTen = document.getElementById('hoTen').value;
    const soTheDang = document.getElementById('soTheDang').value;
    const ngaySinh = document.getElementById('ngaySinh').value;
    const chiBo = document.getElementById('chiBo').value;
    const chucVu = document.getElementById('chucVu').value;
    const messageDiv = document.getElementById('formMessage');
    
    // Kiểm tra dữ liệu
    if (!hoTen.trim() || !soTheDang.trim()) {
        showMessage('Vui lòng nhập Họ tên và Số thẻ đảng', 'error');
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
                chi_bo: chiBo || '',
                chuc_vu: chucVu || ''
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Đã thêm đảng viên thành công!', 'success');
            form.reset();
            loadDangVien(); // Tải lại danh sách
            loadChiBo();    // Cập nhật danh sách chi bộ
        } else {
            showMessage(result.error || 'Lỗi khi thêm đảng viên', 'error');
        }
        
    } catch (error) {
        console.error('Lỗi thêm đảng viên:', error);
        showMessage('Lỗi kết nối server', 'error');
    }
}

// Hàm tải danh sách chi bộ
async function loadChiBo() {
    try {
        const response = await fetch('/api/chibo');
        if (!response.ok) throw new Error('Lỗi tải chi bộ');
        
        const chiBoList = await response.json();
        displayChiBo(chiBoList);
        
    } catch (error) {
        console.error('Lỗi tải chi bộ:', error);
        document.getElementById('chiBoList').innerHTML = '<li>Lỗi tải dữ liệu</li>';
    }
}

// Hiển thị danh sách chi bộ
function displayChiBo(chiBoList) {
    const ul = document.getElementById('chiBoList');
    
    if (!chiBoList || chiBoList.length === 0) {
        ul.innerHTML = '<li>Chưa có chi bộ nào</li>';
        return;
    }
    
    let html = '';
    chiBoList.forEach((chiBo, index) => {
        html += `<li>${chiBo} <span class="badge">${index + 1}</span></li>`;
    });
    
    ul.innerHTML = html;
}

// Hàm tìm kiếm đảng viên
function searchDangVien(keyword) {
    const rows = document.querySelectorAll('#membersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none';
    });
}

// Cập nhật thống kê
async function updateStats() {
    try {
        const response = await fetch('/api/dangvien');
        if (!response.ok) throw new Error('Lỗi tải thống kê');
        
        const dangVienList = await response.json();
        updateMemberCount(dangVienList.length);
        
    } catch (error) {
        console.error('Lỗi cập nhật thống kê:', error);
    }
}

// Cập nhật số lượng đảng viên
function updateMemberCount(count) {
    const countElement = document.getElementById('totalMembers');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Hiển thị thông báo
function showMessage(text, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

// Thêm style cho message
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 10px;
        font-size: 14px;
    }
    .message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    .chip {
        background: #e3f2fd;
        color: #1a237e;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        display: inline-block;
    }
    .badge {
        background: #1a237e;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
    }
    .btn-icon {
        background: #e3f2fd;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        color: #1a237e;
        cursor: pointer;
        margin: 0 2px;
    }
    .btn-icon:hover {
        background: #bbdefb;
    }
    .btn-danger {
        background: #ffebee;
        color: #c62828;
    }
    .btn-danger:hover {
        background: #ffcdd2;
    }
`;
document.head.appendChild(style);

// Các hàm chức năng khác (sẽ phát triển sau)
function editMember(id) {
    alert(`Chức năng sửa đảng viên ID: ${id} (Đang phát triển)`);
}

function deleteMember(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đảng viên này?')) {
        alert(`Chức năng xóa đảng viên ID: ${id} (Đang phát triển)`);
    }
}
