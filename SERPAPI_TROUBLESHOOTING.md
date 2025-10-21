# 🔧 Khắc phục lỗi 500 Internal Server Error

## Vấn đề
Backend ESB Camel gặp lỗi khi forward request đến SerpAPI do:
- ❌ URL encoding không đúng
- ❌ Camel không xử lý special characters trong URL

## Giải pháp đã áp dụng

### ✅ Đã sửa `EsbRoutes.java`
- Thêm processor để URL encode đúng cách
- Sử dụng `java.net.URLEncoder.encode()` 
- Thêm `throwExceptionOnFailure=false` để xử lý lỗi tốt hơn

### ✅ Đã cải thiện error handling trong `roomForm.js`
- Kiểm tra `response.ok` trước khi parse JSON
- Hiển thị error message rõ ràng hơn

---

## Các bước thực hiện

### 1. Dừng backend hiện tại
Nếu đang chạy backend, nhấn `Ctrl+C` để dừng

### 2. Rebuild backend
```powershell
cd c:\D\SOA\Room-Go\roomgo-server\esb-camel
mvn clean package -DskipTests
```

### 3. Khởi động lại backend
```powershell
mvn spring-boot:run
```

### 4. Kiểm tra backend đã chạy
Mở terminal mới và chạy:
```powershell
curl http://localhost:8080/actuator/health
```

Kết quả mong đợi:
```json
{"status":"UP"}
```

### 5. Test API trực tiếp
```powershell
# Test với địa chỉ tiếng Việt
curl "http://localhost:8080/api/esb/maps/autocomplete?q=Hanoi%20Vietnam&apiKey=acdda4c258f533346bf0651e79076443eec0fe6595a7f71dd65b117da9ee69dd"
```

### 6. Test trên Frontend
1. Mở browser: http://127.0.0.1:5500/roomForm.html
2. Nhập địa chỉ: "Ngõ 115"
3. Kiểm tra có danh sách gợi ý không

---

## Debug Tips

### Xem logs của backend
Khi backend chạy, bạn sẽ thấy logs như:
```
👉 [ESB] Forwarding Google Maps Autocomplete request: q=Hanoi Vietnam
```

### Kiểm tra error trong logs
Nếu có lỗi, sẽ thấy stack trace chi tiết:
```
ERROR [...] - Error processing request
```

### Test URL encoding
Trong PowerShell:
```powershell
# URL với ký tự đặc biệt
$query = "Ngõ 115, Thái Nguyên"
$encoded = [System.Web.HttpUtility]::UrlEncode($query)
Write-Host "Encoded: $encoded"
```

---

## Các thay đổi chi tiết

### Backend: EsbRoutes.java

**Trước:**
```java
.toD("https://serpapi.com/search?engine=google_maps_autocomplete&q=${header.q}&api_key=${header.apiKey}&bridgeEndpoint=true")
```

**Sau:**
```java
.process(exchange -> {
    String query = exchange.getIn().getHeader("q", String.class);
    String apiKey = exchange.getIn().getHeader("apiKey", String.class);
    exchange.getIn().setHeader("serpApiUrl", 
        "https://serpapi.com/search?engine=google_maps_autocomplete&q=" + 
        java.net.URLEncoder.encode(query, "UTF-8") + "&api_key=" + apiKey);
})
.toD("${header.serpApiUrl}?bridgeEndpoint=true&throwExceptionOnFailure=false")
```

### Frontend: roomForm.js

**Thêm error checking:**
```javascript
if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
```

---

## Expected Result

✅ Backend chạy không lỗi
✅ Có thể tìm kiếm địa chỉ tiếng Việt
✅ Hiển thị danh sách gợi ý từ Google Maps
✅ Không còn lỗi 500 Internal Server Error
✅ Logs backend hiển thị request được forward thành công

---

## Nếu vẫn gặp lỗi

### Lỗi: Port 8080 already in use
```powershell
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay <PID> bằng số process ID)
taskkill /PID <PID> /F
```

### Lỗi: Maven build failed
```powershell
# Clean và rebuild
mvn clean
mvn package -DskipTests
```

### Lỗi: Cannot connect to backend
- Kiểm tra firewall
- Kiểm tra antivirus
- Thử chạy với quyền Administrator

---

## Quick Test Script

Tạo file `test-serpapi.ps1`:
```powershell
# Test SerpAPI Proxy
Write-Host "Testing SerpAPI Proxy..." -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Health Check" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
Write-Host "Status: $($health.status)" -ForegroundColor Green

# Test 2: Autocomplete
Write-Host "`n2. Testing Autocomplete" -ForegroundColor Yellow
$query = "Hanoi"
$apiKey = "acdda4c258f533346bf0651e79076443eec0fe6595a7f71dd65b117da9ee69dd"
$url = "http://localhost:8080/api/esb/maps/autocomplete?q=$query&apiKey=$apiKey"
try {
    $response = Invoke-RestMethod -Uri $url
    Write-Host "Success! Found $($response.predictions.Count) predictions" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
```

Chạy script:
```powershell
.\test-serpapi.ps1
```

---

## Liên hệ

- 📖 Chi tiết: `SERPAPI_SETUP.md`
- ✅ Checklist: `SERPAPI_CHECKLIST.md`
- 🐛 Issues: Kiểm tra console logs và backend logs
