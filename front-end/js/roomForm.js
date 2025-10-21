import { API_BASE_URL, CLOUDINARY_CONFIG, VIETMAP_CONFIG } from './config.js';
import { authManager } from './auth.js';

window.uploadedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roomForm');
    const imageContainer = document.getElementById('imageContainer');
    
    loadProvinces();

    document.getElementById('province').addEventListener('change', loadDistricts);
    document.getElementById('district').addEventListener('change', loadWards);
    document.getElementById('ward').addEventListener('change', updateAddressSuggestion);
    
    setupAddressSearch();
    
    form.addEventListener('submit', handleSubmit);
    
    setupImageUpload();
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    if (roomId) {
        loadRoomData(parseInt(roomId));
    }
});

function setupImageUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const fileInput = document.getElementById('fileUpload');
    const smallFileInput = document.getElementById('smallFileUpload');
    
    if (!uploadZone || !fileInput) return;
    
    toggleUploadZoneDisplay();

    uploadZone.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    if (smallFileInput) {
        smallFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });
    
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', function() {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    if (smallUploadZone) {
        smallUploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            smallUploadZone.classList.add('dragover');
        });
        
        smallUploadZone.addEventListener('dragleave', function() {
            smallUploadZone.classList.remove('dragover');
        });
        
        smallUploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            smallUploadZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });
    }
}

function toggleUploadZoneDisplay() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const imageCount = document.querySelectorAll('.image-upload').length;
    
    if (!uploadZone || !smallUploadZone) return;
    
    if (imageCount > 0) {
        uploadZone.style.display = 'none';
        smallUploadZone.style.display = 'flex';
    } else {
        uploadZone.style.display = 'flex';
        smallUploadZone.style.display = 'none';
    }
}

// Xử lý các tệp ảnh được chọn
async function handleFiles(files) {
    const MAX_IMAGES = 12;
    const currentCount = document.querySelectorAll('.image-upload').length;
    const remainingSlots = MAX_IMAGES - currentCount;
    
    if (remainingSlots <= 0) {
        alert(`Đã đạt giới hạn tối đa ${MAX_IMAGES} hình ảnh!`);
        return;
    }
    
    const filesToProcess = Math.min(files.length, remainingSlots);
    const imageContainer = document.getElementById('imageContainer');
    const fileInput = document.getElementById('fileUpload');
    const smallFileInput = document.getElementById('smallFileUpload');
    
    for (let i = 0; i < filesToProcess; i++) {
        // Bỏ qua nếu không phải file ảnh
        if (!files[i].type.match('image.*')) {
            continue;
        }
        
        const file = files[i];
        const reader = new FileReader();
        
        const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + i;
        
        const imgDiv = document.createElement('div');
        imgDiv.className = 'image-upload';
        
        reader.onload = async function(e) {
            imgDiv.innerHTML = `
                <div class="image-preview-wrapper">
                    <img src="${e.target.result}" class="image-preview" alt="Ảnh phòng trọ">
                    <div class="image-caption">
                        <i class="fas fa-spinner fa-spin me-1"></i> Đang tải lên...
                    </div>
                    <div class="delete-image" data-id="${imgId}" style="pointer-events: none; opacity: 0.5;">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            `;
            
            imageContainer.appendChild(imgDiv);
            
            toggleUploadZoneDisplay();
            
            try {
                const cloudinaryUrl = await uploadToCloudinary(file);
                
                window.uploadedImages.push({
                    id: imgId,
                    file: file,
                    dataUrl: cloudinaryUrl,
                    cloudinaryUrl: cloudinaryUrl
                });
                const caption = imgDiv.querySelector('.image-caption');
                const imageNumber = document.querySelectorAll('.image-upload').length;
                caption.innerHTML = `Ảnh ${imageNumber}`;
                
                const deleteBtn = imgDiv.querySelector('.delete-image');
                deleteBtn.style.pointerEvents = 'auto';
                deleteBtn.style.opacity = '1';
                
                deleteBtn.addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');

                    const currentImageCount = document.querySelectorAll('.image-upload').length;
                    if (currentImageCount <= 3) {
                        alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                        return;
                    }
                    
                    removeImage(imageId, imgDiv);
                });
                
            } catch (error) {
                const caption = imgDiv.querySelector('.image-caption');
                caption.innerHTML = '<i class="fas fa-exclamation-circle me-1"></i> Lỗi tải lên';
                caption.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
                
                const deleteBtn = imgDiv.querySelector('.delete-image');
                deleteBtn.style.pointerEvents = 'auto';
                deleteBtn.style.opacity = '1';
                deleteBtn.addEventListener('click', function() {
                    imgDiv.remove();
                    toggleUploadZoneDisplay();
                    updateImageCaptions();
                });
                
                alert('Không thể tải ảnh lên. Vui lòng thử lại.');
            }
        };
        reader.readAsDataURL(file);
    }

    fileInput.value = '';
    if (smallFileInput) {
        smallFileInput.value = '';
    }
}

