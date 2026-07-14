import { Text, View } from '@tarojs/components'
import { MaterialIcons } from 'taro-icons'

export type ScheduleItem = {
  timeStart: string
  timeEnd: string
  color: string
  title: string
  subtitle?: string
}

export type ScheduleGroup = {
  date: string
  items: ScheduleItem[]
}

type HomeSchedulePanelProps = {
  schedules: ScheduleGroup[]
  loading?: boolean
  error?: string
  onRetry?: () => void
  onOpenClassSchedule?: () => void
  onJumpToNearestCourse?: () => void
  canJumpToNearestCourse?: boolean
}

export default function HomeSchedulePanel({
  schedules,
  loading,
  error,
  onRetry,
  onOpenClassSchedule,
  onJumpToNearestCourse,
  canJumpToNearestCourse
}: HomeSchedulePanelProps) {
  if (loading) {
    return (
      <View className='rounded-xl bg-gray-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-gray-900'>正在同步今日课程</Text>
        <Text className='text-xs text-gray-500 mt-2'>从教务系统获取最新课表</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='rounded-xl bg-red-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-red-700'>课程加载失败</Text>
        <Text className='block text-xs text-red-500 mt-2'>{error}</Text>
        {!!onRetry && (
          <View
            className='inline-flex flex-row items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 mt-5'
            style={{
              minWidth: '180rpx',
              boxShadow: '0 10rpx 22rpx rgba(220, 38, 38, 0.12)'
            }}
            onTap={onRetry}
          >
            <MaterialIcons name='cached' size={17} color='#FFFFFF' />
            <Text className='text-xs font-bold text-white'>重试</Text>
          </View>
        )}
      </View>
    )
  }

  if (schedules.every(group => group.items.length === 0)) {
    const currentDateTitle = schedules[0]?.date || '当前日期'

    return (
      <View className='rounded-xl bg-gray-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-gray-900'>该日期暂无课程</Text>
        <Text className='block text-xs text-gray-500 mt-2'>{currentDateTitle}</Text>
        <Text className='text-xs text-gray-400 mt-1'>可以在校园页查看完整班级课表</Text>

        <View className='flex flex-row gap-3 mt-5'>
          {!!onOpenClassSchedule && (
            <View
              className='flex-1 rounded-full bg-gray-900 px-3 py-3 flex flex-row items-center justify-center gap-1'
              onTap={onOpenClassSchedule}
            >
              <MaterialIcons name='group' size={17} color='#FFFFFF' />
              <Text className='text-xs font-bold text-white'>班级课表</Text>
            </View>
          )}

          {!!onJumpToNearestCourse && (
            <View
              className={`flex-1 rounded-full px-3 py-3 flex flex-row items-center justify-center gap-1 ${canJumpToNearestCourse ? 'bg-white' : 'bg-gray-100'}`}
              onTap={onJumpToNearestCourse}
            >
              <MaterialIcons
                name='near-me'
                size={17}
                color={canJumpToNearestCourse ? '#111827' : '#9CA3AF'}
              />
              <Text className={`text-xs font-bold ${canJumpToNearestCourse ? 'text-gray-900' : 'text-gray-400'}`}>
                最近课程
              </Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <>
      {schedules.map((group, index) => (
        <View key={index} className='mb-8'>
          <View className='flex items-center gap-4 mb-4'>
            <Text className='text-xs font-bold text-gray-700'>
              {group.date}
            </Text>

            <View className='flex-1 h-px bg-gray-100' />
          </View>

          {group.items.map((item, i) => (
            <View
              key={i}
              className='flex gap-4 mb-5'
            >
              <View className='w-12 text-right'>
                <Text className='block text-xs text-gray-400'>
                  {item.timeStart}
                </Text>

                <Text className='block text-xs text-gray-400'>
                  {item.timeEnd}
                </Text>
              </View>

              <View className='pt-1'>
                <View
                  className={`w-3 h-3 rounded-full ${item.color}`}
                />
              </View>

              <View className='flex-1'>
                <Text className='block font-semibold'>
                  {item.title}
                </Text>

                {!!item.subtitle && (
                  <Text className='text-xs text-gray-500'>
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
    </>
  )
}
