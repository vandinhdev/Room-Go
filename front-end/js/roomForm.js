// roomForm.js
import { rooms } from './mockRooms.js';

// Khởi tạo mảng chứa các ảnh đã tải lên
window.uploadedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roomForm');
    const imageContainer = document.getElementById('imageContainer');
    
    // Tải danh sách các tỉnh
    loadProvinces();
    
    // Thiết lập các select tỉnh / quận / phường liên kết nhau
    document.getElementById('province').addEventListener('change', loadDistricts);
    document.getElementById('district').addEventListener('change', loadWards);
    document.getElementById('ward').addEventListener('change', updateAddressSuggestion);
    
    // Thiết lập chức năng tìm kiếm địa chỉ với Vietmap
    setupAddressSearch();
    
    // Thiết lập bản đồ
    setupMapFunctionality();
    
    // Xử lý khi gửi form
    form.addEventListener('submit', handleSubmit);
    
    // Thiết lập khu vực tải ảnh
    setupImageUpload();
    
    // Kiểm tra nếu đang chỉnh sửa phòng đã có
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    if (roomId) {
        loadRoomData(parseInt(roomId));
    }
});

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
function setupImageUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const fileInput = document.getElementById('fileUpload');
    const smallFileInput = document.getElementById('smallFileUpload');
    
    if (!uploadZone || !fileInput) return;
    
    // Kiểm tra trạng thái ban đầu (ẩn/hiện khu vực tải ảnh)
    toggleUploadZoneDisplay();
    
    // Khi click vào vùng tải ảnh lớn thì mở hộp chọn file
    uploadZone.addEventListener('click', function(e) {
        // Ngăn chặn việc click vào input sẽ gọi lại sự kiện click
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // Khi click vào vùng tải ảnh nhỏ thì mở hộp chọn file
    if (smallUploadZone) {
        smallUploadZone.addEventListener('click', function(e) {
            if (e.target !== smallFileInput) {
                smallFileInput.click();
            }
        });
        
        // Xử lý khi người dùng chọn ảnh trong vùng tải nhỏ
        smallFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }
    
    // Xử lý khi người dùng chọn ảnh trong vùng tải lớn
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });
    
    // Xử lý kéo/thả file vào vùng tải ảnh lớn
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
    
    // Xử lý kéo/thả file vào vùng tải ảnh nhỏ
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

// Hàm ẩn/hiện vùng tải ảnh lớn và nhỏ
function toggleUploadZoneDisplay() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const imageCount = document.querySelectorAll('.image-upload').length;
    
    if (!uploadZone || !smallUploadZone) return;
    
    if (imageCount > 0) {
        // Ẩn vùng tải lớn, hiện vùng tải nhỏ
        uploadZone.style.display = 'none';
        smallUploadZone.style.display = 'flex';
    } else {
        // Hiện vùng tải lớn, ẩn vùng tải nhỏ
        uploadZone.style.display = 'flex';
        smallUploadZone.style.display = 'none';
    }
}

