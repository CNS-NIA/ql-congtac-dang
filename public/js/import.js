class JsonImporterUI {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChiBoList();
    }

    bindEvents() {
        // Form upload
        document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFile();
        });

        // Chọn file
        document.getElementById('jsonFile')?.addEventListener('change', (e) => {
            this.previewFile(e.target.files[0]);
        });

        // Import từ URL
        document.getElementById('importUrlBtn')?.addEventListener('click', () => {
            this.importFromUrl();
        });
    }

    async loadChiBoList() {
        try {
            const response = await fetch('/api/danhsach-chibo');
            const chiBoList = await response.json();
            
            const select = document.getElementById('chiBoSelect');
            if (select) {
                select.innerHTML = '<option value="">-- Tự động nhận diện --</option>';
                chiBoList.forEach(chiBo => {
                    const option = document.createElement('option');
                    option.value = chiBo.chi_bo;
                    option.textContent = `${chiBo.chi_bo} (${chiBo.so_luong} đảng viên)`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Lỗi tải danh sách chi bộ:', error);
        }
    }

    previewFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                const previewDiv = document.getElementById('filePreview');
                
                let html = `
                    <div class="preview-card">
                        <h4><i class="fas fa-file-code"></i> ${file.name}</h4>
                        <p><strong>Kích thước:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                        <p><strong>Số bản ghi:</strong> ${jsonData.length}</p>
                        
                        <div class="sample-data">
                            <h5>Dữ liệu mẫu:</h5>
                            <table class="preview-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Họ tên</th>
                                        <th>Số thẻ đảng</th>
                                        <th>Chức vụ</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                // Hiển thị 5 bản ghi đầu tiên
                jsonData.slice(0, 5).forEach(item => {
                    html += `
                        <tr>
                            <td>${item.STT || ''}</td>
                            <td>${item.Ho_va_Ten || ''}</td>
                            <td>${item.So_the_Dang || 'Chưa có'}</td>
                            <td>${item.Chuc_vu || ''}</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                            ${jsonData.length > 5 ? `<p class="text-muted">... và ${jsonData.length - 5} bản ghi khác</p>` : ''}
                        </div>
                    </div>
                `;
                
                previewDiv.innerHTML = html;
                previewDiv.style.display = 'block';
                
            } catch (error) {
                document.getElementById('filePreview').innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i> Không thể đọc file JSON. Định dạng không đúng.
                    </div>
                `;
            }
        };
        reader.readAsText(file);
    }

    async uploadFile() {
        const form = document.getElementById('uploadForm');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Hiển thị trạng thái loading
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang import...';
            submitBtn.disabled = true;
            
            const response = await fetch('/api/upload-json', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result);
                
                // Refresh danh sách đảng viên
                if (typeof loadDangVien === 'function') {
                    loadDangVien();
                }
                
                // Refresh danh sách chi bộ
                this.loadChiBoList();
                
                // Reset form
                form.reset();
                document.getElementById('filePreview').style.display = 'none';
                
            } else {
                this.showError(result.error || 'Import thất bại');
            }
            
        } catch (error) {
            console.error('Lỗi upload:', error);
            this.showError('Lỗi kết nối server: ' + error.message);
            
        } finally {
            // Khôi phục button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async importFromUrl() {
        const urlInput = document.getElementById('jsonUrl');
        const chiBoSelect = document.getElementById('chiBoSelect');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showError('Vui lòng nhập URL file JSON');
            return;
        }
        
        try {
            const response = await fetch('/api/import-from-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url,
                    chiBo: chiBoSelect.value
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(result);
                if (typeof loadDangVien === 'function') loadDangVien();
                this.loadChiBoList();
                urlInput.value = '';
            } else {
                this.showError(result.error);
            }
            
        } catch (error) {
            this.showError('Lỗi: ' + error.message);
        }
    }

    showSuccess(result) {
        const messageDiv = document.getElementById('importMessage');
        
        let html = `
            <div class="alert alert-success">
                <h4><i class="fas fa-check-circle"></i> Import thành công!</h4>
                <p><strong>${result.message}</strong></p>
                <hr>
                <div class="row">
                    <div class="col-md-4">
                        <p><i class="fas fa-users"></i> Tổng số: ${result.details.total}</p>
                    </div>
                    <div class="col-md-4">
                        <p><i class="fas fa-check"></i> Thành công: ${result.details.success}</p>
                    </div>
                    <div class="col-md-4">
                        <p><i class="fas fa-times"></i> Lỗi: ${result.details.errors.length}</p>
                    </div>
                </div>
        `;
        
        if (result.details.errors.length > 0) {
            html += `
                <div class="mt-3">
                    <h5>Chi tiết lỗi:</h5>
                    <ul class="error-list">
            `;
            
            result.details.errors.forEach(error => {
                html += `<li>Dòng ${error.row}: ${error.name} - ${error.error}</li>`;
            });
            
            html += `</ul></div>`;
        }
        
        html += `</div>`;
        messageDiv.innerHTML = html;
        messageDiv.style.display = 'block';
        
        // Tự động ẩn sau 10 giây
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 10000);
    }

    showError(message) {
        const messageDiv = document.getElementById('importMessage');
        messageDiv.innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle"></i> Lỗi</h4>
                <p>${message}</p>
            </div>
        `;
        messageDiv.style.display = 'block';
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    window.jsonImporter = new JsonImporterUI();
});
