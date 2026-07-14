import { ScrollView, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import type { CommonEventFunction } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MaterialIcons } from 'taro-icons'
import { EmptyState, LoadingState } from '@/components/StandardPage'
import {
  jxhApi,
  type ScheduleCourse,
  type ScheduleData
} from '@/services/jxhApi'
import {
  getFuzhouCourseTimeRange,
  getFuzhouDisplayTimeNodes,
  getScheduleSectionEnd
} from '@/utils/scheduleTime'
import { getJxhShareMessage } from '@/utils/share'
import './index.css'

type SafeArea = {
  bottom: number
}

type DetailPageLayout = {
  titleBarHeight: number
  titleBarTop: number
  titleBarContentHeight: number
  safeBottom: number
  windowHeight: number
  windowWidth: number
}

type WeekDate = {
  month: number
  day: number
}

type DisplayCourse = ScheduleCourse & {
  blockKey: string
  color: string
  isGroup: boolean
  groupCount: number
  groupCourses?: ScheduleCourse[]
}

type RenderCourse = DisplayCourse & {
  displayName: string
  displayTeacher: string
  displayLocation: string
  isCurrentWeek: boolean
  nearestWeek: number
  weekDistance: number
}

type SwiperChangeEventLike = {
  detail?: {
    current?: number
  }
}

const WEEK_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const DEFAULT_MENU_BUTTON_HEIGHT = 32
const DEFAULT_MENU_BUTTON_TOP = 24
const DEFAULT_WINDOW_HEIGHT = 667
const DEFAULT_WINDOW_WIDTH = 375
const MODAL_ANIMATION_MS = 180
const MIN_ROW_HEIGHT_RPX = 96
const WEEK_TOOLBAR_HEIGHT_RPX = 88
const WEEK_TOOLBAR_MARGIN_BOTTOM_RPX = 14
const SUMMARY_CARD_HEIGHT_RPX = 162
const SUMMARY_CARD_MARGIN_BOTTOM_RPX = 14
const TIMETABLE_HEADER_HEIGHT_RPX = 92
const WEEK_PAGE_PADDING_BOTTOM_RPX = 28

const COLOR_PALETTE = [
  '#2563EB',
  '#059669',
  '#7C3AED',
  '#EA580C',
  '#0891B2',
  '#DC2626',
  '#4F46E5',
  '#16A34A',
  '#9333EA',
  '#0D9488'
]

function getDetailPageLayout(): DetailPageLayout {
  try {
    const windowInfo = typeof Taro.getWindowInfo === 'function'
      ? Taro.getWindowInfo()
      : Taro.getSystemInfoSync()
    const menuButton = typeof Taro.getMenuButtonBoundingClientRect === 'function'
      ? Taro.getMenuButtonBoundingClientRect()
      : null
    const titleBarTop = menuButton?.top || windowInfo.statusBarHeight || DEFAULT_MENU_BUTTON_TOP
    const titleBarContentHeight = menuButton?.height || DEFAULT_MENU_BUTTON_HEIGHT
    const safeArea = windowInfo.safeArea as SafeArea | undefined
    const safeBottom = safeArea
      ? Math.max(windowInfo.screenHeight - safeArea.bottom, 0)
      : 0

    return {
      titleBarHeight: titleBarTop + titleBarContentHeight + 14,
      titleBarTop,
      titleBarContentHeight,
      safeBottom,
      windowHeight: windowInfo.windowHeight || DEFAULT_WINDOW_HEIGHT,
      windowWidth: windowInfo.windowWidth || DEFAULT_WINDOW_WIDTH
    }
  } catch {
    return {
      titleBarHeight: DEFAULT_MENU_BUTTON_TOP + DEFAULT_MENU_BUTTON_HEIGHT + 14,
      titleBarTop: DEFAULT_MENU_BUTTON_TOP,
      titleBarContentHeight: DEFAULT_MENU_BUTTON_HEIGHT,
      safeBottom: 0,
      windowHeight: DEFAULT_WINDOW_HEIGHT,
      windowWidth: DEFAULT_WINDOW_WIDTH
    }
  }
}

