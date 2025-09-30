// roomForm.js
import { rooms } from './mockRooms.js';

// Initialize the uploaded images array
window.uploadedImages = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roomForm');
    const imageContainer = document.getElementById('imageContainer');
    
    // Load provinces data
    loadProvinces();
    
    // Set up province/district/ward cascading selects
    document.getElementById('province').addEventListener('change', loadDistricts);
    document.getElementById('district').addEventListener('change', loadWards);
    document.getElementById('ward').addEventListener('change', updateAddressSuggestion);
    
    // Set up address search with Vietmap
    setupAddressSearch();
    
    // Set up map functionality
    setupMapFunctionality();
    
    // Handle form submission
    form.addEventListener('submit', handleSubmit);
    
    // Setup image upload zone
    setupImageUpload();
    
    // Check if editing existing room
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

// Setup image upload functionality
function setupImageUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const fileInput = document.getElementById('fileUpload');
    const smallFileInput = document.getElementById('smallFileUpload');
    
    if (!uploadZone || !fileInput) return;
    
    // Check initial state
    toggleUploadZoneDisplay();
    
    // Click on the upload zone to trigger file input
    uploadZone.addEventListener('click', function(e) {
        // Ngăn chặn việc click vào input sẽ gọi lại sự kiện click
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // Click on small upload zone
    if (smallUploadZone) {
        smallUploadZone.addEventListener('click', function(e) {
            if (e.target !== smallFileInput) {
                smallFileInput.click();
            }
        });
        
        // Handle file selection for small upload
        smallFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }
    
    // Handle file selection for main upload
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });
    
    // Handle drag and drop for main upload zone
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
    
    // Handle drag and drop for small upload zone
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

// Function to toggle between large and small upload zones
function toggleUploadZoneDisplay() {
    const uploadZone = document.getElementById('uploadZone');
    const smallUploadZone = document.getElementById('smallUploadZone');
    const imageCount = document.querySelectorAll('.image-upload').length;
    
    if (!uploadZone || !smallUploadZone) return;
    
    if (imageCount > 0) {
        // Hide large upload zone, show small one
        uploadZone.style.display = 'none';
        smallUploadZone.style.display = 'flex';
    } else {
        // Show large upload zone, hide small one
        uploadZone.style.display = 'flex';
        smallUploadZone.style.display = 'none';
    }
}

// Handle the selected files
function handleFiles(files) {
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
    
    for (let i = 0; i < filesToProcess; i++) {
        if (!files[i].type.match('image.*')) {
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = (function(file) {
            return function(e) {
                // Create image preview element
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-upload';
                
                // Generate a unique ID for this image
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
                
                // Add the new image element to container
                imageContainer.appendChild(imgDiv);
                
                // Store image data
                uploadedImages.push({
                    id: imgId,
                    file: file,
                    dataUrl: e.target.result
                });
                
                // Add event listener for delete button
                imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                    const imageId = this.getAttribute('data-id');
                    
                    // Check minimum number of images (3)
                    if (document.querySelectorAll('.image-upload').length <= 3) {
                        alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                        return;
                    }
                    
                    removeImage(imageId, imgDiv);
                });
                
                // Toggle upload zone display after adding image
                toggleUploadZoneDisplay();
            };
        })(files[i]);
        
        reader.readAsDataURL(files[i]);
    }
    
    // Reset file input to allow selecting the same file again
    fileInput.value = '';
}

function removeImage(imageId, element) {
    // Remove element from DOM
    element.remove();
    
    // Remove from our array
    const index = uploadedImages.findIndex(img => img.id === imageId);
    if (index !== -1) {
        uploadedImages.splice(index, 1);
    }
    
    // Update numbering
    updateImageCaptions();
    
    // Toggle upload zone display after removing image
    toggleUploadZoneDisplay();
}

function updateImageCaptions() {
    document.querySelectorAll('.image-upload').forEach((div, index) => {
        div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
    });
}

async function loadProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        const select = document.getElementById('province');
        
        // Clear existing options except the first placeholder
        select.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
            option.dataset.code = province.code; // Store the code as a data attribute
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading provinces:', error);
    }
}

