import Taro from '@tarojs/taro'

// export const API_BASE_URL =
//   process.env.NODE_ENV === 'development'
//     ? 'http://127.0.0.1:7891'
//     : 'https://school.paditianxiu.cn'
export const API_BASE_URL = 'https://school.paditianxiu.cn'

const STORAGE_COOKIE_KEY = 'jxh_cookie'
const STORAGE_USER_KEY = 'jxh_user'
const STORAGE_GUEST_KEY = 'jxh_guest'
const STORAGE_LOGIN_FORM_KEY = 'jxh_login_form'
const GUEST_COOKIE = 'JXH_GUEST_SESSION=1'

export type ApiResponse<T> = {
  code: number
  data?: T
  message?: string
  cookie?: string
}

export type LoginResult = {
  cookie: string
}

export type LoginFormCache = {
  username: string
  password: string
}

export type UserInfo = {
  name: string
  student_id: string
  major: string
  gender: string
  faculty: string
  class_name: string
  notice: string
}

export type ScheduleCourse = {
  current_week: number
  day: number
  course_name: string
  location: string
  sections: [number, number]
  teacher: string
  weeks: number[]
}

export type ScheduleData = {
  current_week: number
  term_start_date: string
  courses: Array<ScheduleCourse | ScheduleCourse[]>
}

export type ClassScheduleOption = {
  faculty: string
  class_name: string
  campus: string
  major: string
  student_count: string
  payload: Record<string, unknown>
}

export type ScoreItem = {
  course_name: string
  score: string
  course_type: string
  exam_type: string
  semester: string
  credit: string
  teacher_name: string
  department: string
}

export type AcademicExamItem = {
  exam_method: string
  location: string
  exam_time: string
  course_name: string
}

export type LocalExamItem = {
  name: string
  student_id: string
  class_name: string
  exam_name: string
  exam_date: string
  exam_time: string
  exam_place: string
  seat_number: string
}

export type CampusCardInfo = {
  activation_date: string
  name: string
  phone_number: string
  encrypted_account: string
  grade: string
  password: string
  next_encryption_date: string
  notification: string
}

export type SchoolNewsTimelineEntry = {
  id: number
  publishedAt: string
  href: string
  title: string
  subtitle: string
  thumbnail: string
  surface: string
  accent: string
}

export type SchoolNewsCarouselItem = {
  id: number
  title: string
  subtitle: string
  surface: string
}

export type SchoolGroupItem = {
  id: number
  title: string
  file_name: string
}

export type SchoolNewsData = {
  timelineNewsEntries: SchoolNewsTimelineEntry[]
  carouselItems: SchoolNewsCarouselItem[]
}

type SchoolNewsApiData = {
  timeline_news_entries: Array<{
    id: number
    published_at: string
    href: string
    title: string
    subtitle: string
    thumbnail: string
    surface: string
    accent: string
  }>
  carousel_items: SchoolNewsCarouselItem[]
}

const MOCK_USER: UserInfo = {
  name: '游客同学',
  student_id: '游客',
  major: '航空服务体验专业',
  gender: '未知',
  faculty: '江航体验学院',
  class_name: '游客体验班',
  notice: '当前为游客模式，页面数据均为演示数据。'
}

const MOCK_ACTIVE_WEEKS = Array.from({ length: 22 }, (_, index) => index + 1)

const MOCK_SCHEDULE: ScheduleData = {
  current_week: 20,
  term_start_date: '2026-02-23',
  courses: [
    {
      current_week: 20,
      day: 1,
      course_name: '航空概论',
      location: '教学楼 A305',
      sections: [1, 2],
      teacher: '陈老师',
      weeks: MOCK_ACTIVE_WEEKS
    },
    {
      current_week: 20,
      day: 1,
      course_name: '无人机基础训练',
      location: '实训中心 204',
      sections: [5, 6],
      teacher: '刘老师',
      weeks: MOCK_ACTIVE_WEEKS
    },
    {
      current_week: 20,
      day: 2,
      course_name: '航空服务礼仪',
      location: '教学楼 C102',
      sections: [1, 2],
      teacher: '周老师',
      weeks: MOCK_ACTIVE_WEEKS
    },
    {
      current_week: 20,
      day: 3,
      course_name: '大学英语',
      location: '教学楼 B201',
      sections: [3, 4],
      teacher: '王老师',
      weeks: MOCK_ACTIVE_WEEKS
    },
    {
      current_week: 20,
      day: 4,
      course_name: '飞机结构基础',
      location: '实训楼 306',
      sections: [5, 6],
      teacher: '黄老师',
      weeks: MOCK_ACTIVE_WEEKS
    },
    {
      current_week: 20,
      day: 5,
      course_name: '职业规划',
      location: '教学楼 A108',
      sections: [7, 8],
      teacher: '李老师',
      weeks: MOCK_ACTIVE_WEEKS
    }
  ]
}

