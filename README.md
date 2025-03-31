# 每日记账系统

这是一个基于Web的每日记账系统，采用苹果设计风格，适合在iOS设备上添加到主屏幕使用。应用支持记录收入和费用，查看数据概览和趋势图，并支持数据导出功能。

## 功能特点

- **用户认证**：支持邮箱登录和注册，自动登录，密码重置
- **记账管理**：添加收入和费用记录，滑动删除记录
- **日期选择**：单日选择和范围选择（最近7/30/90天、本月、自定义）
- **数据概览**：显示当日和选定范围内的收入、费用和利润统计
- **数据可视化**：使用Chart.js绘制利润、收入/费用趋势图和类型比例图
- **数据导出**：支持导出为CSV和Excel格式
- **响应式设计**：适配手机、平板和桌面端
- **苹果设计风格**：圆角、模糊效果、渐变色、动画效果

## 使用方法

### 在线使用

直接访问应用部署URL并注册/登录账号即可使用。

### 添加到iOS主屏幕

1. 在Safari中打开应用URL
2. 点击分享按钮（底部中间的方框加箭头图标）
3. 滚动并选择"添加到主屏幕"
4. 点击"添加"

添加后，应用将以全屏模式运行，无地址栏和浏览器界面。

## 数据存储

应用使用Firebase进行用户认证和数据存储：

- 用户数据安全存储在Firebase Authentication
- 记账记录存储在Firebase Firestore数据库
- 所有数据只能由创建者访问

## 部署方法

### 前提条件

- 拥有一个GitHub账号
- 拥有一个Firebase账号

### 步骤一：设置Firebase

1. 访问[Firebase控制台](https://console.firebase.google.com/)并创建一个新项目
2. 在项目设置中添加一个Web应用
3. 启用Authentication并开启电子邮件/密码登录
4. 创建Firestore数据库（在测试模式下）

### 步骤二：修改Firebase配置

在`index.html`文件中找到Firebase配置部分（大约在第500行左右），将其替换为你自己的Firebase配置：

```javascript
const firebaseConfig = {
    apiKey: "你的apiKey",
    authDomain: "你的authDomain",
    projectId: "你的projectId",
    storageBucket: "你的storageBucket",
    messagingSenderId: "你的messagingSenderId",
    appId: "你的appId"
};
```

### 步骤三：部署到GitHub Pages

1. 在GitHub创建新仓库
2. 上传项目文件到仓库
3. 在仓库设置中启用GitHub Pages（Settings -> Pages）
4. 选择main分支作为源并保存

几分钟后，你的应用将在`https://你的用户名.github.io/仓库名/`上可用。

## 技术栈

- **前端**：HTML/CSS/JavaScript（原生开发，无框架）
- **库**：
  - Firebase（用户认证和数据存储）
  - Chart.js（数据可视化）
  - SheetJS（Excel导出）
- **设计风格**：苹果设计语言（iOS风格）

## 扩展和自定义

你可以通过修改`index.html`文件来自定义应用：

- 修改收入/费用类型：编辑记录类型选择器部分（约第200行）
- 更改颜色方案：修改CSS变量（约第60行）
- 添加新功能：扩展JavaScript代码

## 浏览器兼容性

- 推荐在Safari (iOS)、Chrome、Firefox和Edge的最新版本中使用
- 部分功能（如滑动删除）针对触摸屏设备优化

## 离线功能

此应用需要网络连接才能正常工作，无网络时将显示提示并限制功能。

## 许可证

MIT许可证 