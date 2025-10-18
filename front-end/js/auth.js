// Authentication helper module for token management
import { API_BASE_URL } from './config.js';

export class AuthManager {
    constructor() {
        this.storageKey = 'userInfo';
        this.isRefreshing = false;
        this.refreshPromise = null;
    }

    // Get current user info from localStorage
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey));
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    // Save user info to localStorage
    saveUserInfo(userInfo) {
        localStorage.setItem(this.storageKey, JSON.stringify(userInfo));
    }

    // Clear user info from localStorage
    clearUserInfo() {
        localStorage.removeItem(this.storageKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        const userInfo = this.getCurrentUser();
        return userInfo && userInfo.token;
    }

    // Get access token from current user
    getAccessToken() {
        const userInfo = this.getCurrentUser();
        return userInfo?.token;
    }

    // Get refresh token from current user
    getRefreshToken() {
        const userInfo = this.getCurrentUser();
        return userInfo?.refreshToken;
    }

    // Refresh access token using refresh token
    async refreshAccessToken() {
        // Prevent multiple refresh requests
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

    async _performRefresh() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('🔄 Refreshing access token...');
            
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
            console.log('🔄 Refresh response:', data);
            
            // Handle API response structure
            const tokenData = data.data || data;
            
            if (!tokenData.accessToken) {
                throw new Error('No access token in refresh response');
            }

            // Update user info with new tokens
            const userInfo = this.getCurrentUser();
            userInfo.token = tokenData.accessToken;
            
            // Update refresh token if provided
            if (tokenData.refreshToken) {
                userInfo.refreshToken = tokenData.refreshToken;
            }
            
            this.saveUserInfo(userInfo);
            console.log('✅ Access token refreshed successfully');
            
            return tokenData.accessToken;
        } catch (error) {
            console.error('❌ Failed to refresh token:', error);
            // Clear invalid tokens
            this.clearUserInfo();
            throw error;
        }
    }

    // Get guest token from API
    async getGuestToken() {
        try {
            console.log('🔑 Getting guest token...');
            
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
            console.log('🔑 Guest token response:', data);
            
            // Handle different response formats
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
            
            console.log('✅ Guest token obtained successfully');
            return token;
        } catch (error) {
            console.error('❌ Failed to get guest token:', error);
            throw error;
        }
    }

    // Get valid token (user token with refresh, or guest token)
    async getValidToken() {
        try {
            // If user is authenticated, try to use user token
            if (this.isAuthenticated()) {
                const token = this.getAccessToken();
                console.log('🎫 Using user access token');
                return token;
            }

            // If not authenticated, get guest token
            console.log('🎫 User not authenticated, getting guest token');
            return await this.getGuestToken();
        } catch (error) {
            console.error('❌ Failed to get valid token:', error);
            throw new Error('Unable to obtain authentication token');
        }
    }

    // Make authenticated API request with automatic token refresh
    async makeAuthenticatedRequest(url, options = {}) {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        let attempt = 0;
        const maxAttempts = 2;

        while (attempt < maxAttempts) {
            try {
                // Get current token
                let token = await this.getValidToken();
                
                // Prepare headers
                const headers = {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };

                // Make the request
                const response = await fetch(fullUrl, {
                    ...options,
                    headers
                });

                // If 401 and we have a refresh token, try to refresh
                if (response.status === 401 && this.getRefreshToken() && attempt === 0) {
                    console.log('🔄 Received 401, attempting token refresh...');
                    
                    try {
                        // Refresh the token
                        token = await this.refreshAccessToken();
                        
                        // Update headers with new token
                        headers['Authorization'] = `Bearer ${token}`;
                        
                        // Retry the request
                        attempt++;
                        continue;
                    } catch (refreshError) {
                        console.log('🔄 Token refresh failed, trying guest token...');
                        
                        // If refresh fails, try with guest token
                        try {
                            token = await this.getGuestToken();
                            headers['Authorization'] = `Bearer ${token}`;
                            
                            // Retry with guest token
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

                // Return the response
                return response;
            } catch (error) {
                console.error(`❌ Request attempt ${attempt + 1} failed:`, error);
                
                if (attempt === maxAttempts - 1) {
                    throw error;
                }
                
                attempt++;
            }
        }
    }

    // Logout user
    logout() {
        this.clearUserInfo();
        console.log('👋 User logged out');
    }

    // Check if token is expired (basic check)
    isTokenExpired(token) {
        if (!token) return true;
        
        try {
            // Basic JWT expiration check
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp < now;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return false; // Assume not expired if we can't check
        }
    }
}

// Create singleton instance
export const authManager = new AuthManager();

// Export for backward compatibility
export default authManager;