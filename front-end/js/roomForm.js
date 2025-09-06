// roomForm.js
import { rooms } from './mockRooms.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('roomForm');
    const addImageBtn = document.getElementById('addImage');
    const imageContainer = document.getElementById('imageContainer');
    
    // Load provinces data
    loadProvinces();
    
    // Set up province/district/ward cascading selects
    document.getElementById('province').addEventListener('change', loadDistricts);
    document.getElementById('district').addEventListener('change', loadWards);
    
    // Handle form submission
    form.addEventListener('submit', handleSubmit);
    
    // Handle add image button
    addImageBtn.addEventListener('click', addImageField);
    
    // Check if editing existing room
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    if (roomId) {
        loadRoomData(parseInt(roomId));
    }
});

async function loadProvinces() {
    try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const provinces = await response.json();
        const select = document.getElementById('province');
        
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
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
        const response = await fetch('https://provinces.open-api.vn/api/p/search/?q=' + encodeURIComponent(provinceSelect.value));
        const provinces = await response.json();
        if (provinces.length > 0) {
            const provinceCode = provinces[0].code;
            const districtsResponse = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const provinceData = await districtsResponse.json();
            
            provinceData.districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.name;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading districts:', error);
    }
}

async function loadWards() {
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Clear existing options
    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
    
    if (!districtSelect.value) return;
    
    try {
        const response = await fetch('https://provinces.open-api.vn/api/d/search/?q=' + encodeURIComponent(districtSelect.value));
        const districts = await response.json();
        if (districts.length > 0) {
            const districtCode = districts[0].code;
            const wardsResponse = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const districtData = await wardsResponse.json();
            
            districtData.wards.forEach(ward => {
                const option = document.createElement('option');
                option.value = ward.name;
                option.textContent = ward.name;
                wardSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading wards:', error);
    }
}

function addImageField() {
    const div = document.createElement('div');
    div.className = 'image-upload mb-2';
    div.innerHTML = `
        <input type="file" class="form-control" accept="image/*" required>
        <input type="text" class="form-control mt-2" placeholder="Mô tả hình ảnh">
        <button type="button" class="btn btn-danger btn-sm mt-2">Xóa</button>
    `;
    
    div.querySelector('button').addEventListener('click', () => {
        div.remove();
    });
    
    imageContainer.appendChild(div);
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
    
    // Load location data
    document.getElementById('province').value = room.province;
    loadDistricts().then(() => {
        document.getElementById('district').value = room.district;
        loadWards().then(() => {
            document.getElementById('ward').value = room.ward;
        });
    });
    
    // Load images
    if (room.images && room.images.length > 0) {
        imageContainer.innerHTML = ''; // Clear default image field
        room.images.forEach(image => {
            const div = document.createElement('div');
            div.className = 'image-upload mb-2';
            div.innerHTML = `
                <img src="${image.url}" class="img-thumbnail mb-2" style="max-width: 200px">
                <input type="text" class="form-control" value="${image.description}" placeholder="Mô tả hình ảnh">
                <button type="button" class="btn btn-danger btn-sm mt-2">Xóa</button>
            `;
            
            div.querySelector('button').addEventListener('click', () => {
                div.remove();
            });
            
            imageContainer.appendChild(div);
        });
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    
    if (!event.target.checkValidity()) {
        event.stopPropagation();
        event.target.classList.add('was-validated');
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // Get images
    const images = [];
    const imageUploads = document.querySelectorAll('.image-upload');
    for (let i = 0; i < imageUploads.length; i++) {
        const fileInput = imageUploads[i].querySelector('input[type="file"]');
        const descInput = imageUploads[i].querySelector('input[type="text"]');
        
        if (fileInput.files && fileInput.files[0]) {
            // In a real app, you would upload the file to a server here
            const imageUrl = URL.createObjectURL(fileInput.files[0]);
            images.push({
                id: Date.now() + i,
                room_id: formData.id,
                url: imageUrl,
                description: descInput.value,
                created_at: new Date().toISOString()
            });
        } else if (imageUploads[i].querySelector('img')) {
            // Existing image
            images.push({
                id: Date.now() + i,
                room_id: formData.id,
                url: imageUploads[i].querySelector('img').src,
                description: descInput.value,
                created_at: new Date().toISOString()
            });
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
