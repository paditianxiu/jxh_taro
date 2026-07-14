import CampusPanel from './CampusPanel'
import CampusNewsPanel from './CampusNewsPanel'
import HelpPanel from './HelpPanel'
import HomeSchedulePanel, { type ScheduleGroup } from './HomeSchedulePanel'
import ProfilePanel from './ProfilePanel'

export type HomeTabKey = 'home' | 'campus' | 'help' | 'news' | 'profile'

type HomeSheetPanelProps = {
  activeTab: HomeTabKey
  schedules: ScheduleGroup[]
  scheduleLoading?: boolean
  scheduleError?: string
  onScheduleRetry?: () => void
  onOpenClassSchedule?: () => void
  onJumpToNearestCourse?: () => void
  canJumpToNearestCourse?: boolean
}

export default function HomeSheetPanel({
  activeTab,
  schedules,
  scheduleLoading,
  scheduleError,
  onScheduleRetry,
  onOpenClassSchedule,
  onJumpToNearestCourse,
  canJumpToNearestCourse
}: HomeSheetPanelProps) {
  if (activeTab === 'campus') {
    return <CampusPanel />
  }

  if (activeTab === 'help') {
    return <HelpPanel />
  }

  if (activeTab === 'news') {
    return <CampusNewsPanel />
  }

  if (activeTab === 'profile') {
    return <ProfilePanel />
  }

  return (
    <HomeSchedulePanel
      schedules={schedules}
      loading={scheduleLoading}
      error={scheduleError}
      onRetry={onScheduleRetry}
      onOpenClassSchedule={onOpenClassSchedule}
      onJumpToNearestCourse={onJumpToNearestCourse}
      canJumpToNearestCourse={canJumpToNearestCourse}
    />
  )
}
