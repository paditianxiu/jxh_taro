import type { ScheduleCourse } from '@/services/jxhApi'

export type CourseSectionRange = readonly [number, number]

export type ScheduleTimeNode = {
  id: number
  startTime: string
  endTime: string
}

export const FUZHOU_TIME_NODES: ScheduleTimeNode[] = [
  { id: 1, startTime: '09:00', endTime: '09:40' },
  { id: 2, startTime: '09:45', endTime: '10:25' },
  { id: 3, startTime: '10:35', endTime: '11:15' },
  { id: 4, startTime: '11:20', endTime: '12:00' },
  { id: 5, startTime: '13:30', endTime: '14:10' },
  { id: 6, startTime: '14:15', endTime: '14:55' },
  { id: 7, startTime: '15:05', endTime: '15:45' },
  { id: 8, startTime: '15:50', endTime: '16:30' }
]


export const NANCHANG_TIME_NODES_1: ScheduleTimeNode[] = [
  { id: 1, startTime: '08:15', endTime: '09:00' },
  { id: 2, startTime: '09:05', endTime: '09:50' },
  { id: 3, startTime: '10:05', endTime: '10:50' },
  { id: 4, startTime: '10:55', endTime: '11:40' },
  { id: 5, startTime: '14:05', endTime: '14:50' },
  { id: 6, startTime: '14:55', endTime: '15:40' },
  { id: 7, startTime: '15:55', endTime: '16:40' },
  { id: 8, startTime: '16:45', endTime: '17:30' }
]

export const NANCHANG_TIME_NODES_2: ScheduleTimeNode[] = [
  { id: 1, startTime: '08:15', endTime: '09:00' },
  { id: 2, startTime: '09:05', endTime: '09:50' },
  { id: 3, startTime: '10:05', endTime: '' },
  { id: 4, startTime: '', endTime: '11:30' },
  { id: 5, startTime: '14:05', endTime: '14:50' },
  { id: 6, startTime: '14:55', endTime: '15:40' },
  { id: 7, startTime: '15:55', endTime: '16:40' },
  { id: 8, startTime: '16:45', endTime: '17:30' }
]

export function getScheduleSectionEnd(sections: CourseSectionRange) {
  return sections[1] || sections[0]
}

export function getScheduleTimeNodes(campus: string, location = '') {
  if (campus === '南昌校区') {
    return /(?:^|[^\d])2号(?:教学)?楼/.test(location)
      ? NANCHANG_TIME_NODES_2
      : NANCHANG_TIME_NODES_1
  }

  return FUZHOU_TIME_NODES
}

export function getScheduleCourseTimeRange(
  sections: CourseSectionRange,
  campus: string,
  location = ''
) {
  const timeNodes = getScheduleTimeNodes(campus, location)
  const sectionEnd = getScheduleSectionEnd(sections)
  const startNode = timeNodes[sections[0] - 1]
  const endNode = timeNodes[sectionEnd - 1]

  if (!startNode?.startTime || !endNode?.endTime) {
    const fallbackText = `第${sections[0]}-${sectionEnd}节`

    return {
      timeStart: fallbackText,
      timeEnd: '',
      text: fallbackText
    }
  }

  return {
    timeStart: startNode.startTime,
    timeEnd: endNode.endTime,
    text: `${startNode.startTime}-${endNode.endTime}`
  }
}

export function getScheduleDisplayTimeNodes(
  rowCount: number,
  campus: string,
  courses: ReadonlyArray<Pick<ScheduleCourse, 'sections' | 'location'>> = []
) {
  const thirdAndFourthSectionCourse = courses.find(course => (
    course.sections[0] <= 3 &&
    getScheduleSectionEnd(course.sections) >= 4 &&
    /(?:^|[^\d])[12]号(?:教学)?楼/.test(course.location)
  ))
  const timeNodes = getScheduleTimeNodes(campus, thirdAndFourthSectionCourse?.location)

  return Array.from({ length: rowCount }, (_, index) => (
    timeNodes[index] || {
      id: index + 1,
      startTime: '-',
      endTime: '-'
    }
  ))
}
