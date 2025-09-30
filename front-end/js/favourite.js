function getFavouriteRooms() {
    return JSON.parse(localStorage.getItem("favouriteRooms")) || [];
}
function removeRoom(id) {
    let favourite = getFavouriteRooms().filter(p => p.id !== id);
    localStorage.setItem("favouriteRooms", JSON.stringify(favourite));
}

  function viewDetail(id) {
    window.location.href = `detail.html?id=${id}`;
  }

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".favourite-container");
    const favouriteRooms = getFavouriteRooms();

    if (favouriteRooms.length !== 0) {
    container.innerHTML = `
        <h2>Tin đăng đã lưu (${favouriteRooms.length} / 100)</h2>
        ${favouriteRooms.map(room => `
            <div class="favourite-card" onclick="viewDetail(${room.id})">
            <img src="${room.image || 'https://via.placeholder.com/120x90'}" alt="${room.title}">
            <div class="favourite-info">
                <h4>${room.title}</h4>
                <p class="favourite-price">${room.price ? room.price.toLocaleString() : ''} /tháng</p>
            </div>
            
            </div>
        `).join("")}
        `;
    }
});