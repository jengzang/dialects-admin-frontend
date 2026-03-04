# 部署文件清单

## 必需文件（3 个）

1. **index.html** - HTML 入口文件
2. **admin.js** - 所有 JavaScript 代码（单文件，约 2.5MB）
3. **admin.css** - 所有样式（单文件，约 480KB）

## 静态资源文件（7 个）

### 页面图标
4. **query_green.ico** - 网站图标（169KB）

### Leaflet 地图图标（5 个）
5. **marker-icon.png** - 地图标记图标
6. **marker-icon-2x.png** - 地图标记图标（高清）
7. **marker-shadow.png** - 地图标记阴影
8. **layers.png** - 图层控制图标
9. **layers-2x.png** - 图层控制图标（高清）

### 其他
10. **vite.svg** - Vite 图标（可选）

## 部署路径

所有文件应上传到服务器的同一目录：
```
/srv/myapp/statics/admin/
```

## 文件结构

```
/srv/myapp/statics/admin/
├── index.html
├── admin.js
├── admin.css
├── query_green.ico
├── marker-icon.png
├── marker-icon-2x.png
├── marker-shadow.png
├── layers.png
├── layers-2x.png
└── vite.svg
```

## 自动部署

使用 `deploy.sh` 脚本会自动上传所有必需文件和静态资源：

```bash
./deploy.sh
```

脚本会自动：
1. 构建项目
2. 检查所有文件
3. 上传所有文件到服务器
4. 验证部署结果