// Xoá ảnh khỏi danh sách và DOM
function removeImage(imageId, element) {
    element.remove();
    
    const index = window.uploadedImages.findIndex(img => img.id === imageId);
    if (index !== -1) {
        window.uploadedImages.splice(index, 1);
    }
    
    updateImageCaptions();
    
    toggleUploadZoneDisplay();
}

// Cập nhật lại chú thích thứ tự ảnh
function updateImageCaptions() {
    document.querySelectorAll('.image-upload').forEach((div, index) => {
        div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
    });
}

// Tải ảnh lên Cloudinary và trả về URL
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        throw error;
    }
}

// Tải danh sách tỉnh/thành phố
async function loadProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        const select = document.getElementById('province');
        
        select.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
            option.dataset.code = province.code;
            select.appendChild(option);
        });
    } catch (error) {
    }
}

// Tải danh sách quận/huyện theo tỉnh
async function loadDistricts() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!provinceSelect.value) return;
    
    try {
        const allProvincesResponse = await fetch('https://provinces.open-api.vn/api/p/');
        const allProvinces = await allProvincesResponse.json();
        
        const selectedProvince = allProvinces.find(p => p.name === provinceSelect.value);
        
        if (selectedProvince) {
            const provinceCode = selectedProvince.code;
            const districtsResponse = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const provinceData = await districtsResponse.json();
            
            if (provinceData.districts && provinceData.districts.length > 0) {
                provinceData.districts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.name;
                    option.textContent = district.name;
                    option.dataset.code = district.code;
                    districtSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
    }
}

// Tải danh sách phường/xã theo quận/huyện
async function loadWards() {
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!districtSelect.value) return;
    
    try {
        const selectedOption = districtSelect.options[districtSelect.selectedIndex];
        const districtCode = selectedOption.dataset.code;
        
        if (districtCode) {
            const wardsResponse = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const districtData = await wardsResponse.json();
            
            if (districtData.wards && districtData.wards.length > 0) {
                districtData.wards.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.name;
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
            }
        } else {
            const response = await fetch('https://provinces.open-api.vn/api/d/search/?q=' + encodeURIComponent(districtSelect.value));
            const districts = await response.json();
            
            if (districts.length > 0) {
                const districtCode = districts[0].code;
                const wardsResponse = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                const districtData = await wardsResponse.json();
                
                if (districtData.wards && districtData.wards.length > 0) {
                    districtData.wards.forEach(ward => {
                        const option = document.createElement('option');
                        option.value = ward.name;
                        option.textContent = ward.name;
                        wardSelect.appendChild(option);
                    });
                }
            }
        }
    } catch (error) {
    }
}

// Thêm ảnh (giữ để tương thích UI cũ)
function addImageField() {
    document.getElementById('fileUpload').click();
}

