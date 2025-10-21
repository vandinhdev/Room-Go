import { API_BASE_URL, CLOUDINARY_CONFIG, VIETMAP_CONFIG } from './config.js';
import { authManager } from './auth.js';

<<<<<<< HEAD
=======
// Khởi tạo mảng chứa các ảnh đã tải lên
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
window.uploadedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roomForm');
    const imageContainer = document.getElementById('imageContainer');
    
<<<<<<< HEAD
    loadProvinces();
    
=======
    // Tải danh sách các tỉnh
    loadProvinces();
    
    // Thiết lập các select tỉnh / quận / phường liên kết nhau
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    document.getElementById('province').addEventListener('change', loadDistricts);
    document.getElementById('district').addEventListener('change', loadWards);
    document.getElementById('ward').addEventListener('change', updateAddressSuggestion);
    
<<<<<<< HEAD
    setupAddressSearch();
    
    form.addEventListener('submit', handleSubmit);
    
    setupImageUpload();
    
=======
    // Thiết lập chức năng tìm kiếm địa chỉ với Vietmap
    setupAddressSearch();
    
    // Thiết lập bản đồ
    setupMapFunctionality();
    
    // Xử lý khi gửi form
    form.addEventListener('submit', handleSubmit);
    
    // Thiết lập khu vực tải ảnh
    setupImageUpload();
    
    // Kiểm tra nếu đang chỉnh sửa phòng đã có
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    if (roomId) {
        loadRoomData(parseInt(roomId));
    }
});

<<<<<<< HEAD
// Thiết lập tính năng tải ảnh và tương tác
=======
// Thiết lập chức năng bản đồ
function setupMapFunctionality() {
    const showMapBtn = document.getElementById('showMapBtn');
    const mapContainer = document.getElementById('mapContainer');
    
    if (!showMapBtn || !mapContainer) return;
    
    // Kiểm tra xem có tọa độ sẵn không
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    
    // Nếu không có tọa độ ban đầu, ẩn nút hiển thị bản đồ
    if (!latitudeInput.value || !longitudeInput.value) {
        showMapBtn.classList.add('d-none');
    }
    
    // Khi nhấn vào nút hiển thị bản đồ
    showMapBtn.addEventListener('click', function() {
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        
        if (!latitude || !longitude) {
            alert('Vui lòng chọn địa chỉ cụ thể trước để hiển thị trên bản đồ.');
            return;
        }
        
        // Chuyển đổi giữa hiển thị và ẩn bản đồ
        if (mapContainer.classList.contains('d-none')) {
            mapContainer.classList.remove('d-none');
            showMapBtn.innerHTML = '<i class="fas fa-map-location-dot me-1"></i> Ẩn bản đồ';
            
            // Khởi tạo bản đồ nếu chưa có
            if (!mapContainer.hasChildNodes()) {
                initMap(parseFloat(latitude), parseFloat(longitude));
            } else {
                // Cập nhật vị trí mới nếu bản đồ đã tồn tại
                updateMapMarker(parseFloat(latitude), parseFloat(longitude));
            }
        } else {
            mapContainer.classList.add('d-none');
            showMapBtn.innerHTML = '<i class="fas fa-map-location-dot me-1"></i> Xem vị trí trên bản đồ';
        }
    });
}