function rpxToPx(value: number, windowWidth: number) {
  return (value * windowWidth) / 750
}

function pxToRpx(value: number, windowWidth: number) {
  return (value * 750) / windowWidth
}

function parseDateValue(value: string) {
  const matchedDate = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)

  if (!matchedDate) {
    return new Date(value)
  }

  return new Date(
    Number(matchedDate[1]),
    Number(matchedDate[2]) - 1,
    Number(matchedDate[3])
  )
}

function decodeParamValue(value?: string) {
  return value ? decodeURIComponent(value) : ''
}

function getCourseColor(seed: string) {
  const hash = Array.from(seed).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  )

  return COLOR_PALETTE[hash % COLOR_PALETTE.length]
}

function createCourseBlockKey(course: ScheduleCourse, index: number) {
  return [
    course.day,
    course.sections.join('-'),
    course.course_name,
    course.teacher,
    course.location,
    index
  ].join('|')
}

function normalizeCourseBlocks(schedule: ScheduleData | null): DisplayCourse[] {
  if (!schedule) {
    return []
  }

  return schedule.courses.map((courseBlock, index) => {
    if (!Array.isArray(courseBlock)) {
      const blockKey = createCourseBlockKey(courseBlock, index)

      return {
        ...courseBlock,
        blockKey,
        color: getCourseColor(blockKey),
        isGroup: false,
        groupCount: 1
      }
    }

    const [firstCourse] = courseBlock
    const weeks = Array.from(new Set(courseBlock.flatMap(course => course.weeks)))
      .sort((left, right) => left - right)
    const blockKey = createCourseBlockKey(firstCourse, index)

    return {
      ...firstCourse,
      weeks,
      blockKey,
      color: getCourseColor(blockKey),
      isGroup: true,
      groupCount: courseBlock.length,
      groupCourses: courseBlock
    }
  })
}

function getNearestWeekInfo(weeks: number[], currentWeek: number) {
  if (!weeks.length) {
    return {
      week: currentWeek,
      distance: Number.MAX_SAFE_INTEGER
    }
  }

  const [nearestWeek] = [...weeks].sort((left, right) => {
    const leftDistance = Math.abs(left - currentWeek)
    const rightDistance = Math.abs(right - currentWeek)

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance
    }

    if ((left >= currentWeek) !== (right >= currentWeek)) {
      return left >= currentWeek ? -1 : 1
    }

    return left - right
  })

  return {
    week: nearestWeek,
    distance: Math.abs(nearestWeek - currentWeek)
  }
}

function pickNearestCourse(course: DisplayCourse, currentWeek: number) {
  if (!course.isGroup || !course.groupCourses?.length) {
    return course
  }

  return [...course.groupCourses].sort((left, right) => {
    const leftInfo = getNearestWeekInfo(left.weeks, currentWeek)
    const rightInfo = getNearestWeekInfo(right.weeks, currentWeek)

    if (leftInfo.distance !== rightInfo.distance) {
      return leftInfo.distance - rightInfo.distance
    }

    if ((leftInfo.week >= currentWeek) !== (rightInfo.week >= currentWeek)) {
      return leftInfo.week >= currentWeek ? -1 : 1
    }

    return leftInfo.week - rightInfo.week
  })[0]
}

function createRenderCourse(course: DisplayCourse, currentWeek: number): RenderCourse {
  const nearestCourse = pickNearestCourse(course, currentWeek)
  const nearestWeekInfo = getNearestWeekInfo(nearestCourse.weeks, currentWeek)

  return {
    ...course,
    current_week: nearestCourse.current_week,
    day: nearestCourse.day,
    course_name: nearestCourse.course_name,
    location: nearestCourse.location,
    sections: nearestCourse.sections,
    teacher: nearestCourse.teacher,
    weeks: nearestCourse.weeks,
    displayName: nearestCourse.course_name || course.course_name,
    displayTeacher: nearestCourse.teacher || course.teacher || '-',
    displayLocation: nearestCourse.location || course.location || '地点待定',
    isCurrentWeek: nearestCourse.weeks.includes(currentWeek),
    nearestWeek: nearestWeekInfo.week,
    weekDistance: nearestWeekInfo.distance
  }
}