// Xử lý danh sách ảnh được chọn
function handleFiles(files) {
    const MAX_IMAGES = 12; // Giới hạn ảnh tối đa
    const currentCount = document.querySelectorAll('.image-upload').length;
    const remainingSlots = MAX_IMAGES - currentCount;
    
    if (remainingSlots <= 0) {
        alert(`Đã đạt giới hạn tối đa ${MAX_IMAGES} hình ảnh!`);
        return;
    }
    
    const filesToProcess = Math.min(files.length, remainingSlots);
    const imageContainer = document.getElementById('imageContainer');
    const fileInput = document.getElementById('fileUpload');
    
    for (let i = 0; i < filesToProcess; i++) {
        // Bỏ qua nếu không phải file ảnh
        if (!files[i].type.match('image.*')) {
            continue;
        }
        
        const reader = new FileReader();
        
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
                    </div>
                `;
                
                // Thêm ảnh mới vào container
                imageContainer.appendChild(imgDiv);
                
                // Lưu dữ liệu ảnh vào mảng toàn cục
                window.uploadedImages.push({
                    id: imgId,
                    file: file,
                    dataUrl: e.target.result
                });
                
                // Xử lý khi người dùng xóa ảnh
                imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    
                    // Kiểm tra số lượng ảnh tối thiểu (3 ảnh)
                    const currentImageCount = document.querySelectorAll('.image-upload').length;
                    if (currentImageCount <= 3) {
                        alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                        return;
                    }
                    
                    removeImage(imageId, imgDiv);
                });
                
                // Cập nhật trạng thái vùng tải ảnh
                toggleUploadZoneDisplay();
            };
        })(files[i]);
        
        reader.readAsDataURL(files[i]);
    }
    
    // Reset input để có thể chọn lại cùng 1 ảnh nếu muốn
    fileInput.value = '';
}

// Xóa ảnh khỏi giao diện và mảng dữ liệu
function removeImage(imageId, element) {
    element.remove();
    const index = window.uploadedImages.findIndex(img => img.id === imageId);
    if (index !== -1) {
        window.uploadedImages.splice(index, 1);
    }
    updateImageCaptions();
    toggleUploadZoneDisplay();
}

// Cập nhật số thứ tự hiển thị trên ảnh
function updateImageCaptions() {
    document.querySelectorAll('.image-upload').forEach((div, index) => {
        div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
    });
}

// Tải danh sách tỉnh/thành phố
async function loadProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        const select = document.getElementById('province');
        
        // Xóa tất cả option cũ ngoại trừ option mặc định
        select.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
            option.dataset.code = province.code; // Lưu mã tỉnh vào data attribute
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh:', error);
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
            } else {
                console.error('Không tìm thấy quận/huyện cho tỉnh:', provinceSelect.value);
            }
        } else {
            console.error('Không tìm thấy tỉnh:', provinceSelect.value);
        }
    } catch (error) {
        console.error('Lỗi khi tải quận/huyện:', error);
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
            } else {
                console.error('Không tìm thấy phường/xã cho quận/huyện:', districtSelect.value);
            }
        } else {
            // Trường hợp dự phòng nếu không có mã quận/huyện
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
    
    document.getElementById('roomId').value = room.id;
    document.getElementById('title').value = room.title;
    document.getElementById('description').value = room.description;
    document.getElementById('price').value = room.price;
    document.getElementById('area').value = room.area;
    document.getElementById('address').value = room.address;
    
    // Lưu tọa độ nếu có
    if (room.latitude) document.getElementById('latitude').value = room.latitude;
    if (room.longitude) document.getElementById('longitude').value = room.longitude;
    
    // Tải dữ liệu vị trí (tỉnh/thành phố)
    document.getElementById('province').value = room.province;
    
    // Đợi danh sách quận/huyện tải xong rồi mới chọn giá trị
    loadDistricts().then(async () => {
        // Tìm và chọn đúng quận/huyện
        const districtSelect = document.getElementById('district');
        for (let i = 0; i < districtSelect.options.length; i++) {
            if (districtSelect.options[i].value === room.district) {
                districtSelect.selectedIndex = i;
                break;
            }
        }
        
        // Đợi danh sách phường/xã tải xong rồi mới chọn giá trị
        await loadWards();
        
        // Tìm và chọn đúng phường/xã
        const wardSelect = document.getElementById('ward');
        for (let i = 0; i < wardSelect.options.length; i++) {
            if (wardSelect.options[i].value === room.ward) {
                wardSelect.selectedIndex = i;
                break;
            }
        }
    });
    
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
        
        room.images.forEach((image, index) => {
            const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + index;
            
            // Tạo phần tử xem trước ảnh
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
            
            // Thêm phần tử ảnh vào vùng hiển thị
            imageContainer.appendChild(imgDiv);
            
            // Lưu thông tin ảnh vào mảng uploadedImages
            uploadedImages.push({
                id: imgId,
                dataUrl: image.url,
                description: image.description || ''
            });
            
            // Thêm sự kiện xóa ảnh khi nhấn nút “x”
            imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                
                // Chỉ cho phép xóa nếu còn lại ít nhất 3 ảnh
                if (document.querySelectorAll('.image-upload').length <= 3) {
                    alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                    return;
                }
                
                removeImage(imageId, imgDiv);
            });
        });
        
        // Hàm xóa ảnh (được định nghĩa bên trong để sử dụng biến trong scope này)
        function removeImage(imageId, element) {
            // Xóa phần tử ảnh khỏi giao diện
            element.remove();
            
            // Xóa ảnh khỏi mảng uploadedImages
            const index = uploadedImages.findIndex(img => img.id === imageId);
            if (index !== -1) {
                uploadedImages.splice(index, 1);
            }
            
            // Cập nhật lại số thứ tự trên từng ảnh
            document.querySelectorAll('.image-upload').forEach((div, index) => {
                div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
            });
            
            // Cập nhật hiển thị vùng tải ảnh sau khi xóa
            toggleUploadZoneDisplay();
        }
        
        // Cập nhật trạng thái vùng tải ảnh sau khi tải dữ liệu ảnh xong
        toggleUploadZoneDisplay();
    }
}


// Thiết lập tìm kiếm địa chỉ với Vietmap API
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
    
    // Chèn suggestion container sau input
    addressInput.parentNode.style.position = 'relative';
    addressInput.parentNode.appendChild(suggestionContainer);
    
    // Xử lý sự kiện khi gõ vào ô địa chỉ
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
    
    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (e.target !== addressInput && e.target !== suggestionContainer) {
            suggestionContainer.style.display = 'none';
        }
    });
    
    // Hiện gợi ý khi focus vào input nếu có text
    addressInput.addEventListener('focus', function() {
        if (this.value.trim().length >= 3) {
            searchAddressWithVietmap(this.value.trim(), suggestionContainer);
        }
    });
}

// Tìm kiếm địa chỉ với Vietmap API
async function searchAddressWithVietmap(query, suggestionContainer) {
    try {
        // Hiện spinner
        const loadingSpinner = document.getElementById('addressLoading');
        if (loadingSpinner) loadingSpinner.classList.remove('d-none');
        
        // Lấy tỉnh/thành phố, quận/huyện, phường/xã hiện tại
        const province = document.getElementById('province').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        
        // Thêm thông tin địa điểm đã chọn vào query để cải thiện kết quả tìm kiếm
        let searchQuery = query;
        if (ward) searchQuery += `, ${ward}`;
        if (district) searchQuery += `, ${district}`;
        if (province) searchQuery += `, ${province}`;
        searchQuery += ", Việt Nam"; // Thêm Việt Nam để thu hẹp phạm vi tìm kiếm
        
        // API key của Vietmap - bạn cần đăng ký để lấy key chính thức tại https://vietmap.vn/maps-api
        // Đây là một API key mẫu, trong thực tế bạn cần thay thế bằng key của riêng bạn
        const apiKey = 'c3d0f188ff669f89042771a20656579073cffec5a8a69747'; 
        
        // Gọi API Vietmap để tìm kiếm địa chỉ
        const response = await fetch(`https://maps.vietmap.vn/api/search/v3?text=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`);
        const data = await response.json();
        
        // Ẩn spinner
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
        
        // Xóa các gợi ý cũ
        suggestionContainer.innerHTML = '';
        
        if (data && data.features && data.features.length > 0) {
            // Hiển thị container gợi ý
            suggestionContainer.style.display = 'block';
            
            // Thêm các kết quả tìm kiếm vào container
            data.features.forEach(feature => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = feature.properties.name;
                
                // Lưu tọa độ vào thuộc tính dữ liệu
                if (feature.geometry && feature.geometry.coordinates) {
                    item.dataset.longitude = feature.geometry.coordinates[0];
                    item.dataset.latitude = feature.geometry.coordinates[1];
                }
                
                // Khi click vào một gợi ý
                item.addEventListener('click', function() {
                    document.getElementById('address').value = feature.properties.name;
                    
                    // Lưu tọa độ để sử dụng cho bản đồ
                    if (feature.geometry && feature.geometry.coordinates) {
                        document.getElementById('longitude').value = feature.geometry.coordinates[0];
                        document.getElementById('latitude').value = feature.geometry.coordinates[1];
                        
                        // Hiển thị button xem bản đồ
                        const showMapBtn = document.getElementById('showMapBtn');
                        if (showMapBtn) {
                            showMapBtn.classList.remove('d-none');
                        }
                    }
                    
                    // Ẩn container gợi ý
                    suggestionContainer.style.display = 'none';
                });
                
                suggestionContainer.appendChild(item);
            });
        } else {
            // Ẩn container nếu không có kết quả
            suggestionContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm địa chỉ:', error);
        suggestionContainer.style.display = 'none';
        
        // Ẩn spinner nếu có lỗi
        const loadingSpinner = document.getElementById('addressLoading');
        if (loadingSpinner) loadingSpinner.classList.add('d-none');
    }
}

