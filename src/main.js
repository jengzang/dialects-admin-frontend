import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import api from './axios';  // 引入 axios 配置
import './style.css'; // 引入全局CSS
import './styles/variables.css'; // 引入全局變量
import './styles/common.css'; // 引入通用樣式
import ElementPlus from 'element-plus';  // 引入 Element Plus
import 'element-plus/dist/index.css';  // 引入 Element Plus 样式
import 'leaflet/dist/leaflet.css';


const app = createApp(App);
const pinia = createPinia();

// 全局挂载 axios 配置
app.config.globalProperties.$api = api;

// 注册 Pinia 状态管理
app.use(pinia);

// 注册 Element Plus 插件
app.use(ElementPlus);

// 使用 Vue Router
app.use(router);

// 挂载应用
app.mount('#app');