// Tải dữ liệu phòng để chỉnh sửa theo ID
async function loadRoomData(roomId) {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            alert('Vui lòng đăng nhập để chỉnh sửa tin đăng!');
            window.location.href = 'auth.html';
            return;
        }

        const response = await authManager.makeAuthenticatedRequest(`/room/${roomId}`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin tin đăng!');
        }

        const result = await response.json();
        const room = result.data;
        
        if (!room) {
            throw new Error('Không tìm thấy tin đăng!');
        }

        document.getElementById('roomId').value = room.id;
        document.getElementById('title').value = room.title || '';
        document.getElementById('description').value = room.description || '';
        document.getElementById('price').value = room.price || '';
        document.getElementById('area').value = room.area || '';
        document.getElementById('address').value = room.address || '';
        
        if (room.latitude) document.getElementById('latitude').value = room.latitude;
        if (room.longitude) document.getElementById('longitude').value = room.longitude;
    
        document.getElementById('province').value = room.province || '';
    
    // Chờ load quận/huyện trước khi gán giá trị
    loadDistricts().then(async () => {
        const districtSelect = document.getElementById('district');
        for (let i = 0; i < districtSelect.options.length; i++) {
            if (districtSelect.options[i].value === room.district) {
                districtSelect.selectedIndex = i;
                break;
            }
        }
        
        await loadWards();
        
        const wardSelect = document.getElementById('ward');
        for (let i = 0; i < wardSelect.options.length; i++) {
            if (wardSelect.options[i].value === room.ward) {
                wardSelect.selectedIndex = i;
                break;
            }
        }
    });
    
    // Khởi tạo mảng ảnh tải lên nếu chưa tồn tại
    if (typeof uploadedImages === 'undefined') {
        window.uploadedImages = [];
    } else {
        uploadedImages.length = 0;
    }
    
    // Tải ảnh từ dữ liệu phòng
    if (room.images && room.images.length > 0) {
        imageContainer.innerHTML = '';
        
        room.images.forEach((image, index) => {
            const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + index;
            const imgDiv = document.createElement('div');
            imgDiv.className = 'image-upload';
            
            imgDiv.innerHTML = `
                <div class="image-preview-wrapper">
                    <img src="${image.url}" class="image-preview" alt="Ảnh phòng trọ">
                    <div class="image-caption">Ảnh ${index + 1}</div>
                    <div class="delete-image" data-id="${imgId}">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
            `;
            
            imageContainer.appendChild(imgDiv);
            
            uploadedImages.push({
                id: imgId,
                dataUrl: image.url,
                description: image.description || ''
            });
            
            imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                if (document.querySelectorAll('.image-upload').length <= 3) {
                    alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                    return;
                }
                
                removeImage(imageId, imgDiv);
            });
        });

        // Hàm xóa ảnh trong phạm vi loadRoomData
        function removeImage(imageId, element) {
            element.remove();
            
            const index = uploadedImages.findIndex(img => img.id === imageId);
            if (index !== -1) {
                uploadedImages.splice(index, 1);
            }
            
            // Cập nhật lại số thứ tự trên từng ảnh
            document.querySelectorAll('.image-upload').forEach((div, index) => {
                div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
            });
            
            toggleUploadZoneDisplay();
        }
        
        // Xử lý thêm ảnh từ API (imageUrls)
        if (room.imageUrls && room.imageUrls.length > 0) {
            const imageContainer = document.getElementById('imageContainer');
            imageContainer.innerHTML = '';
            
            room.imageUrls.forEach((imageUrl, index) => {
                const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + index;
                
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-upload';
                
                imgDiv.innerHTML = `
                    <div class="image-preview-wrapper">
                        <img src="${imageUrl}" class="image-preview" alt="Ảnh phòng trọ">
                        <div class="image-caption">Ảnh ${index + 1}</div>
                        <div class="delete-image" data-id="${imgId}">
                            <i class="fas fa-times"></i>
                        </div>
                    </div>
                `;

                imageContainer.appendChild(imgDiv);
                
                window.uploadedImages.push({
                    id: imgId,
                    dataUrl: imageUrl,
                    description: ''
                });
                
                imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    if (document.querySelectorAll('.image-upload').length <= 3) {
                        alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                        return;
                    }
                    
                    removeImage(imageId, imgDiv);
                });
            });
            
            // Hàm xoá ảnh trong phạm vi loadRoomData (imageUrls)
            function removeImage(imageId, element) {
                element.remove();
                
                const index = window.uploadedImages.findIndex(img => img.id === imageId);
                if (index !== -1) {
                    window.uploadedImages.splice(index, 1);
                }
                
                document.querySelectorAll('.image-upload').forEach((div, index) => {
                    div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
                });
                
                toggleUploadZoneDisplay();
            }
            
            toggleUploadZoneDisplay();
        }
    }
        
    } catch (error) {
        alert('Có lỗi xảy ra khi tải thông tin tin đăng: ' + error.message);
        window.location.href = 'index.html';
    }
}

function setupAddressSearch() {
    const addressInput = document.getElementById('address');
    const suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'address-suggestions';
    suggestionContainer.style.display = 'none';
    suggestionContainer.style.position = 'absolute';
    suggestionContainer.style.width = '100%';
    suggestionContainer.style.maxHeight = '200px';
    suggestionContainer.style.overflowY = 'auto';
    suggestionContainer.style.backgroundColor = '#fff';
    suggestionContainer.style.border = '1px solid #ced4da';
    suggestionContainer.style.borderRadius = '0.25rem';
    suggestionContainer.style.zIndex = '1000';
    
    addressInput.parentNode.style.position = 'relative';
    addressInput.parentNode.appendChild(suggestionContainer);
    
    let debounceTimer;
    addressInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = this.value.trim();
            if (query.length >= 3) {
                searchAddressWithVietmap(query, suggestionContainer);
            } else {
                suggestionContainer.style.display = 'none';
            }
        }, 500);
    });
    
    document.addEventListener('click', function(e) {
        if (e.target !== addressInput && e.target !== suggestionContainer) {
            suggestionContainer.style.display = 'none';
        }
    });
    
    addressInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 3) {
            searchAddressWithVietmap(this.value.trim(), suggestionContainer);
        }
    });
}

