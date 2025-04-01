# 外卖记账系统

一个基于网页的外卖记账系统，使用苹果设计风格，具有美观的界面和完整的记账功能。

## 功能特点

- **用户认证**：邮箱登录和注册，支持自动登录和密码重置
- **记账管理**：记录收入（吃喝岭师、24个半、个人预约）和费用（食材、交通）
- **数据分析**：查看单日收支和利润，以及选定时间范围内的统计图表
- **数据导出**：支持导出为CSV和Excel格式
- **日期选择**：简易日历工具，灵活选择日期或日期范围
- **响应式设计**：适配手机、平板和桌面设备

## 技术栈

- HTML/CSS/JavaScript（原生开发）
- Firebase（认证和实时数据库）
- Chart.js（数据可视化）
- SheetJS（Excel导出功能）

## 部署说明

### 前提条件

1. 创建一个Firebase项目：https://console.firebase.google.com/
2. 开启Firebase Authentication，启用邮箱登录
3. 设置Firebase Realtime Database，创建数据库

### 部署步骤

1. 克隆或下载本仓库
2. 修改`index.html`中的Firebase配置：

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL"
};
```

3. 将修改后的代码上传到GitHub Pages、Firebase Hosting或其他静态网站托管服务

### 使用GitHub Pages部署

1. 创建一个新的GitHub仓库
2. 上传`index.html`和`README.md`到仓库
3. 前往仓库设置 -> Pages -> 选择部署分支和文件夹
4. 启用GitHub Pages后，会生成一个可访问的URL

## 使用方法

1. 访问已部署的网站URL
2. 注册一个新账号或使用已有账号登录
3. 使用日期选择器选择要记账的日期
4. 点击"+"按钮添加新的收入或费用记录
5. 查看当日或选定范围内的收支统计和趋势图
6. 需要时可导出数据为CSV或Excel格式

## 自定义配置

如需修改记录类型或其他配置，可编辑以下内容：

- 收入/费用类型：修改HTML中的`.type-option`按钮
- 颜色方案：修改CSS中的`:root`变量
- 数据库结构：确保与Firebase数据库规则匹配

## 注意事项

- 本系统需要网络连接，不支持离线使用
- 请定期备份重要数据
- 可以添加到手机主屏幕使用，获得类似App的体验

## 许可证

MIT许可证 