async function loadDistricts() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Clear existing options
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!provinceSelect.value) return;
    
    try {
        // Use the more reliable direct API for all provinces
        const allProvincesResponse = await fetch('https://provinces.open-api.vn/api/p/');
        const allProvinces = await allProvincesResponse.json();
        
        // Find the selected province by name
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
                    option.dataset.code = district.code; // Store the code as a data attribute
                    districtSelect.appendChild(option);
                });
            } else {
                console.error('No districts found for province:', provinceSelect.value);
            }
        } else {
            console.error('Province not found:', provinceSelect.value);
        }
    } catch (error) {
        console.error('Error loading districts:', error);
    }
}

async function loadWards() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Clear existing options
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!districtSelect.value) return;
    
    try {
        // Get the district code from the selected option's data attribute
        const selectedOption = districtSelect.options[districtSelect.selectedIndex];
        const districtCode = selectedOption.dataset.code;
        
        // If we have the code from the data attribute, use it directly
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
                console.error('No wards found for district:', districtSelect.value);
            }
        } else {
            // Fallback to search API if code is not available
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
                console.error('District not found:', districtSelect.value);
            }
        }
    } catch (error) {
        console.error('Error loading wards:', error);
    }
}

// This function is deprecated with the new UI but kept for compatibility
function addImageField() {
    // Use the new upload flow instead
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
    document.getElementById('status').value = room.status;
    
    // Lưu tọa độ nếu có
    if (room.latitude) document.getElementById('latitude').value = room.latitude;
    if (room.longitude) document.getElementById('longitude').value = room.longitude;
    
    // Load location data
    document.getElementById('province').value = room.province;
    
    // Wait for districts to load before setting district value
    loadDistricts().then(async () => {
        // Find and select the correct district option
        const districtSelect = document.getElementById('district');
        for (let i = 0; i < districtSelect.options.length; i++) {
            if (districtSelect.options[i].value === room.district) {
                districtSelect.selectedIndex = i;
                break;
            }
        }
        
        // Wait for wards to load before setting ward value
        await loadWards();
        
        // Find and select the correct ward option
        const wardSelect = document.getElementById('ward');
        for (let i = 0; i < wardSelect.options.length; i++) {
            if (wardSelect.options[i].value === room.ward) {
                wardSelect.selectedIndex = i;
                break;
            }
        }
    });
    
    // Initialize the uploadedImages array if it doesn't exist
    if (typeof uploadedImages === 'undefined') {
        window.uploadedImages = [];
    } else {
        // Clear existing uploadedImages
        uploadedImages.length = 0;
    }
    
    // Load images
    if (room.images && room.images.length > 0) {
        imageContainer.innerHTML = ''; // Clear default image field
        
        room.images.forEach((image, index) => {
            const imgId = 'img_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '_' + index;
            
            // Create image preview element
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
            
            // Add the image element to container
            imageContainer.appendChild(imgDiv);
            
            // Store image data in uploadedImages array
            uploadedImages.push({
                id: imgId,
                dataUrl: image.url,
                description: image.description || ''
            });
            
            // Add event listener for delete button
            imgDiv.querySelector('.delete-image').addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                
                // Only allow deletion if there will be at least 3 images left
                if (document.querySelectorAll('.image-upload').length <= 3) {
                    alert('Phải có ít nhất 3 hình ảnh cho phòng trọ!');
                    return;
                }
                
                removeImage(imageId, imgDiv);
            });
        });
        
        // Function to remove image (defined here to access variables in this scope)
        function removeImage(imageId, element) {
            // Remove element from DOM
            element.remove();
            
            // Remove from uploadedImages array
            const index = uploadedImages.findIndex(img => img.id === imageId);
            if (index !== -1) {
                uploadedImages.splice(index, 1);
            }
            
            // Update numbering
            document.querySelectorAll('.image-upload').forEach((div, index) => {
                div.querySelector('.image-caption').textContent = `Ảnh ${index + 1}`;
            });
            
            // Toggle upload zone display after removing image
            toggleUploadZoneDisplay();
        }
        
        // Toggle upload zone display after loading images
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
    
    if (!event.target.checkValidity()) {
        event.stopPropagation();
        event.target.classList.add('was-validated');
        return;
    }
    
    // Check if we have enough images
    const imageCount = document.querySelectorAll('.image-upload').length;
    if (imageCount < 3) {
        alert('Vui lòng tải lên ít nhất 3 hình ảnh cho phòng trọ.');
        return;
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
        status: document.getElementById('status').value,
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
    
    // Redirect back to listing page
    window.location.href = 'index.html';
}
