/**
 * IP 查詢相關 API
 */
import api from '../axios.js';

export const ipAPI = {
  /**
   * 查詢 IP 地址信息
   * @param {string} ip - IP 地址
   * @param {string} provider - 提供商 (ip-api, ip-sb, nordvpn)
   * @returns {Promise} IP 信息
   */
  queryIP(ip, provider = 'ip-api') {
    return api.get(`/ip/${provider}/${ip}`).then(res => res.data);
  }
};
