class UploadManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkExistingData();
    }
    
    bindEvents() {
        // Lắng nghe tín hiệu từ các trang khác
        window.addEventListener('message', (event) => {
            if (event.data === 'reloadData') {
                this.reloadData();
            }
        });
        
        // Kiểm tra localStorage mỗi 5 giây
        setInterval(() => {
            const lastUpdate = localStorage.getItem('dataUpdated');
            if (lastUpdate && Date.now() - lastUpdate < 5000) {
                this.reloadData();
                localStorage.removeItem('dataUpdated');
            }
        }, 5000);
    }
    
    async checkExistingData() {
        try {
            const response = await fetch('/api/dangvien');
            const data = await response.json();
            
            if (data.length > 0) {
                console.log(`📊 Đã có ${data.length} đảng viên trong hệ thống`);
                this.updateUI(data.length);
            } else {
                console.log('📭 Chưa có dữ liệu, cần import');
                this.showImportPrompt();
            }
        } catch (error) {
            console.error('Lỗi kiểm tra dữ liệu:', error);
        }
    }
    
    updateUI(count) {
        // Cập nhật số lượng trên giao diện
        const countElement = document.getElementById('totalMembers');
        if (countElement) {
            countElement.textContent = count;
        }
        
        // Hiển thị thông báo nếu vừa có dữ liệu mới
        const justUpdated = sessionStorage.getItem('justUpdated');
        if (justUpdated === 'true') {
            this.showNotification(`Đã cập nhật ${count} đảng viên`);
            sessionStorage.removeItem('justUpdated');
        }
    }
    
    async reloadData() {
        console.log('🔄 Đang reload dữ liệu...');
        
        try {
            const response = await fetch('/api/dangvien');
            const data = await response.json();
            
            // Gọi hàm hiển thị từ app.js
            if (typeof displayDangVien === 'function') {
                displayDangVien(data);
                this.updateUI(data.length);
                sessionStorage.setItem('justUpdated', 'true');
            } else {
                // Nếu app.js chưa load, reload trang
                location.reload();
            }
        } catch (error) {
            console.error('Lỗi reload:', error);
        }
    }
    
    showNotification(message) {
        // Hiển thị thông báo
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="position:fixed; top:20px; right:20px; background:#4CAF50; color:white; 
                       padding:15px; border-radius:5px; z-index:9999; box-shadow:0 3px 10px rgba(0,0,0,0.2)">
                <span>${message}</span>
                <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; margin-left:10px">×</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    showImportPrompt() {
        // Hiển thị gợi ý import nếu chưa có dữ liệu
        const tableBody = document.getElementById('membersTableBody');
        if (tableBody && tableBody.children.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:40px;">
                        <h3>📭 Chưa có dữ liệu đảng viên</h3>
                        <p>Hãy import dữ liệu từ file JSON để bắt đầu</p>
                        <button onclick="window.open('/upload-simple.html', '_blank')" 
                                style="background:#1a237e; color:white; border:none; padding:10px 20px; border-radius:5px; margin:10px; cursor:pointer">
                            📤 Import ngay
                        </button>
                        <p><small>Hoặc <a href="#" onclick="addSampleData()">thêm dữ liệu mẫu</a> để test</small></p>
                    </td>
                </tr>
            `;
        }
    }
    
    async addSampleData() {
        // Thêm dữ liệu mẫu để test
        try {
            const response = await fetch('/api/dangvien/sample', {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                this.reloadData();
                this.showNotification('Đã thêm dữ liệu mẫu');
            }
        } catch (error) {
            console.error('Lỗi thêm dữ liệu mẫu:', error);
        }
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    window.uploadManager = new UploadManager();
});