const MOCK_CLASS_OPTIONS: ClassScheduleOption[] = [
  {
    faculty: '航空制造学院',
    class_name: '无人机应用技术 2401',
    campus: '青云谱校区',
    major: '无人机应用技术',
    student_count: '42',
    payload: { guest_class_id: 'uav-2401' }
  },
  {
    faculty: '航空维修学院',
    class_name: '飞机机电设备维修 2402',
    campus: '青云谱校区',
    major: '飞机机电设备维修',
    student_count: '38',
    payload: { guest_class_id: 'maintenance-2402' }
  },
  {
    faculty: '信息工程学院',
    class_name: '软件技术 2403',
    campus: '昌南校区',
    major: '软件技术',
    student_count: '45',
    payload: { guest_class_id: 'software-2403' }
  }
]

const MOCK_SCORES: ScoreItem[] = [
  {
    course_name: '航空概论',
    score: '92',
    course_type: '必修',
    exam_type: '考试',
    semester: '2025-2026 第二学期',
    credit: '3.0',
    teacher_name: '陈老师',
    department: '航空制造学院'
  },
  {
    course_name: '无人机基础训练',
    score: '优秀',
    course_type: '实训',
    exam_type: '考查',
    semester: '2025-2026 第二学期',
    credit: '2.0',
    teacher_name: '刘老师',
    department: '航空维修学院'
  }
]

const MOCK_ACADEMIC_EXAMS: AcademicExamItem[] = [
  {
    exam_method: '闭卷',
    location: '教学楼 A401',
    exam_time: '2026-07-12 09:00-11:00',
    course_name: '航空概论'
  },
  {
    exam_method: '实操',
    location: '实训中心 204',
    exam_time: '2026-07-15 14:00-16:00',
    course_name: '无人机基础训练'
  }
]

const MOCK_LOCAL_EXAMS: LocalExamItem[] = [
  {
    name: MOCK_USER.name,
    student_id: MOCK_USER.student_id,
    class_name: MOCK_USER.class_name,
    exam_name: '航空概论期末考试',
    exam_date: '2026-07-12',
    exam_time: '09:00-11:00',
    exam_place: '教学楼 A401',
    seat_number: '18'
  }
]

const MOCK_CAMPUS_CARD: CampusCardInfo = {
  activation_date: '2026-03-01',
  name: MOCK_USER.name,
  phone_number: '138****2026',
  encrypted_account: 'guest-card-2026',
  grade: '2024',
  password: '******',
  next_encryption_date: '2026-08-01',
  notification: '游客模式下显示的是演示校园卡信息。'
}

export function getStoredCookie() {
  return Taro.getStorageSync<string>(STORAGE_COOKIE_KEY) || ''
}

export function setStoredCookie(cookie: string) {
  Taro.removeStorageSync(STORAGE_GUEST_KEY)
  Taro.setStorageSync(STORAGE_COOKIE_KEY, cookie)
}

export function getStoredUser() {
  if (isGuestSession()) {
    return Taro.getStorageSync<UserInfo>(STORAGE_USER_KEY) || MOCK_USER
  }

  return Taro.getStorageSync<UserInfo>(STORAGE_USER_KEY) || null
}

export function setStoredUser(user: UserInfo) {
  Taro.setStorageSync(STORAGE_USER_KEY, user)
}

export function getStoredLoginForm() {
  return Taro.getStorageSync<LoginFormCache>(STORAGE_LOGIN_FORM_KEY) || null
}

export function setStoredLoginForm(username: string, password: string) {
  Taro.setStorageSync(STORAGE_LOGIN_FORM_KEY, {
    username,
    password
  })
}

export function isGuestSession() {
  return Taro.getStorageSync<boolean>(STORAGE_GUEST_KEY) === true
}

export function setGuestSession() {
  Taro.setStorageSync(STORAGE_GUEST_KEY, true)
  Taro.setStorageSync(STORAGE_COOKIE_KEY, GUEST_COOKIE)
  Taro.setStorageSync(STORAGE_USER_KEY, MOCK_USER)
}

