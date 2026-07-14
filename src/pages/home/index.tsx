import { View, Text, ScrollView, Image } from '@tarojs/components'
import type { CommonEventFunction } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import './index.css'

import { MaterialIcons } from 'taro-icons'

import { useEffect, useMemo, useRef, useState } from 'react'
import AppLogo from "@/assets/images/jxh-logo.png"
import HomeSheetPanel, { type HomeTabKey } from './components/HomeSheetPanel'
import type { ScheduleGroup } from './components/HomeSchedulePanel'
import {
  getStoredUser,
  jxhApi,
  setStoredUser,
  type ScheduleCourse,
  type ScheduleData,
  type UserInfo
} from '@/services/jxhApi'
import { getFuzhouCourseTimeRange } from '@/utils/scheduleTime'
import { getJxhShareMessage } from '@/utils/share'


type SafeArea = {
  left: number
  right: number
  top: number
  bottom: number
  width?: number
  height: number
}

type WindowInfo = {
  pixelRatio: number
  screenWidth: number
  screenHeight: number
  windowWidth: number
  windowHeight: number
  statusBarHeight?: number
  safeArea?: SafeArea
}

type MenuButtonRect = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

type TouchEventLike = {
  touches: Array<{
    clientY: number
  }>
}

type ScrollEventLike = {
  detail: {
    scrollTop?: number
  }
}

type RefresherPullEventLike = {
  detail?: {
    dy?: number
  }
}

type CalendarDay = {
  key: string
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

type MonthTransitionDirection = 'prev' | 'next'

const MIN_SHEET_HEIGHT = 220
const MID_SHEET_HEIGHT = 420
const DEFAULT_SHEET_STATE_HEIGHT = MID_SHEET_HEIGHT
const MAX_SHEET_HEIGHT = 750
const BOTTOM_NAV_CONTENT_HEIGHT = 64
const DEFAULT_WINDOW_WIDTH = 375
const DEFAULT_WINDOW_HEIGHT = 667
const DEFAULT_MENU_BUTTON_WIDTH = 87
const DEFAULT_MENU_BUTTON_HEIGHT = 32
const DEFAULT_MENU_BUTTON_MARGIN = 8
const NAV_LABEL_SHOW_DELAY_MS = 220
const SHEET_MAX_SCROLL_THRESHOLD = 1
const SHEET_CONTENT_TOP_THRESHOLD = 1
const SHEET_PULL_TO_DRAG_THRESHOLD = 4
const SHEET_REFRESHER_THRESHOLD = 10000
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

const COURSE_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-cyan-500']

const TABS: Array<{ key: HomeTabKey; icon: string; label: string }> = [
  { key: 'help', icon: 'flight', label: '江航' },
  { key: 'campus', icon: 'school', label: '校园' },
  { key: 'home', icon: 'healing', label: '主页' },
  { key: 'news', icon: 'flag', label: '新闻' },
  { key: 'profile', icon: 'brush', label: '我的' },
]

function getCurrentWindowInfo(): WindowInfo {
  if (typeof Taro.getWindowInfo === 'function') {
    return Taro.getWindowInfo()
  }

  const systemInfo = Taro.getSystemInfoSync()

  return {
    pixelRatio: systemInfo.pixelRatio,
    screenWidth: systemInfo.screenWidth,
    screenHeight: systemInfo.screenHeight,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    statusBarHeight: systemInfo.statusBarHeight,
    safeArea: systemInfo.safeArea
  }
}

function getDefaultWindowInfo(): WindowInfo {
  return {
    pixelRatio: 2,
    screenWidth: DEFAULT_WINDOW_WIDTH,
    screenHeight: DEFAULT_WINDOW_HEIGHT,
    windowWidth: DEFAULT_WINDOW_WIDTH,
    windowHeight: DEFAULT_WINDOW_HEIGHT,
    statusBarHeight: 0
  }
}

function getCurrentMenuButtonRect(windowInfo: WindowInfo): MenuButtonRect {
  if (typeof Taro.getMenuButtonBoundingClientRect === 'function') {
    const menuButtonRect = Taro.getMenuButtonBoundingClientRect()

    if (menuButtonRect.height > 0) {
      return menuButtonRect
    }
  }

  const top = (windowInfo.statusBarHeight ?? 0) + 4
  const right = windowInfo.windowWidth - DEFAULT_MENU_BUTTON_MARGIN
  const left = right - DEFAULT_MENU_BUTTON_WIDTH

  return {
    top,
    right,
    bottom: top + DEFAULT_MENU_BUTTON_HEIGHT,
    left,
    width: DEFAULT_MENU_BUTTON_WIDTH,
    height: DEFAULT_MENU_BUTTON_HEIGHT
  }
}

function getSafeAreaBottom(windowInfo: WindowInfo) {
  if (!windowInfo.safeArea) {
    return 0
  }

  return Math.max(windowInfo.screenHeight - windowInfo.safeArea.bottom, 0)
}

function getSafeWindowInfo() {
  try {
    return getCurrentWindowInfo()
  } catch (error) {
    console.warn('获取窗口信息失败', error)
    return getDefaultWindowInfo()
  }
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function getMonthOrder(date: Date) {
  return date.getFullYear() * 12 + date.getMonth()
}

function formatMonthTitle(date: Date) {
  return `${date.getMonth() + 1}月`
}

function createCalendarDays(viewMonth: Date, today: Date): CalendarDay[] {
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const calendarStart = new Date(monthStart)

  calendarStart.setDate(monthStart.getDate() - monthStart.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + index)

    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    return {
      key: `${year}-${month + 1}-${day}`,
      date: new Date(date),
      day,
      isCurrentMonth: month === viewMonth.getMonth(),
      isToday: isSameDate(date, today)
    }
  })
}

