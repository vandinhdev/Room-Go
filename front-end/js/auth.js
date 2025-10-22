import { API_BASE_URL } from './config.js';

export class AuthManager {
    constructor() {
        this.storageKey = 'userInfo';
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    // Lấy thông tin người dùng hiện tại từ localStorage
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey));
        } catch (error) {
            return null;
        }
    }

    saveUserInfo(userInfo) {
        localStorage.setItem(this.storageKey, JSON.stringify(userInfo));
    }

    clearUserInfo() {
        localStorage.removeItem(this.storageKey);
    }

    isAuthenticated() {
        const userInfo = this.getCurrentUser();
        return userInfo && userInfo.token;
    }

    getAccessToken() {
        const userInfo = this.getCurrentUser();
        return userInfo?.token;
    }

    getRefreshToken() {
        const userInfo = this.getCurrentUser();
        return userInfo?.refreshToken;
    }

    // Làm mới access token bằng refresh token
    async refreshAccessToken() {
        if (this.isRefreshing) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this._performRefresh();

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    // Thực hiện làm mới token
    async _performRefresh() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });

            if (!response.ok) {
                throw new Error(`Refresh token failed with status: ${response.status}`);
            }

            const data = await response.json();

            const tokenData = data.data || data;
            
            if (!tokenData.accessToken) {
                throw new Error('No access token in refresh response');
            }

            const userInfo = this.getCurrentUser();
            userInfo.token = tokenData.accessToken;
            
            if (tokenData.refreshToken) {
                userInfo.refreshToken = tokenData.refreshToken;
            }
            
            this.saveUserInfo(userInfo);
            
            return tokenData.accessToken;
        } catch (error) {
            this.clearUserInfo();
            throw error;
        }
    }

    // Lấy token khách từ API
    async getGuestToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/guest-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Guest token request failed with status: ${response.status}`);
            }

            const data = await response.json();

            let token = null;
            if (data?.accessToken) {
                token = data.accessToken;
            } else if (data?.data?.token) {
                token = data.data.token;
            } else if (data?.data?.accessToken) {
                token = data.data.accessToken;
            }
            
            if (!token) {
                throw new Error('No token found in guest token response');
            }
            
            return token;
        } catch (error) {
            throw error;
        }
    }

    // Lấy token hợp lệ (token người dùng hoặc token khách)
    async getValidToken() {
        try {
            if (this.isAuthenticated()) {
                const token = this.getAccessToken();
                return token;
            }

            return await this.getGuestToken();
        } catch (error) {
            throw new Error('Unable to obtain authentication token');
        }
    }

    // Thực hiện request API với xác thực tự động làm mới token
    async makeAuthenticatedRequest(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        let attempt = 0;
        const maxAttempts = 2;

        while (attempt < maxAttempts) {
            try {
                let token = await this.getValidToken();

                const headers = {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };

                const response = await fetch(fullUrl, {
                    ...options,
                    headers
                });

                if (response.status === 401 && this.getRefreshToken() && attempt === 0) {
                    try {
                        token = await this.refreshAccessToken();

                        headers['Authorization'] = `Bearer ${token}`;

                        attempt++;
                        continue;
                    } catch (refreshError) {
                        try {
                            token = await this.getGuestToken();
                            headers['Authorization'] = `Bearer ${token}`;

                            const guestResponse = await fetch(fullUrl, {
                                ...options,
                                headers
                            });
                            
                            return guestResponse;
                        } catch (guestError) {
                            throw new Error('Authentication failed completely');
                        }
                    }
                }

                return response;
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw error;
                }
                
                attempt++;
            }
        }
    }

    logout() {
        this.clearUserInfo();
    }

    // Kiểm tra token đã hết hạn chưa
    isTokenExpired(token) {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp < now;
        } catch (error) {
            return false;
        }
    }
}

export const authManager = new AuthManager();

export default authManager;