// Khởi tạo bản đồ Vietmap
function initMap(latitude, longitude) {
    // API key của Vietmap
    const apiKey = 'c3d0f188ff669f89042771a20656579073cffec5a8a69747';
    
    // Khởi tạo bản đồ
    window.map = new vietmapgl.Map({
        container: 'mapContainer',
        style: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${apiKey}`,
        center: [longitude, latitude], // [lng, lat]
        zoom: 16
    });
    
    // Thêm điều khiển zoom và xoay bản đồ
    window.map.addControl(new vietmapgl.NavigationControl(), 'bottom-right');
    
    // Thêm marker cho vị trí
    window.marker = new vietmapgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(window.map);
    
    // Lấy thông tin địa chỉ từ tọa độ để hiển thị popup
    fetchAddressFromCoordinates(latitude, longitude);
}

// Cập nhật vị trí marker trên bản đồ
function updateMapMarker(latitude, longitude) {
    if (window.map && window.marker) {
        window.map.setCenter([longitude, latitude]);
        window.marker.setLngLat([longitude, latitude]);
        
        // Cập nhật thông tin địa chỉ trong popup
        fetchAddressFromCoordinates(latitude, longitude);
    }
}

// Lấy thông tin địa chỉ từ tọa độ (reverse geocoding)
async function fetchAddressFromCoordinates(latitude, longitude) {
    try {
        const apiKey = 'c3d0f188ff669f89042771a20656579073cffec5a8a69747';
        const response = await fetch(`https://maps.vietmap.vn/api/reverse/v3?lat=${latitude}&lng=${longitude}&apikey=${apiKey}`);
        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
            const addressInfo = data.features[0].properties;
            const popup = new vietmapgl.Popup({ offset: 25 })
                .setLngLat([longitude, latitude])
                .setHTML(`<div>
                    <strong>Vị trí phòng trọ</strong><br>
                    ${document.getElementById('address').value}
                </div>`)
                .addTo(window.map);
            
            window.marker.setPopup(popup);
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin địa chỉ:', error);
    }
}

// Thiết lập chức năng tải ảnh lên
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
function setupImageUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const fileInput = document.getElementById('fileUpload');
    const smallFileInput = document.getElementById('smallFileUpload');
    
    if (!uploadZone || !fileInput) return;
    
<<<<<<< HEAD
    toggleUploadZoneDisplay();
    
=======
    // Kiểm tra trạng thái ban đầu (ẩn/hiện khu vực tải ảnh)
    toggleUploadZoneDisplay();
    
    // Khi click vào vùng tải ảnh lớn thì mở hộp chọn file
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    uploadZone.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
<<<<<<< HEAD
=======
    // Khi click vào vùng tải ảnh nhỏ thì mở hộp chọn file
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    if (smallUploadZone) {
        smallUploadZone.addEventListener('click', function(e) {
            if (e.target !== smallFileInput) {
                smallFileInput.click();
            }
        });
        
<<<<<<< HEAD
=======
        // Xử lý khi người dùng chọn ảnh trong vùng tải nhỏ
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        smallFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }
    
<<<<<<< HEAD
=======
    // Xử lý khi người dùng chọn ảnh trong vùng tải lớn
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });
    
<<<<<<< HEAD
=======
    // Xử lý kéo/thả file vào vùng tải ảnh lớn
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
    
<<<<<<< HEAD
=======
    // Xử lý kéo/thả file vào vùng tải ảnh nhỏ
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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

<<<<<<< HEAD
// Chuyển đổi hiển thị giữa vùng tải ảnh lớn/nhỏ
=======
// Hàm ẩn/hiện vùng tải ảnh lớn và nhỏ
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
function toggleUploadZoneDisplay() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const imageCount = document.querySelectorAll('.image-upload').length;
    
    if (!uploadZone || !smallUploadZone) return;
    
    if (imageCount > 0) {
<<<<<<< HEAD
        uploadZone.style.display = 'none';
        smallUploadZone.style.display = 'flex';
    } else {
=======
        // Ẩn vùng tải lớn, hiện vùng tải nhỏ
        uploadZone.style.display = 'none';
        smallUploadZone.style.display = 'flex';
    } else {
        // Hiện vùng tải lớn, ẩn vùng tải nhỏ
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        uploadZone.style.display = 'flex';
        smallUploadZone.style.display = 'none';
    }
}