function getScheduleDay(date: Date) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function flattenCourses(schedule: ScheduleData) {
  return schedule.courses.flatMap(course => Array.isArray(course) ? course : [course])
}

function isActiveCourse(course: ScheduleCourse, currentWeek: number) {
  return currentWeek > 0 && course.weeks.includes(currentWeek)
}

function getDateOnlyTimestamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function parseDateValue(value: string) {
  const matchedDate = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)

  if (!matchedDate) {
    return new Date(value)
  }

  return new Date(
    Number(matchedDate[1]),
    Number(matchedDate[2]) - 1,
    Number(matchedDate[3])
  )
}

function getScheduleWeek(schedule: ScheduleData, selectedDate: Date) {
  const termStart = parseDateValue(schedule.term_start_date)

  if (Number.isNaN(termStart.getTime())) {
    return schedule.current_week
  }

  const diffDays = Math.floor(
    (getDateOnlyTimestamp(selectedDate) - getDateOnlyTimestamp(termStart)) /
      (24 * 60 * 60 * 1000)
  )

  return Math.floor(diffDays / 7) + 1
}

function formatScheduleDateTitle(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日 · 周${WEEK_DAYS[date.getDay()]}`
}

function createEmptyScheduleGroup(selectedDate: Date): ScheduleGroup {
  return {
    date: formatScheduleDateTitle(selectedDate),
    items: []
  }
}

function createScheduleGroups(schedule: ScheduleData | null, selectedDate: Date): ScheduleGroup[] {
  if (!schedule) {
    return [createEmptyScheduleGroup(selectedDate)]
  }

  const selectedDay = getScheduleDay(selectedDate)
  const selectedWeek = getScheduleWeek(schedule, selectedDate)
  const weekTitle = selectedWeek > 0 ? ` · 第 ${selectedWeek} 周` : ''
  const selectedCourses = flattenCourses(schedule)
    .filter(course => course.day === selectedDay && isActiveCourse(course, selectedWeek))
    .sort((left, right) => left.sections[0] - right.sections[0])

  return [
    {
      date: `${formatScheduleDateTitle(selectedDate)}${weekTitle}`,
      items: selectedCourses.map((course, index) => {
        const courseTime = getFuzhouCourseTimeRange(course.sections)

        return {
          timeStart: courseTime.timeStart,
          timeEnd: courseTime.timeEnd,
          color: COURSE_COLORS[index % COURSE_COLORS.length],
          title: course.course_name,
          subtitle: `${course.location || '地点待定'} · ${course.teacher || '教师待定'}`
        }
      })
    }
  ]
}

function getCourseDate(schedule: ScheduleData, course: ScheduleCourse, week: number) {
  const termStart = parseDateValue(schedule.term_start_date)

  if (Number.isNaN(termStart.getTime()) || week <= 0) {
    return null
  }

  const courseDate = new Date(termStart)
  courseDate.setDate(termStart.getDate() + (week - 1) * 7 + course.day - 1)

  return courseDate
}

function findNearestCourseDate(schedule: ScheduleData | null, selectedDate: Date) {
  if (!schedule) {
    return null
  }

  const selectedTimestamp = getDateOnlyTimestamp(selectedDate)
  const courseDates = flattenCourses(schedule)
    .flatMap(course => course.weeks.map(week => getCourseDate(schedule, course, week)))
    .filter((date): date is Date => !!date)

  if (courseDates.length === 0) {
    return null
  }

  return courseDates.reduce<Date | null>((nearestDate, currentDate) => {
    if (!nearestDate) {
      return currentDate
    }

    const currentTimestamp = getDateOnlyTimestamp(currentDate)
    const nearestTimestamp = getDateOnlyTimestamp(nearestDate)
    const currentDistance = Math.abs(currentTimestamp - selectedTimestamp)
    const nearestDistance = Math.abs(nearestTimestamp - selectedTimestamp)

    if (currentDistance < nearestDistance) {
      return currentDate
    }

    if (
      currentDistance === nearestDistance &&
      currentTimestamp >= selectedTimestamp &&
      nearestTimestamp < selectedTimestamp
    ) {
      return currentDate
    }

    return nearestDate
  }, null)
}

export default function Home() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const initialWindowInfo = useRef(getSafeWindowInfo())
  const [windowInfo, setWindowInfo] = useState(initialWindowInfo.current)
  const [menuButtonRect, setMenuButtonRect] = useState(() =>
    getCurrentMenuButtonRect(initialWindowInfo.current)
  )
  const [today, setToday] = useState(() => new Date())
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [monthTransitionDirection, setMonthTransitionDirection] =
    useState<MonthTransitionDirection>('next')
  const [activeIndex, setActiveIndex] = useState(2)
  const [visibleNavLabelIndex, setVisibleNavLabelIndex] = useState(2)
  const navLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sheetContentScrollTop = useRef(0)
  const isSheetContentDraggingSheet = useRef(false)
  const isSheetContentTouching = useRef(false)
  const isSheetContentMovingDown = useRef(false)
  const lastSheetContentTouchY = useRef(0)
  const sheetContentScrollResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isSheetContentDragMode, setIsSheetContentDragMode] = useState(false)
  const [sheetContentScrollTopValue, setSheetContentScrollTopValue] = useState(0)
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => getStoredUser())

  const syncHomeUserInfo = async () => {
    const storedUser = getStoredUser()

    if (storedUser) {
      setUserInfo(storedUser)
      return
    }

    try {
      const currentUser = await jxhApi.getCurrentUser()

      setStoredUser(currentUser)
      setUserInfo(currentUser)
    } catch {
      setUserInfo(null)
    }
  }

  const loadHomeSchedule = async () => {
    setScheduleLoading(true)
    setScheduleError('')
    setUserInfo(getStoredUser())

    try {
      const schedule = await jxhApi.getPersonalSchedule()
      setScheduleData(schedule)
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : '课程加载失败')
      setScheduleData(null)
    } finally {
      setScheduleLoading(false)
    }
  }

  useLoad(() => {
    const nextWindowInfo = getSafeWindowInfo()
    const currentDate = new Date()

    setWindowInfo(nextWindowInfo)
    setMenuButtonRect(getCurrentMenuButtonRect(nextWindowInfo))
    setToday(currentDate)
    setViewMonth(currentDate)
    setSelectedDate(currentDate)
    void syncHomeUserInfo()
    void loadHomeSchedule()
  })

  useDidShow(() => {
    void syncHomeUserInfo()
  })


  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_STATE_HEIGHT)

  const startY = useRef(0)
  const startHeight = useRef(DEFAULT_SHEET_STATE_HEIGHT)
  const sheetHeightRef = useRef(DEFAULT_SHEET_STATE_HEIGHT)

  const safeAreaBottom = getSafeAreaBottom(windowInfo)
  const bottomNavHeight = BOTTOM_NAV_CONTENT_HEIGHT + safeAreaBottom
  const sheetAvailableHeight = windowInfo.windowHeight - bottomNavHeight - menuButtonRect.bottom - 12
  const maxSheetHeight = Math.max(
    MIN_SHEET_HEIGHT,
    Math.min(MAX_SHEET_HEIGHT, sheetAvailableHeight)
  )
  const sheetSnapPoints = Array.from(new Set([
    MIN_SHEET_HEIGHT,
    Math.min(MID_SHEET_HEIGHT, maxSheetHeight),
    maxSheetHeight
  ]))
  const isSheetContentScrollable =
    Math.abs(sheetHeight - maxSheetHeight) <= SHEET_MAX_SCROLL_THRESHOLD
  const canScrollSheetContent = isSheetContentScrollable && !isSheetContentDragMode
  const calendarDays = useMemo(() => createCalendarDays(viewMonth, today), [viewMonth, today])
  const scheduleGroups = useMemo(
    () => createScheduleGroups(scheduleData, selectedDate),
    [scheduleData, selectedDate]
  )
  const nearestCourseDate = useMemo(
    () => findNearestCourseDate(scheduleData, selectedDate),
    [scheduleData, selectedDate]
  )
  const monthTitle = useMemo(() => formatMonthTitle(viewMonth), [viewMonth])
  const monthAnimationKey = useMemo(
    () => `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`,
    [viewMonth]
  )
  const monthTransitionClass = `home-month-transition-${monthTransitionDirection}`
  const navTop = Math.max(
    menuButtonRect.top,
    windowInfo.safeArea ? windowInfo.safeArea.top : 0
  )
  const navAvatarSize = menuButtonRect.height

  useEffect(() => {
    setSheetHeight(currentHeight => {
      const nextHeight = Math.min(currentHeight, maxSheetHeight)

      sheetHeightRef.current = nextHeight
      return nextHeight
    })
  }, [maxSheetHeight])

  useEffect(() => {
    return () => {
      if (navLabelTimer.current) {
        clearTimeout(navLabelTimer.current)
      }

      if (sheetContentScrollResetTimer.current) {
        clearTimeout(sheetContentScrollResetTimer.current)
      }
    }
  }, [])


  const handleTouchStart: CommonEventFunction = event => {
    const touchEvent = event as typeof event & TouchEventLike

    if (!touchEvent.touches.length) {
      return
    }

    startY.current = touchEvent.touches[0].clientY
    startHeight.current = sheetHeightRef.current
  }

  const handleTouchMove: CommonEventFunction = event => {
    const touchEvent = event as typeof event & TouchEventLike

    if (!touchEvent.touches.length) {
      return
    }

    const currentY = touchEvent.touches[0].clientY

    const diff = startY.current - currentY

    let nextHeight = startHeight.current + diff

    if (nextHeight < MIN_SHEET_HEIGHT) {
      nextHeight = MIN_SHEET_HEIGHT
    }

    if (nextHeight > maxSheetHeight) {
      nextHeight = maxSheetHeight
    }

    sheetHeightRef.current = nextHeight
    setSheetHeight(nextHeight)
  }

  const handleTouchEnd = () => {
    let target = sheetSnapPoints[0]
    const currentSheetHeight = sheetHeightRef.current

    sheetSnapPoints.forEach(point => {
      if (
        Math.abs(point - currentSheetHeight) <
        Math.abs(target - currentSheetHeight)
      ) {
        target = point
      }
    })

    sheetHeightRef.current = target
    setSheetHeight(target)
  }

  const resetSheetContentGestureState = () => {
    sheetContentScrollTop.current = 0
    isSheetContentDraggingSheet.current = false
    isSheetContentTouching.current = false
    isSheetContentMovingDown.current = false
    lastSheetContentTouchY.current = 0
    setIsSheetContentDragMode(false)
  }

  const resetSheetContentScrollPosition = () => {
    sheetContentScrollTop.current = 0

    if (sheetContentScrollResetTimer.current) {
      clearTimeout(sheetContentScrollResetTimer.current)
    }

    setSheetContentScrollTopValue(1)
    sheetContentScrollResetTimer.current = setTimeout(() => {
      setSheetContentScrollTopValue(0)
      sheetContentScrollResetTimer.current = null
    }, 0)
  }

  const startSheetContentDrag = (currentY: number) => {
    isSheetContentDraggingSheet.current = true
    setIsSheetContentDragMode(true)
    setSheetContentScrollTopValue(0)
    startY.current = currentY
    startHeight.current = sheetHeightRef.current
  }

  const handleSheetContentTouchStart: CommonEventFunction = event => {
    const touchEvent = event as typeof event & TouchEventLike

    if (!touchEvent.touches.length) {
      return
    }

    const currentY = touchEvent.touches[0].clientY
    const shouldDragSheet = !isSheetContentScrollable

    isSheetContentTouching.current = true
    isSheetContentMovingDown.current = false
    lastSheetContentTouchY.current = currentY
    isSheetContentDraggingSheet.current = shouldDragSheet
    setIsSheetContentDragMode(shouldDragSheet)
    handleTouchStart(event)
  }

  const handleSheetContentTouchMove: CommonEventFunction = event => {
    const touchEvent = event as typeof event & TouchEventLike

    if (!touchEvent.touches.length) {
      return
    }

    const currentY = touchEvent.touches[0].clientY
    const isMovingDown = currentY > lastSheetContentTouchY.current

    isSheetContentMovingDown.current = isMovingDown
    lastSheetContentTouchY.current = currentY

    if (!isSheetContentScrollable) {
      handleTouchMove(event)
      return
    }

    const isContentAtTop = sheetContentScrollTop.current <= SHEET_CONTENT_TOP_THRESHOLD

    if (!isSheetContentDraggingSheet.current && isContentAtTop && isMovingDown) {
      startSheetContentDrag(currentY)
      return
    }

    if (isSheetContentDraggingSheet.current) {
      handleTouchMove(event)
    }
  }

  const finishSheetContentGesture = () => {
    const wasDraggingSheet = isSheetContentDraggingSheet.current

    isSheetContentDraggingSheet.current = false
    isSheetContentTouching.current = false
    isSheetContentMovingDown.current = false
    setIsSheetContentDragMode(false)

    if (!wasDraggingSheet) {
      return
    }

    handleTouchEnd()
  }

  const handleSheetContentTouchEnd: CommonEventFunction = () => {
    finishSheetContentGesture()
  }

  const handleSheetContentScroll: CommonEventFunction = event => {
    const scrollEvent = event as typeof event & ScrollEventLike

    if (isSheetContentDraggingSheet.current) {
      sheetContentScrollTop.current = 0
      return
    }

    sheetContentScrollTop.current = Math.max(scrollEvent.detail.scrollTop ?? 0, 0)
  }

  const handleSheetContentScrollToUpper: CommonEventFunction = () => {
    sheetContentScrollTop.current = 0

    if (
      isSheetContentScrollable &&
      isSheetContentTouching.current &&
      isSheetContentMovingDown.current &&
      !isSheetContentDraggingSheet.current
    ) {
      startSheetContentDrag(lastSheetContentTouchY.current)
    }
  }

  const handleSheetContentRefresherPulling: CommonEventFunction = event => {
    const refresherEvent = event as typeof event & RefresherPullEventLike
    const pullDistance = Math.max(refresherEvent.detail?.dy ?? 0, 0)

    if (
      (!isSheetContentScrollable && !isSheetContentDraggingSheet.current) ||
      pullDistance < SHEET_PULL_TO_DRAG_THRESHOLD
    ) {
      return
    }

    sheetContentScrollTop.current = 0
    isSheetContentTouching.current = true
    isSheetContentMovingDown.current = true

    if (!isSheetContentDraggingSheet.current) {
      isSheetContentDraggingSheet.current = true
      setIsSheetContentDragMode(true)
      startY.current = 0
      startHeight.current = maxSheetHeight
    }

    const nextHeight = Math.max(MIN_SHEET_HEIGHT, maxSheetHeight - pullDistance)

    sheetHeightRef.current = nextHeight
    setSheetHeight(nextHeight)
  }

  const handleSheetContentRefresherEnd: CommonEventFunction = () => {
    if (!isSheetContentDraggingSheet.current) {
      return
    }

    finishSheetContentGesture()
  }

  const handlePrevMonth: CommonEventFunction = () => {
    setMonthTransitionDirection('prev')
    setViewMonth(currentMonth => addMonths(currentMonth, -1))
  }

  const handleNextMonth: CommonEventFunction = () => {
    setMonthTransitionDirection('next')
    setViewMonth(currentMonth => addMonths(currentMonth, 1))
  }

  const handleCalendarDayTap = (calendarDay: CalendarDay) => {
    setSelectedDate(calendarDay.date)

    if (calendarDay.isCurrentMonth) {
      return
    }

    setMonthTransitionDirection(
      getMonthOrder(calendarDay.date) < getMonthOrder(viewMonth) ? 'prev' : 'next'
    )
    setViewMonth(new Date(calendarDay.date.getFullYear(), calendarDay.date.getMonth(), 1))
  }

  const handleOpenClassSchedule = () => {
    Taro.navigateTo({ url: '/pages/schedule/class/index' })
  }

  const handleJumpToNearestCourse = () => {
    if (!nearestCourseDate) {
      Taro.showToast({ title: '暂无可跳转课程', icon: 'none' })
      return
    }

    setSelectedDate(nearestCourseDate)
    setMonthTransitionDirection(
      getMonthOrder(nearestCourseDate) < getMonthOrder(viewMonth) ? 'prev' : 'next'
    )
    setViewMonth(new Date(nearestCourseDate.getFullYear(), nearestCourseDate.getMonth(), 1))
  }

  const handleTabChange = (nextIndex: number) => {
    if (nextIndex === activeIndex) {
      return
    }

    if (navLabelTimer.current) {
      clearTimeout(navLabelTimer.current)
    }

    resetSheetContentGestureState()
    resetSheetContentScrollPosition()
    setActiveIndex(nextIndex)
    navLabelTimer.current = setTimeout(() => {
      setVisibleNavLabelIndex(nextIndex)
      navLabelTimer.current = null
    }, NAV_LABEL_SHOW_DELAY_MS)
  }

  const activeTab = TABS[activeIndex] ?? TABS[2]


  return (
    <View
      className='flex flex-col min-h-screen font-sans bg-[#f0f2f5] relative'
      style={{
        minHeight: `${windowInfo.windowHeight}px`
      }}
    >
      <View
        className='flex-none px-6 pb-2'
        style={{
          paddingTop: `${navTop}px`
        }}
      >
        <View
          className='flex items-center mb-6'
          style={{
            height: `${menuButtonRect.height}px`
          }}
        >
          <Image src={AppLogo} style={{
            width: `${navAvatarSize * 3}px`,
            height: `${navAvatarSize}px`
          }}
            className="object-cover"></Image>
          <View className='ml-3'>
            <Text className='block text-xs text-gray-500'>欢迎回来</Text>
            <Text className='block text-sm font-bold text-gray-900'>
              {userInfo ? userInfo.student_id : '江小航用户'}
            </Text>
          </View>
        </View>

        {/* 月份头部与操作 */}
        <View className='flex justify-between items-center mb-6'>
          <View className='flex items-center gap-3'>
            <Text
              key={`month-title-${monthAnimationKey}`}
              className={`home-month-title ${monthTransitionClass} text-3xl font-bold text-gray-900 tracking-wide`}
            >
              {monthTitle}
            </Text>
            <View className='flex gap-2 text-lg font-light items-center'>
              <View
                className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center'
                onTap={handlePrevMonth}
              >
                <MaterialIcons name="chevron-left" size={28} color="#2563EB" />
              </View>
              <View className='w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center'>
                <MaterialIcons name="local-florist" size={18} color="#10B981" />
              </View>
              <View
                className='w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center'
                onTap={handleNextMonth}
              >
                <MaterialIcons name="chevron-right" size={28} color="#2563EB" />
              </View>
            </View>
          </View>
          <View className='flex gap-3 text-xl flex-row items-center'>
            <View className='w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center'>
              <MaterialIcons
                name="public"
                size={24}
                color="#0891B2"
              />
            </View>
          </View>
        </View>

        {/* 日历网格头 */}
        <View className='grid grid-cols-7 text-center mb-4'>
          {WEEK_DAYS.map((day, index) => (
            <Text key={index} className='text-xs font-bold text-gray-900'>{day}</Text>
          ))}
        </View>

        {/* 日历日期 */}
        <View
          key={`calendar-${monthAnimationKey}`}
          className={`home-calendar-grid ${monthTransitionClass} grid grid-cols-7 text-center gap-y-4 mb-6`}
        >
          {calendarDays.map(date => {
            const isSelected = isSameDate(date.date, selectedDate)

            return (
              <View
                key={date.key}
                className='flex justify-center items-center h-8'
                onTap={() => handleCalendarDayTap(date)}
              >
              <View
                className={`w-8 h-8 rounded-full flex justify-center items-center ${isSelected
                    ? 'bg-white shadow-sm border border-gray-100'
                    : date.isToday
                      ? 'bg-gray-900'
                      : ''
                  }`}
              >
                <Text
                  className={`text-sm font-medium ${isSelected
                    ? 'text-gray-900 font-bold'
                    : date.isToday
                      ? 'text-white font-bold'
                    : date.isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                    }`}
                >
                  {date.day}
                </Text>
              </View>
            </View>
            )
          })}
        </View>
      </View>



      {/* 抽屉(可滚动) */}
      <View
        className='fixed left-0 right-0 bg-white rounded-t-[40px] z-20'
        style={{
          bottom: `${bottomNavHeight - 10}px`,
          height: `${sheetHeight}px`,
          transition: 'height .25s ease'
        }}
      >
        <View
          className='pt-3 pb-2'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <View className='flex justify-center'>
            <View className='w-12 h-1 bg-gray-300 rounded-full' />
          </View>
        </View>
        <View
          className='h-full'
          onTouchStart={handleSheetContentTouchStart}
          onTouchMove={handleSheetContentTouchMove}
          onTouchEnd={handleSheetContentTouchEnd}
          onTouchCancel={handleSheetContentTouchEnd}
        >
          <ScrollView
            key={`sheet-scroll-${activeTab.key}`}
            scrollY={canScrollSheetContent}
            scrollTop={sheetContentScrollTopValue}
            className='h-full'
            enhanced
            bounces={false}
            upperThreshold={SHEET_CONTENT_TOP_THRESHOLD}
            refresherEnabled={isSheetContentScrollable || isSheetContentDragMode}
            refresherDefaultStyle='none'
            refresherThreshold={SHEET_REFRESHER_THRESHOLD}
            refresherTriggered={false}
            showScrollbar={false}
            onScroll={handleSheetContentScroll}
            onScrollToUpper={handleSheetContentScrollToUpper}
            onRefresherPulling={handleSheetContentRefresherPulling}
            onRefresherRestore={handleSheetContentRefresherEnd}
            onRefresherAbort={handleSheetContentRefresherEnd}
            onRefresherRefresh={handleSheetContentRefresherEnd}
          >
            <View className='px-6 pb-10'>
              <View
                key={activeTab.key}
                className='home-sheet-panel'
              >
                <HomeSheetPanel
                  activeTab={activeTab.key}
                  schedules={scheduleGroups}
                  scheduleLoading={scheduleLoading}
                  scheduleError={scheduleError}
                  onScheduleRetry={loadHomeSchedule}
                  onOpenClassSchedule={handleOpenClassSchedule}
                  onJumpToNearestCourse={handleJumpToNearestCourse}
                  canJumpToNearestCourse={!!nearestCourseDate}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      <View
        className='fixed left-0 right-0 bottom-0 z-30 bg-white flex items-center justify-between rounded-t-2xl'
        style={{
          height: `${bottomNavHeight}px`,
          boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.15)'
        }}
      >   {TABS.map((t, i) => {
        const active = activeIndex === i
        return (
          <View
            key={t.key}
            onTap={() => handleTabChange(i)}
            className='flex items-center justify-center transition-all duration-300'
            style={{
              flex: active ? 3 : 1
            }}
          >

            {active ? (
              <View className='bg-black text-white rounded-full px-4 py-2 flex items-center gap-2 w-[80%] justify-center overflow-hidden'>
                <MaterialIcons name={t.icon} size={24} color='white' />
                {visibleNavLabelIndex === i && (
                  <Text className='text-xs whitespace-nowrap'>{t.label}</Text>
                )}
              </View>
            ) : (
              <View className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center'>
                <MaterialIcons name={t.icon} size={24} color='black' />
              </View>
            )}

          </View>
        )
      })}

      </View>
    </View>
  )
}
