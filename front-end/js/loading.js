window.showFullScreenLoading = function(message = 'Đang tải dữ liệu') {
    window.hideFullScreenLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'globalLoadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    loadingOverlay.innerHTML = `
        <div style="text-align: center;">
            <div style="position: relative; width: 100px; height: 100px; margin: 0 auto 30px;">
                <div style="
                    width: 100px;
                    height: 100px;
                    border: 8px solid #f3f3f3;
                    border-top: 8px solid #667eea;
                    border-radius: 50%;
                    animation: globalSpin 1s linear infinite;
                "></div>
            </div>
            <h3 style="color: #333; margin-bottom: 10px; font-size: 20px;">${message}</h3>
            <p style="color: #666; font-size: 14px;">Vui lòng đợi một chút...</p>
        </div>
        <style>
            @keyframes globalSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingOverlay);
};


window.hideFullScreenLoading = function() {
    const loadingOverlay = document.getElementById('globalLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showFullScreenLoading: window.showFullScreenLoading,
        hideFullScreenLoading: window.hideFullScreenLoading
    };
}