export function clearSession() {
  Taro.removeStorageSync(STORAGE_COOKIE_KEY)
  Taro.removeStorageSync(STORAGE_USER_KEY)
  Taro.removeStorageSync(STORAGE_GUEST_KEY)
}

async function request<T>(
  path: string,
  body?: Record<string, unknown>,
  method: 'GET' | 'POST' = body ? 'POST' : 'GET'
) {
  const response = await Taro.request<ApiResponse<T>>({
    url: `${API_BASE_URL}${path}`,
    method,
    header: body ? { 'content-type': 'application/json' } : undefined,
    data: body
  })
  const payload = response.data

  if (!payload || payload.code !== 200) {
    throw new Error(payload?.message || '请求失败')
  }

  return payload.data as T
}

function getHeaderValue(headers: Record<string, unknown> | undefined, name: string) {
  if (!headers) {
    return ''
  }

  const targetName = name.toLowerCase()
  const headerKey = Object.keys(headers).find(key => key.toLowerCase() === targetName)

  return headerKey ? String(headers[headerKey] || '') : ''
}

function normalizeCookie(rawCookie: string) {
  return rawCookie
    .split(',')
    .map(item => item.trim().split(';')[0])
    .filter(Boolean)
    .join('; ')
}

async function loginRequest(username: string, password: string): Promise<LoginResult> {
  const response = await Taro.request<ApiResponse<LoginResult | string>>({
    url: `${API_BASE_URL}/api/auth/login`,
    method: 'POST',
    header: { 'content-type': 'application/json' },
    data: { username, password }
  })
  const payload = response.data

  if (!payload || payload.code !== 200) {
    throw new Error(payload?.message || '登录失败')
  }

  const dataCookie =
    typeof payload.data === 'string' ? payload.data : payload.data?.cookie
  const headerCookie = normalizeCookie(
    getHeaderValue(response.header as Record<string, unknown> | undefined, 'Set-Cookie')
  )
  const cookie = dataCookie || payload.cookie || headerCookie

  if (!cookie) {
    throw new Error('登录成功但未返回登录态')
  }

  return { cookie }
}

function withCookie(extra?: Record<string, unknown>) {
  const cookie = getStoredCookie()

  if (!cookie) {
    throw new Error('请先登录')
  }

  return {
    cookie,
    ...(extra ?? {})
  }
}

function mapSchoolNews(data: SchoolNewsApiData): SchoolNewsData {
  return {
    timelineNewsEntries: data.timeline_news_entries.map(item => ({
      id: item.id,
      publishedAt: item.published_at,
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      thumbnail: item.thumbnail,
      surface: item.surface,
      accent: item.accent
    })),
    carouselItems: data.carousel_items
  }
}

export const jxhApi = {
  login(username: string, password: string) {
    return loginRequest(username, password)
  },
  getCurrentUser() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_USER)
    }

    return request<UserInfo>('/api/users/me', withCookie())
  },
  getPersonalSchedule() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_SCHEDULE)
    }

    return request<ScheduleData>('/api/schedules/me', withCookie())
  },
  getClassScheduleOptions() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_CLASS_OPTIONS)
    }

    return request<ClassScheduleOption[]>('/api/schedules/classes', withCookie())
  },
  getClassSchedule(payload: Record<string, unknown>) {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_SCHEDULE)
    }

    return request<ScheduleData>('/api/schedules/classes/query', withCookie({ payload }))
  },
  getScores() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_SCORES)
    }

    return request<ScoreItem[]>('/api/scores', withCookie())
  },
  getAcademicExams() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_ACADEMIC_EXAMS)
    }

    return request<AcademicExamItem[]>('/api/exams/academic', withCookie())
  },
  getLocalExams(studentId: string) {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_LOCAL_EXAMS)
    }

    return request<LocalExamItem[]>('/api/exams/local', { student_id: studentId })
  },
  getCampusCard() {
    if (isGuestSession()) {
      return Promise.resolve(MOCK_CAMPUS_CARD)
    }

    return request<CampusCardInfo>('/api/campus-card/query', withCookie())
  },
  getSchoolCalendar() {
    return request<string[]>('/api/school-calendar', undefined, 'GET')
  },
  getSchoolGroup() {
    return request<SchoolGroupItem[]>('/api/school-group', undefined, 'GET')
  },
  async getSchoolNews() {
    const data = await request<SchoolNewsApiData>('/api/school-news', undefined, 'GET')

    return mapSchoolNews(data)
  }
}