<<<<<<< HEAD
// Xử lý các tệp ảnh được chọn
async function handleFiles(files) {
    const MAX_IMAGES = 12;
=======
// Xử lý danh sách ảnh được chọn
function handleFiles(files) {
    const MAX_IMAGES = 12; // Giới hạn ảnh tối đa
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
        
<<<<<<< HEAD
        const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + i;
        
        const imgDiv = document.createElement('div');
        imgDiv.className = 'image-upload';
        
        reader.onload = async function(e) {
            imgDiv.innerHTML = `
                <div class="image-preview-wrapper">
                    <img src="${e.target.result}" class="image-preview" alt="Ảnh phòng trọ">
                    <div class="image-caption">
                        <i class="fas fa-spinner fa-spin me-1"></i> Đang tải lên...
=======
        reader.onload = (function(file) {
            return function(e) {
                // Tạo phần tử xem trước ảnh
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-upload';
                
                // Tạo ID duy nhất cho ảnh này
                const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                
                imgDiv.innerHTML = `
                    <div class="image-preview-wrapper">
                        <img src="${e.target.result}" class="image-preview" alt="Ảnh phòng trọ">
                        <div class="image-caption">Ảnh ${currentCount + i + 1}</div>
                        <div class="delete-image" data-id="${imgId}">
                            <i class="fas fa-times"></i>
                        </div>
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
                
<<<<<<< HEAD
=======
                // Thêm ảnh mới vào container
                imageContainer.appendChild(imgDiv);
                
                // Lưu dữ liệu ảnh vào mảng toàn cục
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
                window.uploadedImages.push({
                    id: imgId,
                    file: file,
                    dataUrl: cloudinaryUrl,
                    cloudinaryUrl: cloudinaryUrl
                });
                
<<<<<<< HEAD
                const caption = imgDiv.querySelector('.image-caption');
                const imageNumber = document.querySelectorAll('.image-upload').length;
                caption.innerHTML = `Ảnh ${imageNumber}`;
                
                const deleteBtn = imgDiv.querySelector('.delete-image');
                deleteBtn.style.pointerEvents = 'auto';
                deleteBtn.style.opacity = '1';
                
                deleteBtn.addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
=======
                // Xử lý khi người dùng xóa ảnh
                imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    
                    // Kiểm tra số lượng ảnh tối thiểu (3 ảnh)
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
                    const currentImageCount = document.querySelectorAll('.image-upload').length;
                    if (currentImageCount <= 3) {
                        alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                        return;
                    }
                    
                    removeImage(imageId, imgDiv);
                });
                
<<<<<<< HEAD
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
=======
                // Cập nhật trạng thái vùng tải ảnh
                toggleUploadZoneDisplay();
            };
        })(files[i]);
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        
        reader.readAsDataURL(file);
    }
    
<<<<<<< HEAD
=======
    // Reset input để có thể chọn lại cùng 1 ảnh nếu muốn
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    fileInput.value = '';
    if (smallFileInput) {
        smallFileInput.value = '';
    }
}

<<<<<<< HEAD
// Xoá ảnh khỏi danh sách và DOM
function removeImage(imageId, element) {
    element.remove();
    
=======
// Xóa ảnh khỏi giao diện và mảng dữ liệu
function removeImage(imageId, element) {
    element.remove();
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    const index = window.uploadedImages.findIndex(img => img.id === imageId);
    if (index !== -1) {
        window.uploadedImages.splice(index, 1);
    }
<<<<<<< HEAD
    
    updateImageCaptions();
    
    toggleUploadZoneDisplay();
}

// Cập nhật lại chú thích thứ tự ảnh
=======
    updateImageCaptions();
    toggleUploadZoneDisplay();
}

// Cập nhật số thứ tự hiển thị trên ảnh
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
function updateImageCaptions() {
    document.querySelectorAll('.image-upload').forEach((div, index) => {
        div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
    });
}

<<<<<<< HEAD
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

=======
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
// Tải danh sách tỉnh/thành phố
async function loadProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        const select = document.getElementById('province');
        
<<<<<<< HEAD
=======
        // Xóa tất cả option cũ ngoại trừ option mặc định
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        select.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
<<<<<<< HEAD
            option.dataset.code = province.code;
            select.appendChild(option);
        });
    } catch (error) {
=======
            option.dataset.code = province.code; // Lưu mã tỉnh vào data attribute
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh:', error);
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
<<<<<<< HEAD
            }
        }
    } catch (error) {
=======
            } else {
                console.error('Không tìm thấy quận/huyện cho tỉnh:', provinceSelect.value);
            }
        } else {
            console.error('Không tìm thấy tỉnh:', provinceSelect.value);
        }
    } catch (error) {
        console.error('Lỗi khi tải quận/huyện:', error);
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
<<<<<<< HEAD
            }
        } else {
=======
            } else {
                console.error('Không tìm thấy phường/xã cho quận/huyện:', districtSelect.value);
            }
        } else {
            // Trường hợp dự phòng nếu không có mã quận/huyện
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
<<<<<<< HEAD
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
=======
            } else {
                console.error('Không tìm thấy quận/huyện:', districtSelect.value);
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải phường/xã:', error);
    }
}

// Hàm cũ (không còn dùng) nhưng giữ lại để tương thích
function addImageField() {
    // Sử dụng luồng tải ảnh mới
    document.getElementById('fileUpload').click();
}


