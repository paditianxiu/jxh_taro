import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MaterialIcons } from 'taro-icons'

const serviceCards = [
  { icon: 'group', color: '#4F46E5', title: '班级课表', subtitle: '查询班级整体课程计划', url: '/pages/schedule/class/index' },
  { icon: 'style', color: '#059669', title: '考试成绩', subtitle: '查询学期成绩与学分', url: '/pages/scores/index/index' },
  { icon: 'edit', color: '#DC2626', title: '考试安排', subtitle: '查看考试时间与考场', url: '/pages/exams/index/index' },
  { icon: 'credit-card', color: '#0891B2', title: '校园卡', subtitle: '账号与认证信息', url: '/pages/campus-card/index/index' },
  { icon: 'map', color: '#0D9488', title: '江航地图', subtitle: '校园导航与建筑位置', url: '/pages/map/index/index' },
  { icon: 'date-range', color: '#7C3AED', title: '江航校历', subtitle: '学期安排与节假日信息', url: '/pages/calendar/index/index' },
  { icon: 'watch', color: '#c710ec', title: '交流社群', subtitle: '交流学习心得与体会', url: '/pages/group/index/index' },
]

type CardItem = {
  type: 'card' | 'banner'
  key: string
  data: {
    icon: string
    color: string
    title: string
    subtitle: string
    url: string
  }
}

function openServicePage(url: string) {
  Taro.navigateTo({ url })
}

export default function CampusPanel() {
  const renderCards = (): CardItem[] => {
    const result: CardItem[] = []

    for (let i = 0; i < serviceCards.length; i++) {
      if ([0, 3, 6].includes(i)) {
        result.push({
          type: 'banner',
          key: `banner-${i}`,
          data: serviceCards[i]
        })
      } else {
        result.push({
          type: 'card',
          key: serviceCards[i].title,
          data: serviceCards[i]
        })
      }
    }

    return result
  }

  const renderedItems = renderCards()

  return (
    <View>
      <View className='mb-5'>
        <Text className='block text-lg font-bold text-gray-900'>校园服务</Text>
        <Text className='text-xs text-gray-500'>常用校园能力集中入口</Text>
      </View>

      <View className='grid grid-cols-2 gap-3 mb-4'>
        {renderedItems.map(item => {
          if (item.type === 'banner') {
            return (
              <View
                key={item.key}
                className='rounded-xl bg-gray-900 px-4 py-4 col-span-2'
                onTap={() => openServicePage(item.data.url)}
              >
                <View className='flex items-center gap-3'>
                  <View className='w-10 h-10 rounded-full bg-white flex items-center justify-center'>
                    <MaterialIcons
                      name={item.data.icon}
                      size={22}
                      color={item.data.color}
                    />
                  </View>

                  <View className='flex-1'>
                    <Text className='block text-sm font-semibold text-white'>
                      {item.data.title}
                    </Text>
                    <Text className='text-xs text-gray-300'>
                      {item.data.subtitle}
                    </Text>
                  </View>

                  <MaterialIcons
                    name='chevron-right'
                    size={22}
                    color='#94A3B8'
                  />
                </View>
              </View>
            )
          }

          return (
            <View
              key={item.key}
              className='rounded-xl bg-gray-50 px-4 py-4'
              onTap={() => openServicePage(item.data.url)}
            >
              <View className='w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3'>
                <MaterialIcons
                  name={item.data.icon}
                  size={22}
                  color={item.data.color}
                />
              </View>
              <Text className='block text-sm font-semibold text-gray-900'>
                {item.data.title}
              </Text>
              <Text className='text-xs text-gray-500'>
                {item.data.subtitle}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
