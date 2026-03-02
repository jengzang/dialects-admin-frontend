<template>
  <div>
    <div class="header-container">
      <h2>近期 API 使用詳情</h2>
      <input v-model="searchQuery" type="text" placeholder="搜索..." class="search-box" />
    </div>

<!--    <button @click="goToApiStatsPage" style="max-width: 100px;padding:3px;display: flex;justify-self: center">API統計表</button>-->

    <!-- 功能统计部分 -->
    <div class="stats">
      <button @click="showUniqueUsers" class="stat-btn">所有用户: {{ uniqueUsersCount }}</button>
      <button @click="showUniqueIPs" class="stat-btn">所有IP: {{ uniqueIPsCount }}</button>
      <button @click="showAPICalls" class="stat-btn" style="max-width: 180px">API調用數: {{ totalAPICalls }}</button>
      <button @click="goToHome" class="stat-btn" style="background: #9e9d24;">返回首頁</button>
    </div>

    <!-- 独特用户弹窗 -->
    <div v-if="showUserModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeUserModal">&times;</span>
        <h3>用户列表</h3>
        <table>
          <thead>
          <tr>
            <th>用戶名</th>
            <th>總使用時長</th>
            <th>次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="userStat in filteredUserStats"
              :key="userStat.user"
              :class="{ 'clickable': userStat.user !== '匿名用戶' }"
              @click="userStat.user !== '匿名用戶' && viewUserStats(userStat.user)"
          >
            <td>{{ userStat.user }}</td>  <!-- 显示用户名 -->
            <td>{{ userStat.totalDuration.toFixed(3) }}s</td> <!-- 总使用时长 -->
            <td>{{ userStat.occurrenceCount }}</td> <!-- 出现次数 -->
            <td>{{ userStat.totalUploadTraffic }}KB</td>  <!-- 上行流量 -->
            <td>{{ userStat.totalDownloadTraffic }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 独特IP弹窗 -->
    <div v-if="showIPModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeIPModal">&times;</span>
        <h3>所有IP地址</h3>
        <table>
          <thead>
          <tr>
            <th>IP 地址</th>
            <th>總使用時長</th>
            <th>次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr v-for="ipStat in filteredIPStats" :key="ipStat.ip">
            <td @click="handleIPClick(ipStat.ip)" style="cursor: pointer;">{{ ipStat.ip }}</td>
            <td>{{ ipStat.totalDuration.toFixed(3) }}s</td> <!-- 总使用时长 -->
            <td>{{ ipStat.occurrenceCount }}</td> <!-- 出现次数 -->
            <td>{{ ipStat.totalUploadTraffic }}KB</td>  <!-- 上行流量 -->
            <td>{{ ipStat.totalDownloadTraffic }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- API调用统计弹窗 -->
    <div v-if="showAPICallsModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeAPICallsModal">&times;</span>
        <h3>各個API調用次數</h3>
        <table>
          <thead>
          <tr>
            <th>API 路徑</th>
            <th>總時長</th>  <!-- 新增总持续时间列 -->
            <th>調用次數</th>
            <th>上行流量</th>  <!-- 新增列 -->
            <th>下行流量</th>  <!-- 新增列 -->
          </tr>
          </thead>
          <tbody>
          <tr v-for="(data, path) in filteredAPICalls" :key="path">
            <td>{{ path }}</td>
            <td>{{ data.totalDuration.toFixed(3) }}s</td>  <!-- 显示总持续时间 -->
            <td>{{ data.count }}</td>
            <td>{{ data.totalUploadTraffic.toFixed(2) }}KB</td>  <!-- 上行流量 -->
            <td>{{ data.totalDownloadTraffic.toFixed(2) }}MB</td>  <!-- 下行流量 -->
          </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!--    詳細表格-->
    <table>
      <thead>
      <tr>
        <th @click="sortData('user')">用戶 <span :class="getArrowClass('user')"></span></th>
        <th @click="sortData('ip')">IP 地址 <span :class="getArrowClass('ip')"></span></th>
        <th @click="sortData('path')">API 路徑 <span :class="getArrowClass('path')"></span></th>
        <th @click="sortData('duration')">持續時長 <span :class="getArrowClass('duration')"></span></th>
        <th @click="sortData('os')">操作系統 <span :class="getArrowClass('os')"></span></th>
        <th @click="sortData('browser')">瀏覽器 <span :class="getArrowClass('browser')"></span></th>
        <th @click="sortData('called_at')">請求時間 <span :class="getArrowClass('called_at')"></span></th>
        <th @click="sortData('uploadTraffic')">上行流量 <span :class="getArrowClass('uploadTraffic')"></span></th>
        <th @click="sortData('downloadTraffic')">下行流量 <span :class="getArrowClass('downloadTraffic')"></span></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(log, index) in currentPageData" :key="index">
        <td>{{ log.user || '' }}</td> <!-- 用户 -->
        <td>{{ log.ip }}</td>
        <td>{{ log.path }}</td>
        <td>{{ log.duration.toFixed(3) }}s</td>  <!-- 持续时长 -->
        <td>{{ log.os }}</td> <!-- 操作系统 -->
        <td>{{ log.browser }}</td> <!-- 浏览器 -->
        <td>{{ formatTime(log.called_at) }}</td> <!-- 使用时间 -->
        <td>{{ log.uploadTraffic }}KB</td>  <!-- 上行流量 -->
        <td>{{ log.downloadTraffic }}KB</td>  <!-- 下行流量 -->
      </tr>
      </tbody>
    </table>

    <!-- 分頁控制 -->
    <BasePagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      :show-first-last="false"
      info-format="simple"
      container-class="pagination-controls"
      @page-change="handlePageChange"
    />
  </div>
</template>



<script>
import { analyticsAPI } from '../../api/index'; // 引入 API 模塊
import {formatTime} from "../../utils.js";
import { BasePagination } from '@/components/common';

export default {
  name: 'ApiDetail',
  components: {
    BasePagination
  },
  data() {
    return {
      currentPage: 1,  // 当前页码
      pageSize: 50,   // 每页显示的记录数
      totalPages: 1,  // 总页数
      userName: '',  // 用户名
      apiLogs: [],   // 用于存储用户的 API 使用记录
      uniqueUsers: [],  // 存储独特用户列表
      uniqueIPs: [],  // 存储独特IP地址列表
      apiCalls: {},   // 存储各个API调用次数
      totalAPICalls: 0, // 总的API调用次数
      showUserModal: false, // 控制独特用户弹窗
      showIPModal: false, // 控制独特IP弹窗
      showAPICallsModal: false, // 控制API调用统计弹窗
      uniqueUsersCount: 0,  // 独特用户数
      uniqueIPsCount: 0,    // 独特IP地址数
      sortOrder: {  // 控制排序的对象
        user: 'asc',
        totalDuration: 'desc',
        occurrenceCount: 'desc',
        ip: 'asc',
        path: 'asc',
        duration: 'desc',
        os: 'asc',
        browser: 'asc',
        called_at: 'desc',
      },
      sortField: '',  // 当前排序字段
      searchQuery: '',  // 新增搜索查询字段
    };
  },
  async mounted() {
    try {
      const apiLogs = await analyticsAPI.getApiUsage({
        skip: this.currentPage,
        limit: this.pageSize
      });
      this.apiLogs = apiLogs;  // 处理返回的 API 使用记录
      // console.log(this.apiLogs)
      // 为每个日志添加上行流量和下行流量，假设 log.request_size 和 log.response_size 存在
      this.apiLogs = this.apiLogs.map(log => ({
        ...log,
        uploadTraffic: (log.request_size / 1024).toFixed(2),  // 转换为 KB，保留两位小数
        downloadTraffic: (log.response_size / 1024).toFixed(2) // 转换为 KB，保留两位小数
      }));

      // 独特用户统计
      this.uniqueUsers = [...new Set(this.apiLogs.map(log => log.user || ''))];
      this.uniqueUsersCount = this.uniqueUsers.length;

      this.userStats = this.uniqueUsers.map(user => {
        const userLogs = this.apiLogs.filter(log => log.user === user);
        const totalDuration = userLogs.reduce((acc, log) => acc + log.duration, 0);
        const occurrenceCount = userLogs.length;
        const totalUploadTraffic = userLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);  // 上行流量
        const totalDownloadTraffic = userLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);  // 下行流量
        return {
          user: user || '匿名用户',
          totalDuration,
          occurrenceCount,
          totalUploadTraffic: (totalUploadTraffic / (1024)).toFixed(2),  // 转换为 MB
          totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2)  // 转换为 MB
        };
      });

      // 排序：按总使用时长从大到小
      this.userStats.sort((a, b) => b.totalDuration - a.totalDuration);

      // 独特 IP 地址统计
      this.uniqueIPs = [...new Set(this.apiLogs.map(log => log.ip))];
      this.uniqueIPsCount = this.uniqueIPs.length;

      this.ipStats = this.uniqueIPs.map(ip => {
        const ipLogs = this.apiLogs.filter(log => log.ip === ip);
        const totalDuration = ipLogs.reduce((acc, log) => acc + log.duration, 0);
        const occurrenceCount = ipLogs.length;
        const totalUploadTraffic = ipLogs.reduce((acc, log) => acc + (log.request_size || 0), 0);  // 上行流量
        const totalDownloadTraffic = ipLogs.reduce((acc, log) => acc + (log.response_size || 0), 0);  // 下行流量
        return {
          ip,
          totalDuration,
          occurrenceCount,
          totalUploadTraffic: (totalUploadTraffic / (1024)).toFixed(2),  // 转换为 MB
          totalDownloadTraffic: (totalDownloadTraffic / (1024 * 1024)).toFixed(2)  // 转换为 MB

        };
      });

      // 排序：按总使用时长从大到小
      this.ipStats.sort((a, b) => b.totalDuration - a.totalDuration);

      this.apiCalls = this.apiLogs.reduce((acc, log) => {
        if (!acc[log.path]) {
          acc[log.path] = { count: 0, totalDuration: 0, totalUploadTraffic: 0, totalDownloadTraffic: 0 };
        }
        acc[log.path].count += 1;
        acc[log.path].totalDuration += log.duration;

        // 转换上行流量和下行流量为 MB，计算时保持数字类型，最后格式化为两位小数
        acc[log.path].totalUploadTraffic += ((log.request_size / (1024))) || 0;  // 转换为 MB，保持数字
        acc[log.path].totalDownloadTraffic += ((log.response_size / (1024 * 1024))) || 0;  // 转换为 MB，保持数字




        this.totalAPICalls += 1;
        return acc;
      }, {});

      // 总页数的计算
      this.totalPages = Math.ceil(this.totalAPICalls / this.pageSize);

      // 排序数据
      this.sortData('called_at');  // ➕ 添加这一行，确保按请求时间倒序初始化

    } catch (error) {
      console.error('Error fetching API usage data', error);
    }
  },

  computed: {
    // 当前页面的数据
    currentPageData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredLogs.slice(startIndex, startIndex + this.pageSize);  // 根据当前页码和每页显示的数据数量筛选
    },

    // 实时筛选日志数据
    filteredLogs() {
      return this.apiLogs.filter(log => {
        return (
            (log.user || '').includes(this.searchQuery) ||
            (log.ip || '').includes(this.searchQuery) ||
            (log.path || '').includes(this.searchQuery) ||
            (log.os || '').includes(this.searchQuery) ||
            (log.browser || '').includes(this.searchQuery)
        );
      });
    },

    // 实时筛选用户统计（基于所有apiLogs数据筛选）
    filteredUserStats() {
      const displayedUsers = this.filteredLogs.map(log => log.user);
      return this.userStats.filter(userStat => displayedUsers.includes(userStat.user));
    },

    // 实时筛选IP统计（基于所有apiLogs数据筛选）
    filteredIPStats() {
      const displayedIPs = this.filteredLogs.map(log => log.ip);
      return this.ipStats.filter(ipStat => displayedIPs.includes(ipStat.ip));
    },

    // 实时筛选API调用统计（基于所有apiLogs数据筛选）
    filteredAPICalls() {
      const displayedPaths = this.filteredLogs.map(log => log.path);
      return Object.keys(this.apiCalls)
          .filter(path => displayedPaths.includes(path))
          .reduce((obj, path) => {
            obj[path] = this.apiCalls[path];
            return obj;
          }, {});
    },
  },

  methods: {
    formatTime,
    // 获取箭头的 CSS 类
    getArrowClass(field) {
      return this.sortOrder[field] === 'asc' ? 'arrow-up' : 'arrow-down';
    },
    // 排序方法
    sortData(field) {
      const currentOrder = this.sortOrder[field] === 'asc' ? 'desc' : 'asc';
      this.sortOrder[field] = currentOrder;

      // 排序字段为时间的特殊处理
      if (field === 'called_at') {
        // 处理时间字段排序
        this.apiLogs.sort((a, b) => {
          const timeA = new Date(a.called_at).getTime();
          const timeB = new Date(b.called_at).getTime();
          return currentOrder === 'asc' ? timeB - timeA : timeA - timeB ;
        });
      } else if (field === 'user' || field === 'ip' || field === 'path' || field === 'os' || field === 'browser') {
        // 字符串字段排序
        this.apiLogs.sort((a, b) => {
          const valueA = a[field] || '';
          const valueB = b[field] || '';
          if (currentOrder === 'asc') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        });
      } else {
        // 数字字段排序
        this.apiLogs.sort((a, b) => {
          if (currentOrder === 'asc') {
            return a[field] - b[field];
          } else {
            return b[field] - a[field];
          }
        });
      }

      // 排序之后重新计算分页
      this.totalPages = Math.ceil(this.apiLogs.length / this.pageSize);
      this.currentPage = 1;  // 重置当前页为第一页
    },

    // 处理分页变化
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchPageData();
    },

    // 更新当前页数据
    fetchPageData() {
      this.totalPages = Math.ceil(this.apiLogs.length / this.pageSize);  // 重新计算总页数
    },
    // 弹出独特用户的表格
    showUniqueUsers() {
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
    },

    // 弹出独特IP地址的表格
    showUniqueIPs() {
      this.showIPModal = true;
    },
    closeIPModal() {
      this.showIPModal = false;
    },

    // 弹出各个API调用次数的统计表格
    showAPICalls() {
      this.showAPICallsModal = true;
    },
    closeAPICallsModal() {
      this.showAPICallsModal = false;
    },
    async viewUserStats(username) {
      this.$router.push({name: 'UserStats', query: {username: username}});
    },
    async handleIPClick(ip) {
      this.$router.push({ path: `/ip/${ip}` });
      console.log('Clicked IP:', ip);  // 打印被点击的 IP
      //
      // try {
      //   const response = await fetch(`http://ip-api.com/json/${ip}`);
      //   const data = await response.json();  // 解析返回的 JSON 数据
      //   console.log('IP 归属地:', data);  // 打印 IP 归属地信息
      // } catch (error) {
      //   console.error('无法获取 IP 归属地:', error);
      // }
    },
    goToHome(){
      this.$router.push({name: 'Home'});
    },
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: $spacing-xs;
  margin-top: $spacing-sm;
}