function loadRoomData(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    
        document.getElementById('province').value = room.province || '';
    
<<<<<<< HEAD
    // Chờ load quận/huyện trước khi gán giá trị
    loadDistricts().then(async () => {
=======
    // Lưu tọa độ nếu có
    if (room.latitude) document.getElementById('latitude').value = room.latitude;
    if (room.longitude) document.getElementById('longitude').value = room.longitude;
    
    // Tải dữ liệu vị trí (tỉnh/thành phố)
    document.getElementById('province').value = room.province;
    
    // Đợi danh sách quận/huyện tải xong rồi mới chọn giá trị
    loadDistricts().then(async () => {
        // Tìm và chọn đúng quận/huyện
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        const districtSelect = document.getElementById('district');
        for (let i = 0; i < districtSelect.options.length; i++) {
            if (districtSelect.options[i].value === room.district) {
                districtSelect.selectedIndex = i;
                break;
            }
        }
        
<<<<<<< HEAD
        // Chờ load phường/xã trước khi gán giá trị
        await loadWards();
        
=======
        // Đợi danh sách phường/xã tải xong rồi mới chọn giá trị
        await loadWards();
        
        // Tìm và chọn đúng phường/xã
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        const wardSelect = document.getElementById('ward');
        for (let i = 0; i < wardSelect.options.length; i++) {
            if (wardSelect.options[i].value === room.ward) {
                wardSelect.selectedIndex = i;
                break;
            }
        }
    });
    
<<<<<<< HEAD
    // Khởi tạo mảng ảnh tải lên nếu chưa tồn tại
    if (typeof uploadedImages === 'undefined') {
        window.uploadedImages = [];
    } else {
        uploadedImages.length = 0;
    }
    
    // Tải ảnh từ dữ liệu phòng
    if (room.images && room.images.length > 0) {
        imageContainer.innerHTML = '';
=======
    // Khởi tạo mảng uploadedImages nếu chưa tồn tại
    if (typeof uploadedImages === 'undefined') {
        window.uploadedImages = [];
    } else {
        // Nếu có rồi thì xóa dữ liệu cũ
        uploadedImages.length = 0;
    }
    
    // Tải ảnh đã có nếu có dữ liệu
    if (room.images && room.images.length > 0) {
        imageContainer.innerHTML = ''; // Xóa vùng chứa ảnh mặc định
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        
        room.images.forEach((image, index) => {
            const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + index;
            
<<<<<<< HEAD
=======
            // Tạo phần tử xem trước ảnh
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
            
<<<<<<< HEAD
            imageContainer.appendChild(imgDiv);
            
=======
            // Thêm phần tử ảnh vào vùng hiển thị
            imageContainer.appendChild(imgDiv);
            
            // Lưu thông tin ảnh vào mảng uploadedImages
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
            uploadedImages.push({
                id: imgId,
                dataUrl: image.url,
                description: image.description || ''
            });
            
<<<<<<< HEAD
            imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
=======
            // Thêm sự kiện xóa ảnh khi nhấn nút “x”
            imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                
                // Chỉ cho phép xóa nếu còn lại ít nhất 3 ảnh
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
                if (document.querySelectorAll('.image-upload').length <= 3) {
                    alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                    return;
                }
                
                removeImage(imageId, imgDiv);
            });
        });
        
<<<<<<< HEAD
        // Hàm xoá ảnh trong phạm vi loadRoomData
        function removeImage(imageId, element) {
            element.remove();
            
=======
        // Hàm xóa ảnh (được định nghĩa bên trong để sử dụng biến trong scope này)
        function removeImage(imageId, element) {
            // Xóa phần tử ảnh khỏi giao diện
            element.remove();
            
            // Xóa ảnh khỏi mảng uploadedImages
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
            const index = uploadedImages.findIndex(img => img.id === imageId);
            if (index !== -1) {
                uploadedImages.splice(index, 1);
            }
            
<<<<<<< HEAD
=======
            // Cập nhật lại số thứ tự trên từng ảnh
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
            document.querySelectorAll('.image-upload').forEach((div, index) => {
                div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
            });
            
<<<<<<< HEAD
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

// Thiết lập tìm kiếm địa chỉ với Vietmap
=======
            // Cập nhật hiển thị vùng tải ảnh sau khi xóa
            toggleUploadZoneDisplay();
        }
        
        // Cập nhật trạng thái vùng tải ảnh sau khi tải dữ liệu ảnh xong
        toggleUploadZoneDisplay();
    }
}


// Thiết lập tìm kiếm địa chỉ với Vietmap API
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
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
    
<<<<<<< HEAD
=======
    // Hiển thị trạng thái đang tải
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang lưu...';
    submitBtn.disabled = true;
    
    try {
<<<<<<< HEAD
=======
        // Kiểm tra hợp lệ cơ bản của form
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        if (!event.target.checkValidity()) {
            event.stopPropagation();
            event.target.classList.add('was-validated');
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
        
<<<<<<< HEAD
=======
        // Kiểm tra số lượng ảnh có đủ không
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        const imageCount = document.querySelectorAll('.image-upload').length;
        if (imageCount < 3) {
            throw new Error('Vui lòng tải lên ít nhất 3 hình ảnh cho phòng trọ.');
        }
        
<<<<<<< HEAD
=======
        // Kiểm tra các trường địa điểm bắt buộc
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        const province = document.getElementById('province').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        const address = document.getElementById('address').value;
        
        if (!province || !district || !ward || !address) {
            throw new Error('Vui lòng điền đầy đủ thông tin địa chỉ (tỉnh/thành phố, quận/huyện, phường/xã và địa chỉ cụ thể)');
        }
        
<<<<<<< HEAD
=======
        // Kiểm tra price và area là số dương
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        const price = parseInt(document.getElementById('price').value);
        const area = parseFloat(document.getElementById('area').value);
        
        if (price <= 0) {
            throw new Error('Giá thuê phải lớn hơn 0');
        }
        
        if (area <= 0) {
            throw new Error('Diện tích phải lớn hơn 0');
        }
        
<<<<<<< HEAD
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
=======
        const formData = {
            id: document.getElementById('roomId').value || Date.now(),
            owner_id: 101, // Tạm cứng mã, nên lấy từ người dùng đã xác thực
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseInt(document.getElementById('price').value),
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
            area: parseFloat(document.getElementById('area').value),
            address: document.getElementById('address').value.trim(),
            ward: document.getElementById('ward').value,
            district: document.getElementById('district').value,
            province: document.getElementById('province').value,
            latitude: document.getElementById('latitude')?.value || null,
            longitude: document.getElementById('longitude')?.value || null,
            status: 'PENDING'
        };
<<<<<<< HEAD

        const imageUrls = [];
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            window.uploadedImages.forEach((img) => {
                imageUrls.push(img.dataUrl);
            });
        }
        
        if (imageUrls.length > 0) {
            roomData.imageUrls = imageUrls;
=======
        
        // Lấy danh sách ảnh
        const images = [];
        
        // Lấy ảnh từ mảng uploadedImages (toàn cục)
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            // Giao diện mới: lấy ảnh từ uploadedImages
            window.uploadedImages.forEach((img, index) => {
                images.push({
                    id: Date.now() + index,
                    room_id: formData.id,
                    url: img.dataUrl,
                    description: img.description || '',
                    created_at: new Date().toISOString()
                });
            });
        } else {
            // Dự phòng: lấy ảnh từ DOM (tương thích ngược)
            const imageUploads = document.querySelectorAll('.image-upload');
            
            for (let i = 0; i < imageUploads.length; i++) {
                const imgElement = imageUploads[i].querySelector('img.image-preview');
                
                if (imgElement && imgElement.src) {
                    images.push({
                        id: Date.now() + i,
                        room_id: formData.id,
                        url: imgElement.src,
                        description: '',
                        created_at: new Date().toISOString()
                    });
                }
            }
        }
        
        formData.images = images;
        
        // Cập nhật hoặc thêm vào mảng rooms
        const index = rooms.findIndex(r => r.id === parseInt(formData.id));
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...formData };
        } else {
            rooms.push(formData);
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        }

        if (isEditMode) {
            roomData.id = parseInt(roomId);
        }

        const apiUrl = isEditMode ? `${API_BASE_URL}/room/update` : `${API_BASE_URL}/room/add`;
        const method = isEditMode ? 'PUT' : 'POST';
        
<<<<<<< HEAD
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
=======
        // Hiển thị thông báo thành công
        alert('Đăng tin thành công! Tin của bạn đã được lưu.');
        
        // Chuyển hướng về trang danh sách
        window.location.href = 'index.html';
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        
    } catch (error) {
        alert(error.message || 'Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
    } finally {
<<<<<<< HEAD
=======
        // Khôi phục trạng thái nút
>>>>>>> 14cb66c44261ed9f1093861e8b5ba68cc123808e
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