// Tìm kiếm địa chỉ bằng Vietmap API
async function searchAddressWithVietmap(query, suggestionContainer) {
    try {
        const loadingSpinner = document.getElementById('addressLoading');
        if (loadingSpinner) loadingSpinner.classList.remove('d-none');
        
        const province = document.getElementById('province').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        
        let searchQuery = query;
        if (ward) searchQuery += `, ${ward}`;
        if (district) searchQuery += `, ${district}`;
        if (province) searchQuery += `, ${province}`;
        searchQuery += ", Việt Nam"; // Thêm Việt Nam để thu hẹp phạm vi tìm kiếm
        
        const url = `${VIETMAP_CONFIG.searchUrl}?text=${encodeURIComponent(searchQuery)}&apikey=${VIETMAP_CONFIG.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
        
        suggestionContainer.innerHTML = '';
        
        if (data && Array.isArray(data) && data.length > 0) {
            suggestionContainer.style.display = 'block';
            
            data.slice(0, 10).forEach(place => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = place.display || place.name;
                
                item.dataset.refId = place.ref_id;
                
                item.addEventListener('click', async function() {
                    document.getElementById('address').value = place.display || place.name;
                    
                    await getPlaceDetailsFromVietmap(place.ref_id);
                    
                    suggestionContainer.style.display = 'none';
                });
                
                suggestionContainer.appendChild(item);
            });
        } else {
            suggestionContainer.style.display = 'none';
        }
    } catch (error) {
        suggestionContainer.style.display = 'none';
        
        const loadingSpinner = document.getElementById('addressLoading');
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

// Lấy chi tiết địa điểm theo ref_id (Vietmap)
async function getPlaceDetailsFromVietmap(refId) {
    try {
        const url = `${VIETMAP_CONFIG.placeUrl}?refid=${encodeURIComponent(refId)}&apikey=${VIETMAP_CONFIG.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.lat && data.lng) {
            document.getElementById('latitude').value = data.lat;
            document.getElementById('longitude').value = data.lng;
            
            const showMapBtn = document.getElementById('showMapBtn');
            if (showMapBtn) {
                showMapBtn.classList.remove('d-none');
            }
        }
    } catch (error) {
    }
}

// Cập nhật gợi ý địa chỉ theo tỉnh/quận/phường đã chọn
function updateAddressSuggestion() {
    const addressInput = document.getElementById('address');
    if (addressInput.value.trim()) {
        const suggestionContainer = addressInput.parentNode.querySelector('.address-suggestions');
        if (suggestionContainer) {
            searchAddressWithVietmap(addressInput.value.trim(), suggestionContainer);
        }
    }
}

// Xử lý submit form đăng tin
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang lưu...';
    submitBtn.disabled = true;
    
    try {
        if (!event.target.checkValidity()) {
            event.stopPropagation();
            event.target.classList.add('was-validated');
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
        
        const imageCount = document.querySelectorAll('.image-upload').length;
        if (imageCount < 3) {
            throw new Error('Vui lòng tải lên ít nhất 3 hình ảnh cho phòng trọ.');
        }
        

        const province = document.getElementById('province').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        const address = document.getElementById('address').value;
        
        if (!province || !district || !ward || !address) {
            throw new Error('Vui lòng điền đầy đủ thông tin địa chỉ (tỉnh/thành phố, quận/huyện, phường/xã và địa chỉ cụ thể)');
        }

        const price = parseInt(document.getElementById('price').value);
        const area = parseFloat(document.getElementById('area').value);
        
        if (price <= 0) {
            throw new Error('Giá thuê phải lớn hơn 0');
        }
        
        if (area <= 0) {
            throw new Error('Diện tích phải lớn hơn 0');
        }
        

        const roomId = document.getElementById('roomId').value;
        const isEditMode = !!roomId;
        
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
            throw new Error('Vui lòng đăng nhập để đăng tin!');
        }
        
        const roomData = {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            area: parseFloat(document.getElementById('area').value),
            address: document.getElementById('address').value.trim(),
            ward: document.getElementById('ward').value,
            district: document.getElementById('district').value,
            province: document.getElementById('province').value,
            latitude: document.getElementById('latitude')?.value || null,
            longitude: document.getElementById('longitude')?.value || null,
            status: 'PENDING'
        };

        const imageUrls = [];
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            window.uploadedImages.forEach((img) => {
                imageUrls.push(img.dataUrl);
            });
        }
        
        if (imageUrls.length > 0) {
            roomData.imageUrls = imageUrls;
        }

        if (isEditMode) {
            roomData.id = parseInt(roomId);
        }

        const apiUrl = isEditMode ? `${API_BASE_URL}/room/update` : `${API_BASE_URL}/room/add`;
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.token}`
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'tạo'} tin đăng!`);
        }

        const result = await response.json();

        Utils.showNotification(
            `Tin đăng đã được ${isEditMode ? 'cập nhật' : 'tạo'} thành công!`,
            'success'
        );
        window.location.href = 'post-management.html';
        
    } catch (error) {
        alert(error.message || 'Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