function isCourseOverlapped(left: RenderCourse, right: RenderCourse) {
  return (
    left.day === right.day &&
    left.sections[0] <= getSectionEnd(right) &&
    right.sections[0] <= getSectionEnd(left)
  )
}

function getRenderCourses(courses: DisplayCourse[], currentWeek: number) {
  const nearestCourses = courses
    .map(course => createRenderCourse(course, currentWeek))
    .sort((left, right) => {
      if (left.weekDistance !== right.weekDistance) {
        return left.weekDistance - right.weekDistance
      }

      if (left.isCurrentWeek !== right.isCurrentWeek) {
        return left.isCurrentWeek ? -1 : 1
      }

      if ((left.nearestWeek >= currentWeek) !== (right.nearestWeek >= currentWeek)) {
        return left.nearestWeek >= currentWeek ? -1 : 1
      }

      if (left.nearestWeek !== right.nearestWeek) {
        return left.nearestWeek - right.nearestWeek
      }

      return left.blockKey.localeCompare(right.blockKey)
    })

  const visibleCourses = nearestCourses.reduce<RenderCourse[]>((result, course) => {
    if (!result.some(item => isCourseOverlapped(item, course))) {
      result.push(course)
    }

    return result
  }, [])

  return visibleCourses
    .sort((left, right) => {
      if (left.day !== right.day) {
        return left.day - right.day
      }

      return left.sections[0] - right.sections[0]
    })
}

function getMaxWeek(schedule: ScheduleData | null) {
  if (!schedule) {
    return 1
  }

  const maxCourseWeek = schedule.courses
    .flatMap(courseBlock => Array.isArray(courseBlock) ? courseBlock : [courseBlock])
    .flatMap(course => course.weeks)
    .reduce((maxValue, week) => Math.max(maxValue, week), 1)

  return Math.max(maxCourseWeek, schedule.current_week || 1)
}

function getWeekDates(termStartDate: string, currentWeek: number): WeekDate[] {
  const termStart = parseDateValue(termStartDate)

  if (Number.isNaN(termStart.getTime())) {
    return []
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(termStart)
    date.setDate(termStart.getDate() + (currentWeek - 1) * 7 + index)

    return {
      month: date.getMonth() + 1,
      day: date.getDate()
    }
  })
}

function getWeekRangeText(weekDates: WeekDate[]) {
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]

  if (!firstDate || !lastDate) {
    return '-'
  }

  return `${firstDate.month}.${firstDate.day} - ${lastDate.month}.${lastDate.day}`
}

function getSectionEnd(course: ScheduleCourse) {
  return getScheduleSectionEnd(course.sections)
}

function getSectionDuration(course: ScheduleCourse) {
  return Math.max(getSectionEnd(course) - course.sections[0] + 1, 1)
}

function getCourseTimeText(course: ScheduleCourse) {
  return getFuzhouCourseTimeRange(course.sections).text
}

function getWeekRowCount(courses: RenderCourse[]) {
  return Math.max(
    8,
    courses.reduce((maxValue, course) => Math.max(maxValue, getSectionEnd(course)), 0)
  )
}

