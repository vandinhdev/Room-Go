// mockRooms.js
export const rooms = [
  {
    id: 1,
    owner_id: 101,
    title: "Phòng 101 - View đẹp",
    description: "Phòng rộng rãi, đầy đủ tiện nghi, gần trung tâm.",
    price: 1500000,
    area: 25.5,
    address: "123 Đường ABC, Phường Bến Nghé, Quận 1, TP.HCM",
    ward: "Bến Nghé", 
    district: "Quận 1",
    province: "TP.HCM",
    latitude: 10.7769,
    longitude: 106.7009,
    status: "available",
    images: [
      {
        id: 1,
        room_id: 1,
        url: "data:image/jpeg;base64,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",
        description: "Phòng ngủ chính",
        created_at: "2025-09-01T08:00:00Z" 
      },
      {
        id: 2,
        room_id: 1,
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
        description: "Phòng khách",
        created_at: "2025-09-01T08:00:00Z"
      }
    ],
    created_at: "2025-09-01T08:00:00Z",
    updated_at: "2025-09-01T08:00:00Z"
  },
  {
    id: 2,
    owner_id: 102,
    title: "Phòng 102 - Giá rẻ",
    description: "Phòng nhỏ, phù hợp sinh viên, gần trường học.",
    price: 1200000,
    area: 18.0,
    address: "456 Đường XYZ, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội",
    ward: "Hàng Bạc",
    district: "Quận Hoàn Kiếm",
    province: "Hà Nội",
    latitude: 21.0285,
    longitude: 105.8542,
    status: "rented",
    images: [
      {
        id: 3,
        room_id: 2,
        url: "https://images.unsplash.com/photo-1585128792020-803d29415281",
        description: "Phòng ngủ",
        created_at: "2025-08-15T08:00:00Z"
      },
      {
        id: 4,
        room_id: 2,
        url: "https://images.unsplash.com/photo-1586105251261-72a756497a11",
        description: "Phòng tắm",
        created_at: "2025-08-15T08:00:00Z"
      }
    ],
    created_at: "2025-08-15T08:00:00Z",
    updated_at: "2025-09-05T08:00:00Z"
  },
  {
    id: 3,
    owner_id: 103,
    title: "Phòng 103 - Cao cấp",
    description: "Phòng cao cấp, nội thất sang trọng, có ban công.",
    price: 2500000,
    area: 30.0,
    address: "789 Đường DEF, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
    ward: "Thạch Thang",
    district: "Quận Hải Châu",
    province: "Đà Nẵng",
    latitude: 16.0678,
    longitude: 108.2208,
    status: "available",
    images: [
      {
        id: 5,
        room_id: 3,
        url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d",
        description: "Ban công view biển",
        created_at: "2025-09-01T08:00:00Z"
      },
      {
        id: 6,
        room_id: 3,
        url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
        description: "Phòng khách sang trọng",
        created_at: "2025-09-01T08:00:00Z"
      }
    ],
    created_at: "2025-09-02T08:00:00Z",
    updated_at: "2025-09-02T08:00:00Z"
  },
  {
    id: 4,
    owner_id: 104,
    title: "Phòng 104 - Gần công viên",
    description: "Phòng thoáng mát, gần công viên, thích hợp gia đình.",
    price: 1800000,
    area: 22.0,
    address: "321 Đường GHI, Phường Phú Lợi, Quận Thủ Dầu Một, Bình Dương",
    ward: "Phú Lợi",
    district: "Quận Thủ Dầu Một",
    province: "Bình Dương",
    latitude: 10.9804,
    longitude: 106.6745,
    status: "available",
    images: [
      {
        id: 5,
        room_id: 3,
        url: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d",
        description: "Ban công view biển",
        created_at: "2025-09-01T08:00:00Z"
      },
      {
        id: 6,
        room_id: 3,
        url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
        description: "Phòng khách sang trọng",
        created_at: "2025-09-01T08:00:00Z"
      }
    ],
    created_at: "2025-09-03T08:00:00Z",
    updated_at: "2025-09-03T08:00:00Z"
  },
  {
    id: 5,
    owner_id: 105,
    title: "Phòng 105 - Giá sinh viên",
    description: "Phòng nhỏ, giá rẻ, phù hợp sinh viên.",
    price: 1000000,
    area: 15.0,
    address: "654 Đường JKL, Phường An Khánh, Quận Ninh Kiều, Cần Thơ",
    ward: "An Khánh",
    district: "Quận Ninh Kiều",
    province: "Cần Thơ",
    latitude: 10.0452,
    longitude: 105.7469,
    status: "rented",
    created_at: "2025-08-20T08:00:00Z",
    updated_at: "2025-09-04T08:00:00Z"
  },
  {
    id: 6,
    owner_id: 106,
    title: "Phòng 106 - View hồ bơi",
    description: "Phòng có view hồ bơi, nội thất hiện đại.",
    price: 2200000,
    area: 28.0,
    address: "987 Đường MNO, Phường Thảo Điền, Quận 2, TP.HCM",
    ward: "Thảo Điền",
    district: "Quận 2",
    province: "TP.HCM",
    latitude: 10.8070,
    longitude: 106.7300,
    status: "available",
    created_at: "2025-09-04T08:00:00Z",
    updated_at: "2025-09-04T08:00:00Z"
  },
  {
    id: 7,
    owner_id: 107,
    title: "Phòng 107 - Gần trường học",
    description: "Phòng tiện nghi, gần trường đại học, thuận tiện đi lại.",
    price: 1300000,
    area: 20.0,
    address: "111 Đường PQR, Phường Đại Kim, Quận Hoàng Mai, Hà Nội",
    ward: "Đại Kim",
    district: "Quận Hoàng Mai",
    province: "Hà Nội",
    latitude: 20.9711,
    longitude: 105.8252,
    status: "rented",
    created_at: "2025-08-25T08:00:00Z",
    updated_at: "2025-09-05T08:00:00Z"
  },
  {
    id: 8,
    owner_id: 108,
    title: "Phòng 108 - Có máy lạnh",
    description: "Phòng có máy lạnh, wifi miễn phí, an ninh tốt.",
    price: 1600000,
    area: 19.0,
    address: "222 Đường STU, Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng",
    ward: "Hòa Khánh Bắc",
    district: "Quận Liên Chiểu",
    province: "Đà Nẵng",
    latitude: 16.0721,
    longitude: 108.1527,
    status: "available",
    created_at: "2025-09-05T08:00:00Z",
    updated_at: "2025-09-05T08:00:00Z"
  },
  {
    id: 9,
    owner_id: 109,
    title: "Phòng 109 - Gần siêu thị",
    description: "Phòng rộng, gần siêu thị, thuận tiện mua sắm.",
    price: 2000000,
    area: 26.0,
    address: "333 Đường VWX, Phường Tân Bình, Quận Dĩ An, Bình Dương",
    ward: "Tân Bình",
    district: "Quận Dĩ An",
    province: "Bình Dương",
    latitude: 10.9061,
    longitude: 106.7695,
    status: "available",
    created_at: "2025-09-06T08:00:00Z",
    updated_at: "2025-09-06T08:00:00Z"
  },
  {
    id: 10,
    owner_id: 110,
    title: "Phòng 110 - Nội thất mới",
    description: "Phòng vừa sửa mới, nội thất đầy đủ, sạch sẽ.",
    price: 1700000,
    area: 21.0,
    address: "444 Đường YZA, Phường Trà An, Quận Bình Thủy, Cần Thơ",
    ward: "Trà An",
    district: "Quận Bình Thủy",
    province: "Cần Thơ",
    latitude: 10.0701,
    longitude: 105.7496,
    status: "available",
    created_at: "2025-09-06T08:00:00Z",
    updated_at: "2025-09-06T08:00:00Z"
  }
];
