/**
 * useTimeFormat Composable
 * 时间格式化工具函数
 *
 * 使用方式：
 * import { useTimeFormat } from '@/composables/useTimeFormat';
 *
 * const { formatTime, formatExpireTime, formatOnlineTime } = useTimeFormat();
 */

export function useTimeFormat() {
  /**
   * 格式化时间戳为相对时间或绝对时间
   * @param {string|number} timestamp - 时间戳
   * @returns {string} 格式化后的时间字符串
   */
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';

    // 处理不同的时间戳格式
    let date;
    if (typeof timestamp === 'string') {
      // 如果是字符串，确保正确解析 UTC 时间
      // 如果没有时区标识（Z 或 +08:00），则当作 UTC 时间处理
      let timeStr = timestamp;
      if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
        // 将空格替换为 T，并添加 Z 表示 UTC
        timeStr = timeStr.replace(' ', 'T') + 'Z';
      }
      date = new Date(timeStr);
    } else if (typeof timestamp === 'number') {
      // 如果是数字，判断是秒还是毫秒
      // 如果小于 10000000000，认为是秒（2001年之前）
      if (timestamp < 10000000000) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
    } else {
      return '-';
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Date';
    }

    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    // 相对时间显示
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

    // 超过一周显示绝对时间
    return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  };

  /**
   * 格式化过期时间
   * @param {string|number} timestamp - 过期时间戳
   * @returns {string} 格式化后的过期时间字符串
   */
  const formatExpireTime = (timestamp) => {
    if (!timestamp) return '-';

    // 处理不同的时间戳格式
    let date;
    if (typeof timestamp === 'string') {
      // 如果是字符串，确保正确解析 UTC 时间
      let timeStr = timestamp;
      if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
        timeStr = timeStr.replace(' ', 'T') + 'Z';
      }
      date = new Date(timeStr);
    } else if (typeof timestamp === 'number') {
      if (timestamp < 10000000000) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
    } else {
      return '-';
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.error('Invalid expire timestamp:', timestamp);
      return 'Invalid Date';
    }

    const now = new Date();
    const diff = Math.floor((date - now) / 1000);

    // 已过期
    if (diff < 0) return '已過期';

    // 即将过期
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘後過期`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小時後過期`;

    return `${Math.floor(diff / 86400)}天後過期`;
  };

  /**
   * 格式化在线时长（秒转换为小时和分钟）
   * @param {number} seconds - 秒数
   * @returns {string} 格式化后的时长字符串
   */
  const formatOnlineTime = (seconds) => {
    if (!seconds || seconds < 0) return '0小時 0分鐘';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes}分鐘`;
    }

    return `${hours}小時 ${minutes}分鐘`;
  };

  /**
   * 格式化日期为标准格式
   * @param {string|number} timestamp - 时间戳
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';

    let date;
    if (typeof timestamp === 'string') {
      let timeStr = timestamp;
      if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
        timeStr = timeStr.replace(' ', 'T') + 'Z';
      }
      date = new Date(timeStr);
    } else if (typeof timestamp === 'number') {
      if (timestamp < 10000000000) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
    } else {
      return '-';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' });
  };

  /**
   * 格式化日期时间为标准格式
   * @param {string|number} timestamp - 时间戳
   * @returns {string} 格式化后的日期时间字符串
   */
  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';

    let date;
    if (typeof timestamp === 'string') {
      let timeStr = timestamp;
      if (!timeStr.includes('Z') && !timeStr.includes('+') && !timeStr.includes('-', 10)) {
        timeStr = timeStr.replace(' ', 'T') + 'Z';
      }
      date = new Date(timeStr);
    } else if (typeof timestamp === 'number') {
      if (timestamp < 10000000000) {
        date = new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
    } else {
      return '-';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  };

  return {
    formatTime,
    formatExpireTime,
    formatOnlineTime,
    formatDate,
    formatDateTime
  };
}
