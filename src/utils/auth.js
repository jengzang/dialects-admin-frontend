/**
 * 认证相关工具函数 - 升级版
 * 支持 access_token + refresh_token 双 token 机制
 */

// ==========================================
// 1. 用户信息缓存管理
// ==========================================
const USER_CACHE_KEY = 'admin_user_info_cache';

export const saveUserCache = (userData) => {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
  } catch (e) {
    console.error('缓存用户信息失败', e);
  }
};

export const getUserCache = () => {
  try {
    const data = localStorage.getItem(USER_CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const clearUserCache = () => {
  localStorage.removeItem(USER_CACHE_KEY);
};

// ==========================================
// 2. Token 管理
// ==========================================

/**
 * 从 Cookie 中读取值
 * @param {string} name - Cookie 名称
 * @returns {string|null} Cookie 值
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

/**
 * 获取 Access Token
 * 兼容新旧版本的 token key
 * @returns {string|null} Token 值
 */
export const getToken = () => {
  // 优先读取新版本 (小写)
  let token = localStorage.getItem('access_token');

  // 兼容旧版本 (大写)
  if (!token) {
    token = localStorage.getItem('ACCESS_TOKEN');
  }

  // 从 Cookie 读取
  if (!token) {
    token = getCookie('access_token') || getCookie('ACCESS_TOKEN');
  }

  return token;
};

/**
 * 获取 Refresh Token
 * @returns {string|null} Refresh Token 值
 */
export const getRefreshToken = () => {
  let token = localStorage.getItem('refresh_token');
  if (!token) {
    token = getCookie('refresh_token');
  }
  return token;
};

/**
 * 获取 Token 过期时间
 * @returns {number|null} 过期时间戳
 */
export const getTokenExpiresAt = () => {
  const expiresAt = localStorage.getItem('token_expires_at');
  return expiresAt ? parseInt(expiresAt) : null;
};

/**
 * 设置认证 Token（支持双 token 机制）
 * @param {string} accessToken - Access Token
 * @param {string} refreshToken - Refresh Token（可选）
 * @param {number} expiresIn - 过期时间（秒，默认 1800）
 */
export const setToken = (accessToken, refreshToken = null, expiresIn = 1800) => {
  // 存储 access token（新旧版本都存）
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('ACCESS_TOKEN', accessToken); // 兼容旧版

  // 如果有 refresh token，存储它
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);

    // 存储过期时间戳
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('token_expires_at', expiresAt.toString());
  }

  // 同时存到 Cookie
  document.cookie = `access_token=${accessToken}; path=/; secure; samesite=None`;
  document.cookie = `ACCESS_TOKEN=${accessToken}; path=/; secure; samesite=None`;

  if (refreshToken) {
    document.cookie = `refresh_token=${refreshToken}; path=/; secure; samesite=None`;
  }
};

/**
 * 移除认证 Token
 */
export const removeToken = () => {
  // 清除所有 token 相关数据
  localStorage.removeItem('access_token');
  localStorage.removeItem('ACCESS_TOKEN');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_at');

  // 清除 Cookie
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'ACCESS_TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  // 清除用户信息缓存
  clearUserCache();
};

/**
 * 检查 Token 是否即将过期或已过期
 * @returns {boolean} 是否需要刷新
 */
export const isTokenExpiringSoon = () => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return false;

  const now = Date.now();
  // 如果在 10 分钟内过期或已过期，返回 true
  return (expiresAt - now) < 10 * 60 * 1000;
};

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isAuthenticated = () => {
  return !!getToken();
};

// ==========================================
// 3. Token 刷新机制
// ==========================================

let isRefreshing = false;
let refreshPromise = null;

/**
 * 刷新 Access Token
 * @returns {Promise<string|null>} 新的 access token，失败返回 null
 */
export const refreshAccessToken = async () => {
  // 防止并发刷新
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    console.warn('没有 refresh token，无法刷新');
    return null;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const WEB_BASE = window.WEB_BASE || 'http://localhost:5000';

      const res = await fetch(WEB_BASE + '/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!res.ok) {
        console.error('刷新 token 失败:', res.status);
        removeToken();
        return null;
      }

      const data = await res.json();

      // 保存新的 tokens
      setToken(data.access_token, data.refresh_token, data.expires_in);

      console.log('✅ Token 刷新成功');
      return data.access_token;

    } catch (error) {
      console.error('刷新 token 异常:', error);
      removeToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * 完整登出（清除所有認證信息）
 */
export const logout = () => {
  removeToken();

  // 如果有 router 的重置函數，調用它
  if (typeof window.__resetUserInfoCache === 'function') {
    window.__resetUserInfoCache();
  }
};
