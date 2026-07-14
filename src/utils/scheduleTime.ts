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

export function getScheduleSectionEnd(sections: CourseSectionRange) {
  return sections[1] || sections[0]
}

export function getFuzhouCourseTimeRange(sections: CourseSectionRange) {
  const sectionEnd = getScheduleSectionEnd(sections)
  const startNode = FUZHOU_TIME_NODES[sections[0] - 1]
  const endNode = FUZHOU_TIME_NODES[sectionEnd - 1]

  if (!startNode || !endNode) {
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

export function getFuzhouDisplayTimeNodes(rowCount: number) {
  return Array.from({ length: rowCount }, (_, index) => (
    FUZHOU_TIME_NODES[index] || {
      id: index + 1,
      startTime: '-',
      endTime: '-'
    }
  ))
}
