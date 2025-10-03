# Fix Guide: "No active services with name USER-MANAGEMENT-SERVICE"

## Các thay đổi đã thực hiện:

### 1. ✅ Fix Service Name Case Mismatch
- **File**: `esb-camel/src/main/java/vn/ictu/esbcamel/routes/EsbRoutes.java`
- **Thay đổi**: Đổi từ `USER-MANAGEMENT-SERVICE` thành `user-management-service` trong các serviceCall()
- **Lý do**: Spring Cloud Service Discovery sử dụng tên service lowercase

### 2. ✅ Add Port Mapping
- **File**: `docker-compose.yml`
- **Thay đổi**: Thêm port mapping `"8081:8080"` cho user-management-service
- **Lý do**: Service cần có port mapping để có thể truy cập từ bên ngoài

### 3. ✅ Add Eureka Client Annotations
- **Files**: 
  - `user-management-service/src/main/java/vn/ictu/usermanagementservice/UserManagementServiceApplication.java`
  - `esb-camel/src/main/java/vn/ictu/esbcamel/EsbCamelApplication.java`
- **Thay đổi**: Thêm `@EnableEurekaClient` annotation
- **Lý do**: Bật Eureka client để service có thể đăng ký với Eureka server

## Cách rebuild và chạy:

### Option 1: Rebuild toàn bộ với Docker Compose
```bash
# Stop tất cả containers
docker-compose down

# Rebuild và start lại
docker-compose up --build -d

# Kiểm tra logs
docker-compose logs -f
```

### Option 2: Rebuild từng service
```bash
# Rebuild user-management-service
docker-compose build user-management-service
docker-compose up -d user-management-service

# Rebuild esb-camel
docker-compose build esb-camel
docker-compose up -d esb-camel
```

## Kiểm tra service đã hoạt động:

### 1. Kiểm tra Eureka Dashboard
- Truy cập: http://localhost:8761
- Xem danh sách services đã đăng ký

### 2. Kiểm tra service endpoints
- User Management Service: http://localhost:8081/actuator/health
- ESB Camel: http://localhost:8080/actuator/health
- Eureka Server: http://localhost:8761

### 3. Test API qua ESB
```bash
# Test login endpoint
curl -X POST http://localhost:8080/api/esb/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## Lỗi có thể gặp và cách fix:

### 1. Service không đăng ký với Eureka
- Kiểm tra logs: `docker-compose logs user-management-service`
- Đảm bảo Eureka server đã khởi động trước

### 2. Connection refused 
- Kiểm tra network: `docker network ls`
- Đảm bảo tất cả services cùng network `soa-net`

### 3. Service discovery không hoạt động
- Restart Eureka server trước
- Sau đó restart các services khác