// Cập nhật gợi ý địa chỉ dựa trên tỉnh/quận/phường đã chọn
function updateAddressSuggestion() {
    const addressInput = document.getElementById('address');
    if (addressInput.value.trim()) {
        // Nếu đã có địa chỉ, tìm kiếm lại với thông tin mới
        const suggestionContainer = addressInput.parentNode.querySelector('.address-suggestions');
        if (suggestionContainer) {
            searchAddressWithVietmap(addressInput.value.trim(), suggestionContainer);
        }
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang lưu...';
    submitBtn.disabled = true;
    
    try {
        // Basic form validation
        if (!event.target.checkValidity()) {
            event.stopPropagation();
            event.target.classList.add('was-validated');
            throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
        }
        
        // Check if we have enough images
        const imageCount = document.querySelectorAll('.image-upload').length;
        if (imageCount < 3) {
            throw new Error('Vui lòng tải lên ít nhất 3 hình ảnh cho phòng trọ.');
        }
        
        // Validate required location fields
        const province = document.getElementById('province').value;
        const district = document.getElementById('district').value;
        const ward = document.getElementById('ward').value;
        const address = document.getElementById('address').value;
        
        if (!province || !district || !ward || !address) {
            throw new Error('Vui lòng điền đầy đủ thông tin địa chỉ (tỉnh/thành phố, quận/huyện, phường/xã và địa chỉ cụ thể)');
        }
        
        // Validate price and area are positive numbers
        const price = parseInt(document.getElementById('price').value);
        const area = parseFloat(document.getElementById('area').value);
        
        if (price <= 0) {
            throw new Error('Giá thuê phải lớn hơn 0');
        }
        
        if (area <= 0) {
            throw new Error('Diện tích phải lớn hơn 0');
        }
        
        const formData = {
            id: document.getElementById('roomId').value || Date.now(),
            owner_id: 101, // Hardcoded for now, should come from authenticated user
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseInt(document.getElementById('price').value),
            area: parseFloat(document.getElementById('area').value),
            address: document.getElementById('address').value,
            ward: document.getElementById('ward').value,
            district: document.getElementById('district').value,
            province: document.getElementById('province').value,
            
            latitude: document.getElementById('latitude')?.value || null,
            longitude: document.getElementById('longitude')?.value || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Get images
        const images = [];
        
        // Get images from uploadedImages array (now global)
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            // New UI: get images from uploadedImages array
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
            // Fallback: get images from DOM (for backward compatibility)
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
        
        // Update or add to rooms array
        const index = rooms.findIndex(r => r.id === parseInt(formData.id));
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...formData };
        } else {
            rooms.push(formData);
        }
        
        // Show success message
        alert('Đăng tin thành công! Tin của bạn đã được lưu.');
        
        // Redirect back to listing page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.');
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
