# 🔧 Hướng dẫn sửa lỗi API Key

## ❌ Vấn đề hiện tại

API key hiện tại trong `config.js` **không hợp lệ** hoặc đã hết hạn:
```
acdda4c258f533346bf0651e79076443eec0fe6595a7f71dd65b117da9ee69dd
```

SerpAPI trả về lỗi:
```
Invalid API key. Your API key should be here: https://serpapi.com/manage-api-key
```

---

## ✅ Cách sửa

### Bước 1: Lấy API Key mới

1. **Truy cập:** https://serpapi.com/
2. **Đăng ký tài khoản** (miễn phí - 100 searches/tháng)
3. **Đăng nhập** và vào: https://serpapi.com/manage-api-key
4. **Copy API Key** của bạn

### Bước 2: Cập nhật trong code

Mở file: `front-end\js\config.js`

Thay đổi dòng:
```javascript
apiKey: 'acdda4c258f533346bf0651e79076443eec0fe6595a7f71dd65b117da9ee69dd',
```

Thành:
```javascript
apiKey: 'YOUR_NEW_API_KEY_HERE',  // Paste API key mới vào đây
```

### Bước 3: Test lại

**Option 1: Dùng script test**
```powershell
cd roomgo-server
.\test-serpapi.ps1
```

**Option 2: Test thủ công với curl**
```bash
# Thay YOUR_KEY bằng API key của bạn
curl "https://serpapi.com/search?engine=google_maps_autocomplete&q=Hanoi&api_key=YOUR_KEY"
```

**Option 3: Test qua backend proxy**
```bash
curl "http://localhost:8080/api/esb/maps/autocomplete?q=Hanoi&apiKey=YOUR_KEY"
```

### Bước 4: Reload trang web

1. Hard reload: `Ctrl + Shift + R` hoặc `Ctrl + F5`
2. Clear cache nếu cần
3. Test tính năng tìm kiếm địa chỉ

---

## 🔍 Verify API Key hoạt động

Khi API key hợp lệ, bạn sẽ thấy response như sau:

```json
{
  "predictions": [
    {
      "description": "Hanoi, Vietnam",
      "place_id": "ChIJ...",
      ...
    }
  ],
  "search_metadata": {
    "status": "Success"
  }
}
```

---

## 🎯 Kết quả mong đợi

✅ Không còn lỗi "Invalid API key"
✅ Tìm kiếm địa chỉ hiển thị gợi ý từ Google Maps
✅ Chọn địa chỉ và lấy được tọa độ
✅ Hiển thị vị trí trên bản đồ

---

## 📝 Lưu ý

- **Free tier:** 100 searches/tháng
- **Rate limit:** 1 request/second
- **Không commit API key** lên Git (thêm vào .gitignore)

---

## 🐛 Nếu vẫn gặp lỗi

### Lỗi 401 Unauthorized từ backend
→ API key không được truyền đúng, check lại code

### Lỗi 400 Bad Request
→ API key không hợp lệ, lấy key mới

### Lỗi 429 Too Many Requests
→ Đã vượt quá 100 searches/tháng hoặc 1 req/sec

### Lỗi CORS
→ Backend chưa chạy hoặc port sai

---

## 📚 Tài liệu

- SerpAPI Dashboard: https://serpapi.com/dashboard
- API Documentation: https://serpapi.com/google-maps-autocomplete-api
- Pricing: https://serpapi.com/pricing
