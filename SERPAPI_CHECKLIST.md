# ✅ Checklist: Sửa lỗi CORS với SerpAPI

## Vấn đề
- ❌ CORS error khi gọi trực tiếp SerpAPI từ browser
- ❌ "Access to fetch has been blocked by CORS policy"

## Giải pháp: Backend Proxy
Sử dụng ESB Camel service làm proxy để forward requests đến SerpAPI

---

## Các bước thực hiện

### ☑️ 1. Cập nhật Backend (ESB Camel)

**File đã sửa:** `roomgo-server/esb-camel/src/main/java/vn/ictu/esbcamel/routes/EsbRoutes.java`

✅ Đã thêm 3 endpoints mới:
- `/api/esb/maps/autocomplete` - Tìm kiếm địa chỉ
- `/api/esb/maps/place-details` - Lấy chi tiết địa điểm
- `/api/esb/maps/reverse-geocode` - Chuyển tọa độ thành địa chỉ

### ☑️ 2. Cập nhật Frontend Configuration

**File đã sửa:** `front-end/js/config.js`

✅ Thay đổi:
```javascript
// CŨ
baseUrl: 'https://serpapi.com/search'

// MỚI
proxyUrl: `${API_BASE_URL}/maps`  // http://localhost:8080/api/esb/maps
```

### ☑️ 3. Cập nhật Frontend Logic

**File đã sửa:** `front-end/js/roomForm.js`

✅ Đã cập nhật 3 functions:
- `searchAddressWithSerpAPI()` - Gọi backend proxy
- `getPlaceDetails()` - Gọi backend proxy
- `fetchAddressFromCoordinates()` - Gọi backend proxy

---

## Để chạy ứng dụng

### Bước 1: Khởi động Backend
```bash
cd roomgo-server/esb-camel
mvn spring-boot:run
```

Hoặc với Docker:
```bash
cd roomgo-server
docker-compose up esb-camel
```

### Bước 2: Kiểm tra Backend đang chạy
```bash
curl http://localhost:8080/actuator/health
```

### Bước 3: Mở Frontend
```bash
# Sử dụng Live Server hoặc
cd front-end
python -m http.server 5500
```

### Bước 4: Test tìm kiếm địa chỉ
1. Mở trình duyệt: http://127.0.0.1:5500/roomForm.html
2. Nhập địa chỉ vào ô "Địa chỉ cụ thể"
3. Kiểm tra danh sách gợi ý hiển thị

---

## Debugging

### Kiểm tra Backend Logs
```bash
# Trong terminal đang chạy ESB Camel, bạn sẽ thấy:
👉 [ESB] Forwarding Google Maps Autocomplete request: q=123 Nguyen Hue
```

### Kiểm tra Frontend Console
```javascript
// Nếu có lỗi, mở DevTools Console (F12)
// Không còn thấy CORS error nữa
```

### Test API trực tiếp
```bash
# Test autocomplete
curl "http://localhost:8080/api/esb/maps/autocomplete?q=Hanoi&apiKey=YOUR_KEY"

# Test place details  
curl "http://localhost:8080/api/esb/maps/place-details?placeId=ChIJoRyG2ZurNTERqRfKcnt_iOc&apiKey=YOUR_KEY"
```

---

## Kết quả mong đợi

✅ Không còn CORS error
✅ Tìm kiếm địa chỉ hoạt động bình thường
✅ Hiển thị gợi ý từ Google Maps
✅ Lấy tọa độ chính xác khi chọn địa chỉ
✅ Hiển thị vị trí trên bản đồ

---

## Files đã thay đổi

```
Room-Go/
├── front-end/
│   └── js/
│       ├── config.js                    ✅ Đã sửa
│       └── roomForm.js                   ✅ Đã sửa
├── roomgo-server/
│   └── esb-camel/
│       └── src/main/java/vn/ictu/esbcamel/routes/
│           └── EsbRoutes.java           ✅ Đã sửa
├── SERPAPI_SETUP.md                     ✅ Đã cập nhật
└── SERPAPI_CHECKLIST.md                 ✅ File mới
```

---

## Lưu ý quan trọng

⚠️ **Backend PHẢI chạy** trước khi test frontend
⚠️ **API Key** đã được cấu hình trong `config.js`
⚠️ **Port 8080** phải available cho backend
⚠️ **CORS** đã được cấu hình trong ESB Camel

---

## Nếu vẫn gặp lỗi

1. **Kiểm tra backend có chạy không:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Kiểm tra logs của ESB Camel:**
   - Tìm dòng "Forwarding Google Maps..."
   - Xem có lỗi gì không

3. **Clear browser cache:**
   - Ctrl + Shift + Delete
   - Hoặc hard reload: Ctrl + F5

4. **Kiểm tra API key:**
   - Đăng nhập https://serpapi.com/dashboard
   - Verify API key còn quota

---

## Hỗ trợ

- 📖 Chi tiết: Xem file `SERPAPI_SETUP.md`
- 🐛 Lỗi: Kiểm tra console logs
- 📧 Liên hệ: [Your contact]
