function getFavouriteRooms() {
    return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}

function formatPrice(price) {
    if (!price) return '';
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu/tháng';
    }
    return price.toLocaleString('vi-VN') + ' đ/tháng';
}

  function viewDetail(id) {
    window.location.href = `detail.html?id=${id}`;
  }

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".favourite-container");
    const favouriteRooms = getFavouriteRooms();

    if (favouriteRooms.length === 0) {
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu (${favouriteRooms.length} / 100)</div>
            <div class="favourite-notification">Bạn chưa lưu tin đăng nào!</div>
        `
    } else {
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu (${favouriteRooms.length})</div>
            ${favouriteRooms.map(room => {
                // Lấy ảnh chính từ mảng images
                const mainImage = room.images && room.images.length > 0 
                    ? room.images[0].url 
                    : 'https://via.placeholder.com/120x90';
                
            return `
                <div class="post-item" data-id="${room.id}">
                    <div class="post-image">
                        <img src="${mainImage}" alt="${room.title}">
                    </div>
                <div class="post-info">
                    <h4 class="post-title">${room.title}</h4>
                    <div class="post-price">${formatPrice(room.price)}</div>
                    <div class="post-address">${room.address}</div>
                    
                </div>
                <div class="favourite-remove" onclick="removeFavorite(${room.id})">
                        <i class="fa-solid fa-heart heart-filled"></i>
                </div>
            </div>
            `}).join('')}
        `;
    }
});

window.removeFavorite = function(roomId) {
    let favoriteRooms = JSON.parse(localStorage.getItem('favouriteRooms')) || [];
    favoriteRooms = favoriteRooms.filter(room => room.id !== roomId);
    localStorage.setItem('favouriteRooms', JSON.stringify(favoriteRooms));
    document.querySelector(`.post-item[data-id="${roomId}"]`).remove();
    // Cập nhật lại tiêu đề với số lượng tin đã lưu
    const titleElement = document.querySelector('.favourite-title');
    const currentCount = parseInt(titleElement.textContent.match(/\d+/)[0]);
    titleElement.textContent = `Tin đăng đã lưu (${currentCount - 1})`;
    //xóa phần tử cuối render lại
    if (favoriteRooms.length === 0) {
        const container = document.querySelector(".favourite-container");
        container.innerHTML = `
            <div class="favourite-title">Tin đăng đã lưu (0)</div>
            <div class="favourite-notification">Bạn chưa lưu tin đăng nào!</div>
        `;
    }

};