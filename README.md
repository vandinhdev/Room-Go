# Room-Go

Bài tập lớn - Hệ thống tìm kiếm trọ trực tuyến sử dụng kiến trúc hướng dịch vụ (SOA - Service Oriented Architecture).

## Giới thiệu

Room-Go là một nền tảng cho thuê phòng trọ toàn diện, cho phép người dùng tìm kiếm, đăng tin và quản lý thông tin phòng trọ. Hệ thống được xây dựng dựa trên kiến trúc SOA với Spring Boot và sử dụng Apache Camel làm Enterprise Service Bus (ESB).

## Công nghệ sử dụng

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Cloud (Consul Discovery)
- Apache Camel (ESB)
- PostgreSQL 15
- Docker & Docker Compose
- HashiCorp Consul (Service Discovery)

### Frontend
- HTML5, CSS3, JavaScript
- Font Awesome 6.6.0
- Responsive Design

## Kiến trúc hệ thống

Hệ thống được chia thành các service sau:

### 1. User Management Service
Quản lý người dùng và xác thực
- Đăng ký, đăng nhập
- Quản lý thông tin người dùng
- Phân quyền và bảo mật

### 2. Room Management Service
Quản lý phòng trọ
- Đăng tin phòng trọ
- Tìm kiếm và lọc phòng trọ
- Quản lý thông tin phòng
- Danh sách yêu thích

### 3. Communication Service
Quản lý tương tác và giao tiếp
- Hệ thống chat
- Thông báo
- Quản lý bình luận

### 4. ESB Camel
Enterprise Service Bus - điều phối và định tuyến các request giữa các services
- API Gateway
- Load balancing
- Service orchestration
- Port: 8080

### 5. Consul Server
Service Discovery và Health Checking
- Đăng ký và phát hiện services
- Health monitoring
- Web UI: http://localhost:8500

## Cấu trúc thư mục

```
Room-Go/
├── front-end/              # Giao diện người dùng
│   ├── index.html          # Trang chủ
│   ├── auth.html           # Đăng nhập/Đăng ký
│   ├── profile.html        # Trang cá nhân
│   ├── roomForm.html       # Form đăng tin
│   ├── chat.html           # Chat
│   ├── detail.html         # Chi tiết phòng
│   ├── favourite.html      # Danh sách yêu thích
│   ├── post-management.html    # Quản lý bài đăng
│   ├── user-management.html    # Quản lý người dùng
│   ├── statistics.html     # Thống kê
│   ├── access/             # CSS, images
│   ├── js/                 # JavaScript files
│   └── components/         # Các component tái sử dụng
│
└── roomgo-server/          # Backend services
    ├── user-management-service/
    ├── room-management-service/
    ├── communication-service/
    ├── esb-camel/
    ├── consul-server/
    ├── docker-compose.yml
    └── init.sql
```

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Java JDK 17 trở lên
- Maven 3.6+
- Docker và Docker Compose
- PostgreSQL 15 (nếu chạy local)

### Chạy với Docker Compose

1. Di chuyển vào thư mục server:
```bash
cd roomgo-server
```

2. Build và chạy tất cả services:
```bash
docker-compose up -d --build
```

3. Kiểm tra trạng thái services:
```bash
docker-compose ps
```

4. Xem logs:
```bash
docker-compose logs -f
```

### Các services và ports

- PostgreSQL: `localhost:5432`
- Consul UI: `http://localhost:8500`
- ESB Camel (API Gateway): `http://localhost:8080`
- User Management Service: Đăng ký động qua Consul
- Room Management Service: Đăng ký động qua Consul
- Communication Service: Đăng ký động qua Consul

### Chạy Frontend

1. Mở thư mục front-end
2. Chạy file `index.html` với Live Server hoặc web server bất kỳ

## Cấu hình

### Database
Database được khởi tạo tự động thông qua file `init.sql` khi container PostgreSQL khởi động lần đầu.

### Environment Variables
Các biến môi trường được cấu hình trong `docker-compose.yml`:
- `SPRING_DATASOURCE_URL`: URL kết nối database
- `SPRING_DATASOURCE_USERNAME`: Username database
- `SPRING_DATASOURCE_PASSWORD`: Password database
- `SPRING_CLOUD_CONSUL_HOST`: Consul server host
- `SPRING_CLOUD_CONSUL_PORT`: Consul server port

## Tính năng chính

### Dành cho người tìm phòng
- Tìm kiếm và lọc phòng trọ theo nhiều tiêu chí
- Xem chi tiết thông tin phòng
- Lưu danh sách phòng yêu thích
- Chat trực tiếp với chủ trọ
- Đánh giá và bình luận

### Dành cho chủ trọ
- Đăng tin cho thuê phòng
- Quản lý danh sách phòng trọ
- Theo dõi thống kê
- Nhận và trả lời tin nhắn
- Cập nhật thông tin phòng

### Quản trị viên
- Quản lý người dùng
- Quản lý bài đăng
- Xem thống kê hệ thống
- Kiểm duyệt nội dung

## API Documentation

API Gateway được expose qua ESB Camel tại port 8080. Tất cả requests từ frontend được route qua ESB để đến các microservices tương ứng.

### Authentication
- POST `/api/auth/register` - Đăng ký tài khoản
- POST `/api/auth/login` - Đăng nhập

### Room Management
- GET `/api/rooms` - Danh sách phòng
- GET `/api/rooms/{id}` - Chi tiết phòng
- POST `/api/rooms` - Đăng tin phòng mới
- PUT `/api/rooms/{id}` - Cập nhật thông tin phòng
- DELETE `/api/rooms/{id}` - Xóa phòng

### User Management
- GET `/api/users/profile` - Thông tin cá nhân
- PUT `/api/users/profile` - Cập nhật thông tin
- GET `/api/users/{id}` - Thông tin người dùng

## Monitoring và Debugging

### Consul UI
Truy cập http://localhost:8500 để:
- Xem danh sách services đang chạy
- Kiểm tra health status
- Xem service discovery information

### Logs
```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs một service cụ thể
docker-compose logs -f user-management-service
docker-compose logs -f room-management-service
docker-compose logs -f communication-service
docker-compose logs -f esb-camel
```

## Dừng và xóa services

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Dừng và xóa images
docker-compose down --rmi all
```

## Troubleshooting

### Services không kết nối được với Consul
- Kiểm tra Consul server đã chạy: `docker-compose ps consul-server`
- Kiểm tra logs: `docker-compose logs consul-server`
- Đảm bảo network được cấu hình đúng

### Database connection failed
- Kiểm tra PostgreSQL đã chạy: `docker-compose ps postgres`
- Verify credentials trong docker-compose.yml
- Kiểm tra port 5432 không bị conflict

### Port conflicts
- Đảm bảo các ports 5432, 8500, 8080 chưa được sử dụng
- Thay đổi port mapping trong docker-compose.yml nếu cần

## Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng:
1. Fork repository
2. Tạo branch cho tính năng mới
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

Dự án này được phát triển cho mục đích học tập.

## Liên hệ

Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ qua repository issues.
