# Hướng dẫn cấu hình SerpAPI cho tìm kiếm địa chỉ

## Giới thiệu

Ứng dụng đã được cập nhật để sử dụng **SerpAPI Google Maps Autocomplete API** thay cho Vietmap API để tìm kiếm địa chỉ. SerpAPI cung cấp gợi ý địa chỉ chính xác hơn thông qua Google Maps.

**Lưu ý quan trọng**: Để tránh vấn đề CORS khi gọi SerpAPI trực tiếp từ browser, ứng dụng sử dụng backend ESB Camel làm proxy server.

## Các bước cấu hình

### 1. Đăng ký tài khoản SerpAPI

1. Truy cập [https://serpapi.com](https://serpapi.com)
2. Đăng ký tài khoản miễn phí
3. SerpAPI cung cấp **100 lượt tìm kiếm miễn phí mỗi tháng**

### 2. Lấy API Key

1. Sau khi đăng ký, đăng nhập vào tài khoản
2. Truy cập [Dashboard](https://serpapi.com/dashboard)
3. Sao chép **API Key** của bạn

### 3. Cấu hình trong ứng dụng

Mở file `front-end/js/config.js` và cập nhật API key:

```javascript
// SerpAPI configuration for Google Maps Autocomplete
export const SERPAPI_CONFIG = {
    apiKey: 'YOUR_SERPAPI_KEY_HERE',  // Thay bằng API key của bạn
    // Backend proxy để tránh CORS issues
    proxyUrl: `${API_BASE_URL}/maps`
};
```

Thay `YOUR_SERPAPI_KEY_HERE` bằng API key bạn đã sao chép từ SerpAPI Dashboard.

### 4. Khởi động Backend Server

Backend ESB Camel cần chạy để proxy requests đến SerpAPI:

```bash
cd roomgo-server/esb-camel
mvn spring-boot:run
```

Hoặc nếu bạn sử dụng Docker:

```bash
cd roomgo-server
docker-compose up esb-camel
```

## Kiến trúc hệ thống

```
Browser (Frontend)
    ↓
    | HTTP Request
    ↓
Backend ESB Camel (Proxy)
    ↓
    | HTTP Request (with API key)
    ↓
SerpAPI Server
```

### Lợi ích của việc sử dụng Backend Proxy:

1. **Tránh CORS issues**: Browser không gọi trực tiếp đến SerpAPI
2. **Bảo mật API Key**: API key có thể được lưu trữ an toàn trên server
3. **Caching**: Có thể cache kết quả để giảm số lượng request
4. **Rate limiting**: Kiểm soát số lượng request từ client

## API Endpoints

Backend ESB Camel cung cấp 3 endpoints:

### 1. Autocomplete - Tìm kiếm địa chỉ
```
GET /api/esb/maps/autocomplete?q={query}&apiKey={api_key}
```

**Ví dụ:**
```javascript
fetch('http://localhost:8080/api/esb/maps/autocomplete?q=123+Nguyen+Hue&apiKey=YOUR_KEY')
```

### 2. Place Details - Lấy chi tiết địa điểm
```
GET /api/esb/maps/place-details?placeId={place_id}&apiKey={api_key}
```

**Ví dụ:**
```javascript
fetch('http://localhost:8080/api/esb/maps/place-details?placeId=ChIJ...&apiKey=YOUR_KEY')
```

### 3. Reverse Geocode - Chuyển tọa độ thành địa chỉ
```
GET /api/esb/maps/reverse-geocode?coords={lat,lng}&apiKey={api_key}
```

**Ví dụ:**
```javascript
fetch('http://localhost:8080/api/esb/maps/reverse-geocode?coords=21.0285,105.8542&apiKey=YOUR_KEY')
```

## Cách hoạt động

### Tìm kiếm địa chỉ (Autocomplete)
1. Người dùng nhập địa chỉ vào form
2. Frontend gọi `/api/esb/maps/autocomplete` trên backend
3. ESB Camel forward request đến SerpAPI Google Maps Autocomplete
4. API trả về danh sách gợi ý địa chỉ
5. Frontend hiển thị danh sách gợi ý

### Lấy tọa độ
1. Người dùng chọn một địa chỉ
2. Frontend gọi `/api/esb/maps/place-details` với `place_id`
3. ESB Camel forward request đến SerpAPI
4. API trả về tọa độ chính xác (latitude, longitude)
5. Tọa độ được lưu và hiển thị trên bản đồ

## Backend Implementation

File `EsbRoutes.java` đã được cập nhật với 3 routes mới:

```java
// SerpAPI proxy routes for Google Maps
rest("/maps")
    .get("/autocomplete").to("direct:mapsAutocomplete")
    .get("/place-details").to("direct:mapsPlaceDetails")
    .get("/reverse-geocode").to("direct:mapsReverseGeocode");
```

## Giới hạn sử dụng

- **Gói miễn phí**: 100 lượt tìm kiếm/tháng
- **Gói trả phí**: Xem chi tiết tại [SerpAPI Pricing](https://serpapi.com/pricing)

## Lưu ý Bảo mật

### Development Environment:
- API key có thể được lưu trong `config.js` (đừng commit lên Git)
- Sử dụng `.gitignore` để loại trừ file chứa sensitive data

### Production Environment:
Nên di chuyển API key ra khỏi frontend:

1. **Option 1**: Lưu API key trong environment variables của backend
```java
@Value("${serpapi.key}")
private String serpApiKey;
```

2. **Option 2**: Frontend không gửi API key, backend tự động thêm
```java
from("direct:mapsAutocomplete")
    .setHeader("apiKey", constant(serpApiKey))
    .toD("https://serpapi.com/search?engine=google_maps_autocomplete&q=${header.q}&api_key=${header.apiKey}");
```

## Khắc phục sự cố

### Lỗi: "Failed to fetch" hoặc CORS error
- **Nguyên nhân**: Backend server chưa chạy
- **Giải pháp**: Khởi động ESB Camel service

### Lỗi: "Invalid API key"
- Kiểm tra lại API key trong file `config.js`
- Đảm bảo đã copy đúng API key từ SerpAPI Dashboard

### Lỗi: "Connection refused"
- Kiểm tra backend server có đang chạy ở port 8080 không
- Xem logs của ESB Camel service

### Lỗi: "Monthly quota exceeded"
- Bạn đã sử dụng hết 100 lượt tìm kiếm miễn phí trong tháng
- Nâng cấp lên gói trả phí hoặc chờ đến tháng sau

### Không có kết quả gợi ý
- Kiểm tra kết nối internet
- Xem logs của backend để biết chi tiết lỗi
- Thử tìm kiếm với từ khóa khác

## Testing

### Test Backend Proxy Endpoint:

```bash
# Test autocomplete
curl "http://localhost:8080/api/esb/maps/autocomplete?q=123+Nguyen+Hue,Vietnam&apiKey=YOUR_KEY"

# Test place details
curl "http://localhost:8080/api/esb/maps/place-details?placeId=ChIJ...&apiKey=YOUR_KEY"

# Test reverse geocode
curl "http://localhost:8080/api/esb/maps/reverse-geocode?coords=21.0285,105.8542&apiKey=YOUR_KEY"
```

## Tài liệu tham khảo

- [SerpAPI Documentation](https://serpapi.com/docs)
- [Google Maps Autocomplete API](https://serpapi.com/google-maps-autocomplete-api)
- [Google Maps Place Details API](https://serpapi.com/google-maps-api)
- [Apache Camel HTTP Component](https://camel.apache.org/components/latest/http-component.html)
