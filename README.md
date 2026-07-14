# 江小航

基于 `Taro 4 + React 18 + TypeScript + webpack5 + Tailwind CSS v4` 的微信小程序，面向校园服务场景，提供登录、首页日程、课表、成绩、考试、校园卡、地图、日历等功能。

## 技术栈

- Taro 4
- React 18
- TypeScript
- webpack 5
- Tailwind CSS v4
- weapp-tailwindcss
- taro-icons

## 功能

- 学号密码登录与游客登录
- 首页日历与课表抽屉
- 个人信息
- 班级课表
- 考试成绩
- 考试安排
- 校园卡
- 江航地图
- 校历

## 运行

```bash
pnpm install
pnpm dev:weapp
```

## 构建

```bash
pnpm build:weapp
pnpm build:h5
```

## 接口依赖

项目对接 `JXH_API.md` 中定义的 FastAPI 后端，默认接口地址为：

- 生产环境：`https://school.paditianxiu.cn`

如果需要切换本地后端，可修改 `src/services/jxhApi.ts` 中的 `API_BASE_URL`。

## 页面路由

- `pages/index/index`：登录页
- `pages/home/index`：首页
- `pages/profile/index/index`：个人信息
- `pages/schedule/class/index`：班级课表
- `pages/schedule/class/detail/index`：课表详情
- `pages/scores/index/index`：考试成绩
- `pages/exams/index/index`：考试安排
- `pages/campus-card/index/index`：校园卡
- `pages/map/index/index`：江航地图
- `pages/calendar/index/index`：校历

## 目录

- `src/pages/`：页面实现
- `src/components/`：通用组件
- `src/services/`：接口封装
- `src/utils/`：工具函数
- `src/assets/`：静态资源
- `config/`：Taro 构建配置

## 说明

- 登录态通过本地存储的 `cookie` 维护。
- 游客模式提供演示数据。
- 小程序端页面使用自定义导航栏样式，涉及顶部布局时需要兼容安全区。
