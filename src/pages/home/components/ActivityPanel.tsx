import { Text, View } from '@tarojs/components'
import { MaterialIcons } from 'taro-icons'

const featuredActivity = {
  tag: '本周精选',
  title: '校园歌手赛初选',
  time: '周三 18:30',
  place: '大学生活动中心',
  quota: '剩余 24 个名额'
}

const activityEntries = [
  {
    tag: '报名中',
    title: '校园歌手赛初选',
    time: '周三 18:30',
    place: '大学生活动中心',
    accent: '#10B981',
    surface: '#ECFDF5'
  },
  {
    tag: '讲座',
    title: '创新创业讲座',
    time: '周五 14:00',
    place: '图书馆报告厅',
    accent: '#2563EB',
    surface: '#EFF6FF'
  },
  {
    tag: '社团',
    title: '社团开放日',
    time: '周六 全天',
    place: '南区广场',
    accent: '#F97316',
    surface: '#FFF7ED'
  },
]

export default function ActivityPanel() {
  return (
    <View className='pb-2'>
      <View className='flex items-end justify-between mb-5'>
        <View>
          <Text className='block text-lg font-bold text-gray-900'>校园活动</Text>
          <Text className='text-xs text-gray-500'>近期可参与活动与报名提醒</Text>
        </View>

        <View className='flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50'>
          <MaterialIcons name='event-available' size={14} color='#059669' />
          <Text className='text-[10px] font-semibold text-emerald-700'>3 场</Text>
        </View>
      </View>

      <View className='rounded-lg bg-gray-900 px-4 py-4 mb-5'>
        <View className='flex items-center justify-between mb-5'>
          <Text className='text-[10px] font-semibold text-emerald-300'>
            {featuredActivity.tag}
          </Text>
          <Text className='text-[10px] text-gray-300'>
            {featuredActivity.quota}
          </Text>
        </View>

        <Text className='block text-xl font-bold text-white mb-3'>
          {featuredActivity.title}
        </Text>

        <View className='flex items-center gap-4'>
          <View className='flex items-center gap-1'>
            <MaterialIcons name='schedule' size={16} color='#D1D5DB' />
            <Text className='text-xs text-gray-300'>{featuredActivity.time}</Text>
          </View>

          <View className='flex items-center gap-1'>
            <MaterialIcons name='place' size={16} color='#D1D5DB' />
            <Text className='text-xs text-gray-300'>{featuredActivity.place}</Text>
          </View>
        </View>
      </View>

      <View className='flex items-center justify-between mb-3'>
        <Text className='text-sm font-bold text-gray-900'>活动日程</Text>
        <Text className='text-xs text-gray-400'>按时间排序</Text>
      </View>

      <View className='flex flex-col gap-3'>
        {activityEntries.map(entry => (
          <View
            key={entry.title}
            className='rounded-lg border border-gray-100 bg-white px-4 py-3'
          >
            <View className='flex items-center gap-3'>
              <View
                className='w-12 h-12 rounded-lg flex flex-col items-center justify-center'
                style={{
                  backgroundColor: entry.surface
                }}
              >
                <Text
                  className='text-[10px] font-bold'
                  style={{ color: entry.accent }}
                >
                  {entry.time.split(' ')[0]}
                </Text>
                <Text className='text-[10px] text-gray-500'>
                  {entry.time.split(' ')[1]}
                </Text>
              </View>

              <View className='flex-1'>
                <View className='flex items-center gap-2 mb-1'>
                  <Text
                    className='text-[10px] font-semibold px-2 py-1 rounded-full'
                    style={{
                      color: entry.accent,
                      backgroundColor: entry.surface
                    }}
                  >
                    {entry.tag}
                  </Text>
                  <Text className='text-sm font-semibold text-gray-900'>
                    {entry.title}
                  </Text>
                </View>

                <View className='flex items-center gap-1'>
                  <MaterialIcons name='place' size={15} color='#94A3B8' />
                  <Text className='text-xs text-gray-500'>
                    {entry.place}
                  </Text>
                </View>
              </View>

              <MaterialIcons name='chevron-right' size={22} color='#CBD5E1' />
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