.stat-btn {
  @include button-variant($color-primary, #45a049);
  padding: $spacing-sm;
  margin: $spacing-xs;
  border-radius: 15px;
  font-size: 17px;
  max-width: 120px;
  width: 100%;
}

h1 {
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0;
  color: #2c6e49;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: $color-background-white;
  padding: $spacing-md;
  border-radius: $spacing-xs;
  width: 90%;
  max-width: 500px;
  max-height: 80%;
  overflow-y: auto;
}

.close {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  font-size: 60px;
  cursor: pointer;

  &:hover {
    color: $color-danger;
  }
}

.pagination-controls {
  display: flex;
  justify-content: center;
  margin-top: $spacing-md;
  flex-wrap: wrap;

  button {
    @include button-variant($color-primary, #45a049);
    padding: $spacing-sm $spacing-md;
    margin: $spacing-xs;
    border-radius: $spacing-xs;
    font-size: $font-size-md;
    min-width: 120px;
    box-sizing: border-box;

    &:disabled {
      background-color: #ccc;
    }
  }

  span {
    font-size: $font-size-md;
    align-self: center;
    color: $color-text-primary;
  }
}

p {
  font-size: $font-size-lg;
  text-align: center;
  margin-bottom: $spacing-md;
  color: $color-text-primary;
  font-weight: normal;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;

  th, td {
    border: 1px solid $color-border;
    padding: 12px;
    text-align: left;
    font-size: $font-size-md;
  }

  th {
    background-color: $color-primary-light;
    color: #2c6e49;
    font-weight: bold;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: $color-border;
    }
  }

  td {
    background-color: $color-background;
  }
}

.arrow-up::after {
  content: '↑';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.arrow-down::after {
  content: '↓';
  margin-left: $spacing-xs;
  font-size: $font-size-sm;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
  flex-wrap: nowrap;
  overflow: hidden;

  h2 {
    white-space: nowrap;
    margin: 0;
  }
}

.search-box {
  padding: 6px 12px;
  font-size: $font-size-md;
  margin-left: $spacing-md;
  border: 1px solid $color-primary;
  background-color: $color-background;
  color: #2c6e49;
  border-radius: 25px;
  transition: all $transition-normal;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  max-width: 100px;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 50px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: $color-border;
    background-color: #e8f5e9;
    box-shadow: 0 0 10px rgba(129, 199, 132, 0.5);
  }
}

@include respond-to(tablet) {
  th, td {
    padding: 8px;
  }

  .stat-btn {
    font-size: $font-size-sm;
    padding: 12px;
  }

  .modal-content {
    width: 95%;
  }

  .pagination-controls button {
    font-size: $font-size-sm;
    min-width: 100px;
  }

  table {
    font-size: $font-size-sm;
    overflow-x: auto;
    display: block;
  }

  th, td {
    padding: 8px 12px;
  }
}

@include respond-to(mobile) {
  table {
    font-size: $font-size-xs;
  }

  .pagination-controls button {
    font-size: 13px;
    padding: 6px 14px;
  }

  .stat-btn {
    font-size: 15px;
    padding: 6px;
  }

  .close {
    font-size: 50px;
  }

  .modal-content {
    padding: 15px;
  }

  .search-box {
    max-width: 50px !important;
  }
}
</style>