export default function ClassScheduleDetailPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const layout = getDetailPageLayout()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null)
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [title, setTitle] = useState('课表详情')
  const [subtitle, setSubtitle] = useState('按周查看班级课程')
  const [selectedCourse, setSelectedCourse] = useState<RenderCourse | null>(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const modalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadSchedule = async (nextPayload: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    setSelectedCourse(null)

    try {
      const nextSchedule = await jxhApi.getClassSchedule(nextPayload)

      setSchedule(nextSchedule)
      setCurrentWeek(nextSchedule.current_week || 1)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '课表加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(option => {
    const nextTitle = decodeParamValue(option.title)
    const nextSubtitle = decodeParamValue(option.subtitle)

    if (nextTitle) {
      setTitle(nextTitle)
    }

    if (nextSubtitle) {
      setSubtitle(nextSubtitle)
    }

    try {
      const nextPayload = JSON.parse(decodeParamValue(option.params))

      setPayload(nextPayload)
      void loadSchedule(nextPayload)
    } catch {
      setError('班级参数解析失败')
      setLoading(false)
    }
  })

  useEffect(() => {
    return () => {
      if (modalTimer.current) {
        clearTimeout(modalTimer.current)
      }
    }
  }, [])

  const courses = useMemo(() => normalizeCourseBlocks(schedule), [schedule])
  const maxWeek = useMemo(() => getMaxWeek(schedule), [schedule])
  const weekPages = useMemo(
    () => Array.from({ length: maxWeek }, (_, index) => index + 1),
    [maxWeek]
  )
  const toolbarOuterHeight = rpxToPx(
    WEEK_TOOLBAR_HEIGHT_RPX + WEEK_TOOLBAR_MARGIN_BOTTOM_RPX,
    layout.windowWidth
  )
  const swiperHeight = Math.max(
    layout.windowHeight - layout.titleBarHeight - layout.safeBottom - 18 - toolbarOuterHeight,
    420
  )
  const getRowHeight = (rowCount: number) => {
    const reservedHeight = rpxToPx(
      SUMMARY_CARD_HEIGHT_RPX +
      SUMMARY_CARD_MARGIN_BOTTOM_RPX +
      TIMETABLE_HEADER_HEIGHT_RPX +
      WEEK_PAGE_PADDING_BOTTOM_RPX,
      layout.windowWidth
    )
    const availableGridHeight = Math.max(swiperHeight - reservedHeight, 0)

    return Math.max(
      MIN_ROW_HEIGHT_RPX,
      Math.floor(pxToRpx(availableGridHeight / rowCount, layout.windowWidth))
    )
  }
  const currentWeekDates = useMemo(
    () => getWeekDates(schedule?.term_start_date || '', currentWeek),
    [schedule?.term_start_date, currentWeek]
  )

  const handleWeekChange: CommonEventFunction = event => {
    const swiperEvent = event as typeof event & SwiperChangeEventLike
    const nextIndex = swiperEvent.detail?.current

    if (typeof nextIndex !== 'number') {
      return
    }

    setSelectedCourse(null)
    setCurrentWeek(nextIndex + 1)
  }

  const refreshSchedule = () => {
    if (!payload) {
      return
    }

    void loadSchedule(payload)
  }

  const openCourseModal = (course: RenderCourse) => {
    if (modalTimer.current) {
      clearTimeout(modalTimer.current)
      modalTimer.current = null
    }

    setIsModalClosing(false)
    setSelectedCourse(course)
  }

  const closeCourseModal = () => {
    if (!selectedCourse || isModalClosing) {
      return
    }

    setIsModalClosing(true)
    modalTimer.current = setTimeout(() => {
      setSelectedCourse(null)
      setIsModalClosing(false)
      modalTimer.current = null
    }, MODAL_ANIMATION_MS)
  }

  const stopTap: CommonEventFunction = event => {
    event.stopPropagation()
  }

  const renderWeekPage = (week: number) => {
    const weekDates = getWeekDates(schedule?.term_start_date || '', week)
    const weekCourses = getRenderCourses(courses, week)
    const currentWeekCourseCount = weekCourses.filter(course => course.isCurrentWeek).length
    const rowCount = getWeekRowCount(weekCourses)
    const rowHeight = getRowHeight(rowCount)
    const timeNodes = getFuzhouDisplayTimeNodes(rowCount)
    const gridHeight = `${rowCount * rowHeight}rpx`
    const gridLineOffset = Math.max(rowHeight - 1, 1)
    const gridBackground = `linear-gradient(to bottom, transparent ${gridLineOffset}rpx, #eef2f7 ${gridLineOffset}rpx) 0 0 / 100% ${rowHeight}rpx`
    const coursesByDay = WEEK_LABELS.map((_, index) => (
      weekCourses.filter(course => course.day === index + 1)
    ))

    return (
      <ScrollView
        scrollY
        showScrollbar={false}
        className='class-detail-week-scroll'
        style={{ height: `${swiperHeight}px` }}
      >
        <View className='class-detail-week-page'>
          <View className='class-detail-week-content'>
            <View className='class-detail-summary-card'>
              <View>
                <Text className='class-detail-summary-title'>第{week}周</Text>
                <Text className='class-detail-summary-subtitle'>
                  {getWeekRangeText(weekDates)}
                </Text>
              </View>

              <View className='class-detail-summary-actions'>
                <View className='class-detail-count-pill'>
                  <Text>{currentWeekCourseCount}门课</Text>
                </View>
              </View>
            </View>

            <View className='class-detail-timetable-card'>
              <View className='class-detail-timetable-header'>
                <View className='class-detail-timetable-corner'>
                  <Text>节次</Text>
                </View>
                {WEEK_LABELS.map((label, index) => {
                  const date = weekDates[index]
                  const hasCurrentCourse = weekCourses.some(
                    course => course.day === index + 1 && course.isCurrentWeek
                  )

                  return (
                    <View
                      key={label}
                      className={`class-detail-timetable-day ${hasCurrentCourse ? 'class-detail-timetable-day-active' : ''}`}
                    >
                      <Text className='class-detail-timetable-week'>{label.replace('周', '')}</Text>
                      <Text className='class-detail-timetable-date'>
                        {date ? date.day : '-'}
                      </Text>
                    </View>
                  )
                })}
              </View>

              <View className='class-detail-timetable-body'>
                <View className='class-detail-time-axis'>
                  {timeNodes.map(node => (
                    <View
                      key={node.id}
                      className='class-detail-time-row'
                      style={{ height: `${rowHeight}rpx` }}
                    >
                      <Text className='class-detail-time-index'>
                        {node.id > 9 ? node.id : `0${node.id}`}
                      </Text>
                      <Text className='class-detail-time-range'>{node.startTime}</Text>
                      <Text className='class-detail-time-range'>{node.endTime}</Text>
                    </View>
                  ))}
                </View>

                <View
                  className='class-detail-grid-canvas'
                  style={{
                    height: gridHeight,
                    background: gridBackground
                  }}
                >
                  {coursesByDay.map((dayCourses, dayIndex) => (
                    <View
                      key={`${week}-${WEEK_LABELS[dayIndex]}`}
                      className='class-detail-grid-day-column'
                    >
                      {dayCourses.map((course, index) => (
                        <View
                          key={`${course.blockKey}-${week}-${index}`}
                          className='class-detail-grid-course'
                          style={{
                            top: `${(course.sections[0] - 1) * rowHeight}rpx`,
                            height: `${getSectionDuration(course) * rowHeight}rpx`
                          }}
                          onTap={() => openCourseModal(course)}
                        >
                          <View
                            className={`class-detail-grid-course-inner ${course.isCurrentWeek ? '' : 'class-detail-grid-course-inner-muted'}`}
                            style={course.isCurrentWeek ? { backgroundColor: course.color } : undefined}
                          >
                            <Text className='class-detail-grid-course-title'>
                              {course.displayName}
                            </Text>
                            <Text className='class-detail-grid-course-meta'>
                              {course.displayLocation}
                            </Text>
                            <Text className='class-detail-grid-course-meta'>
                              {course.displayTeacher}
                            </Text>

                            {course.isGroup && course.groupCount > 1 && (
                              <View className='class-detail-grid-course-count'>
                                <Text>{course.groupCount}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View
      className='class-detail-page'
      style={{
        paddingTop: `${layout.titleBarHeight + 18}px`,
        paddingBottom: `${layout.safeBottom}px`
      }}
    >
      <View
        className='class-detail-titlebar'
        style={{
          height: `${layout.titleBarHeight}px`,
          paddingTop: `${layout.titleBarTop}px`
        }}
      >
        <View
          className='class-detail-titlebar-content'
          style={{ height: `${layout.titleBarContentHeight}px` }}
        >
          <View
            className='class-detail-titlebar-back'
            onTap={() => Taro.navigateBack()}
          >
            <MaterialIcons name='chevron-left' size={26} color='#111827' />
          </View>

          <View className='class-detail-titlebar-main'>
            <Text className='class-detail-titlebar-title'>{title}</Text>
            <Text className='class-detail-titlebar-subtitle'>{subtitle}</Text>
          </View>

        </View>
      </View>

      <View className='class-detail-body'>
        {loading ? (
          <LoadingState title='正在获取班级课表' />
        ) : error ? (
          <EmptyState title='课表加载失败' description={error} actionText='重试' onAction={refreshSchedule} />
        ) : !schedule ? (
          <EmptyState title='暂无课表' description='未获取到班级课表数据' />
        ) : (
          <View className='class-detail-container'>
            <Swiper
              current={currentWeek - 1}
              className='class-detail-week-swiper'
              style={{ height: `${swiperHeight}px` }}
              onChange={handleWeekChange}
            >
              {weekPages.map(week => (
                <SwiperItem key={week}>
                  {renderWeekPage(week)}
                </SwiperItem>
              ))}
            </Swiper>
          </View>
        )}
      </View>

      <View
        className='class-detail-floating-actions'
        style={{ bottom: `${layout.safeBottom + 24}px` }}
      >
        <View className='class-detail-floating-action' onTap={refreshSchedule}>
          <MaterialIcons name='cached' size={24} color='#111827' />
        </View>
      </View>

      {!!selectedCourse && (
        <View
          className={`class-detail-modal-mask ${isModalClosing ? 'class-detail-modal-mask-leave' : 'class-detail-modal-mask-enter'}`}
          onTap={closeCourseModal}
        >
          <View
            className={`class-detail-modal-card ${isModalClosing ? 'class-detail-modal-card-leave' : 'class-detail-modal-card-enter'}`}
            onTap={stopTap}
          >
            <View className='class-detail-info-title-row'>
              <Text className='class-detail-info-title'>课程详情</Text>
              <View className='class-detail-modal-close' onTap={closeCourseModal}>
                <MaterialIcons name='close' size={20} color='#111827' />
              </View>
            </View>

            <View className='class-detail-info-row'>
              <Text className='class-detail-info-label'>课程名称</Text>
              <Text className='class-detail-info-value'>{selectedCourse.displayName}</Text>
            </View>
            <View className='class-detail-info-row'>
              <Text className='class-detail-info-label'>授课教师</Text>
              <Text className='class-detail-info-value'>{selectedCourse.displayTeacher}</Text>
            </View>
            <View className='class-detail-info-row'>
              <Text className='class-detail-info-label'>上课地点</Text>
              <Text className='class-detail-info-value'>{selectedCourse.displayLocation}</Text>
            </View>
            <View className='class-detail-info-row'>
              <Text className='class-detail-info-label'>上课时间</Text>
              <Text className='class-detail-info-value'>
                {WEEK_LABELS[selectedCourse.day - 1] || '-'} 第{selectedCourse.sections[0]}-{getSectionEnd(selectedCourse)}节 · {getCourseTimeText(selectedCourse)}
              </Text>
            </View>

            <Text className='class-detail-info-label block'>上课周次</Text>
            <View className='class-detail-week-tags'>
              {selectedCourse.weeks.map(week => (
                <Text
                  key={week}
                  className={`class-detail-week-tag ${week === currentWeek ? 'class-detail-current-week-tag' : ''}`}
                >
                  第{week}周
                </Text>
              ))}
            </View>

            {selectedCourse.isGroup && !!selectedCourse.groupCourses?.length && (
              <View className='class-detail-group-list'>
                <Text className='class-detail-info-title'>分组</Text>
                {selectedCourse.groupCourses.map((course, index) => (
                  <View
                    key={`${course.course_name}-${index}`}
                    className={`class-detail-group-item ${course.weeks.includes(currentWeek) ? 'class-detail-current-group' : ''}`}
                  >
                    <Text className='class-detail-group-title'>方案{index + 1}：{course.course_name}</Text>
                    <Text className='class-detail-group-text'>教师：{course.teacher || '-'}</Text>
                    <Text className='class-detail-group-text'>地点：{course.location || '-'}</Text>
                    <Text className='class-detail-group-text'>周次：第{course.weeks.join('、')}周</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
