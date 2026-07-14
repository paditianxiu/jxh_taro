# JXH API Frontend Integration Guide

本文档用于前端或 AI 辅助生成前端代码时对接江小航 FastAPI 后端。在线 Swagger 地址为 `/docs`，OpenAPI JSON 地址为
`/openapi.json`。

## 基础信息

- 本地开发地址：`http://127.0.0.1:7891`
- 生产环境地址：`https://school.paditianxiu.cn`
- 接口前缀：`/api`
- 请求格式：`application/json`
- 返回格式：`application/json`
- 命名约定：请求和响应字段统一使用英文 `snake_case`
- Cookie 约定：凡是需要教务系统登录态的接口，统一使用 `POST` body 传入 `cookie`

## 统一响应结构

成功：

```json
{
  "code": 200,
  "data": {}
}
```

失败：

```json
{
  "code": 400,
  "message": "缺少 cookie 参数"
}
```

前端判断建议：优先判断 `code === 200`，失败时展示 `message`。

## 登录与 Cookie

### 登录教务系统

`POST /api/auth/login`

请求：

```json
{
  "username": "241372029",
  "password": "ZFsoft12!"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "cookie": "JSESSIONID=xxx; route=xxx"
  }
}
```

前端应保存 `data.cookie`，后续需要登录态的接口都放入 body。

## 用户信息

### 获取当前用户信息

`POST /api/users/me`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "name": "张三",
    "student_id": "241372029",
    "major": "软件技术",
    "gender": "男",
    "faculty": "信息工程学院",
    "class_name": "2413A1",
    "notice": "⚠️目前课表查询已班级课表为准"
  }
}
```

## 校园卡

### 查询校园卡信息

`POST /api/campus-card/query`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "activation_date": "2025-09-01",
    "name": "张三",
    "phone_number": "138****1234",
    "encrypted_account": "1234********",
    "grade": "2024",
    "password": "******",
    "next_encryption_date": "",
    "notification": ""
  }
}
```

## 考试

### 获取教务系统考试安排

`POST /api/exams/academic`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": [
    {
      "exam_method": "闭卷",
      "location": "一教101",
      "exam_time": "2026-01-10 09:00-11:00",
      "course_name": "高等数学"
    }
  ]
}
```

### 查询本地考试表

`POST /api/exams/local`

请求：

```json
{
  "student_id": "241372029"
}
```

响应：

```json
{
  "code": 200,
  "data": [
    {
      "name": "张三",
      "student_id": "241372029",
      "class_name": "2413A1",
      "exam_name": "英语考试",
      "exam_date": "2026-01-10",
      "exam_time": "09:00-11:00",
      "exam_place": "一教101",
      "seat_number": "12"
    }
  ]
}
```

## 成绩

### 获取学生成绩

`POST /api/scores`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": [
    {
      "course_name": "高等数学",
      "score": "95",
      "course_type": "必修",
      "exam_type": "正常考试",
      "semester": "2025-2026第1学期",
      "credit": "4",
      "teacher_name": "李老师",
      "department": "公共基础部"
    }
  ]
}
```

## 课表

### 获取个人课表

`POST /api/schedules/me`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": {
    "current_week": 19,
    "term_start_date": "2026/03/02",
    "courses": [
      {
        "current_week": 19,
        "day": 1,
        "course_name": "高等数学",
        "location": "一教101",
        "sections": [
          1,
          2
        ],
        "teacher": "李老师",
        "weeks": [
          1,
          2,
          3,
          4
        ]
      }
    ]
  }
}
```

说明：`day` 为 1-7，代表周一到周日；`sections` 为起止节次。

### 获取班级课表列表

`POST /api/schedules/classes`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx"
}
```

响应：

```json
{
  "code": 200,
  "data": [
    {
      "faculty": "信息工程学院",
      "class_name": "2413A1",
      "campus": "主校区",
      "major": "软件技术",
      "student_count": "45",
      "payload": {
        "xnm": "2025",
        "xqm": "12",
        "bh_id": "xxx"
      }
    }
  ]
}
```

前端查询指定班级课表时，把目标项的 `payload` 原样传给下一个接口。

### 查询指定班级课表

`POST /api/schedules/classes/query`

请求：

```json
{
  "cookie": "JSESSIONID=xxx; route=xxx",
  "payload": {
    "xnm": "2025",
    "xqm": "12",
    "bh_id": "xxx"
  }
}
```

响应结构同 `POST /api/schedules/me`。

## 校历

### 获取校历图片

`GET /api/school-calendar`

响应：

```json
{
  "code": 200,
  "data": [
    "https://school.paditianxiu.cn/public/school_calendar/example.jpg"
  ]
}
```

## 学校新闻

### 获取学校要闻

`GET /api/school-news`

说明：该接口不需要鉴权。后端实时爬取 `https://www.jhzyedu.cn/index/xxyw.htm` 中 `.inner_page` 的学校要闻列表，并返回新闻时间线和首页轮播配置。`thumbnail` 已转换为后端图片代理地址，微信小程序只需要配置本接口服务域名。

响应：

```json
{
  "code": 200,
  "data": {
    "timeline_news_entries": [
      {
        "id": 1,
        "published_at": "2026-07-01",
        "href": "https://www.jhzyedu.cn/info/1051/231051.htm",
        "title": "江西航空职业技术学院隆重召开庆祝中国共产党成立105周年暨长征胜利90周年大会",
        "subtitle": "6月30日，江西航空职业技术学院庆祝中国共产党成立105周年暨长征胜利90周年大会在蓝天剧院隆重举行。",
        "thumbnail": "https://school.paditianxiu.cn/api/school-news/image?url=https%3A%2F%2Fwww.jhzyedu.cn%2Fvirtual_attach_file.vsb%3Fafc%3Dxxx",
        "surface": "#F8FAFC",
        "accent": "#2563EB"
      }
    ],
    "carousel_items": [
      {
        "id": 1,
        "title": "暑期校园服务安排已更新",
        "subtitle": "食堂、图书馆、校车服务时间调整",
        "surface": "#111827"
      }
    ]
  }
}
```

前端当前若使用 `timelineNewsEntries`、`publishedAt`、`carouselItems`，建议在请求层做一次字段映射。

### 代理学校新闻图片

`GET /api/school-news/image?url={encoded_image_url}`

说明：该接口不需要鉴权，仅允许代理 `www.jhzyedu.cn` 或 `jhzyedu.cn` 的图片资源，返回图片二进制内容。前端通常不需要手动调用，直接使用学校要闻接口返回的 `thumbnail` 即可。

响应头：

```http
Content-Type: image/jpeg
Cache-Control: public, max-age=86400
```

## 前端对接建议

1. 登录成功后把 `data.cookie` 存入内存、状态管理或安全存储。
2. 所有需要 cookie 的接口都用 `POST`，不要拼接到 URL query。
3. 统一封装请求函数，失败时读取 `message`。
4. 不要依赖中文字段名；所有业务字段都按本文档的英文 key 对接。
5. Swagger 可用于确认实时接口：`/docs`。
