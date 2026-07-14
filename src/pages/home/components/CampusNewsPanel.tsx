import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import { MaterialIcons } from 'taro-icons'
import CampusLogo from '@/assets/images/jh-home-logo.png'
import {
  jxhApi,
  type SchoolNewsCarouselItem,
  type SchoolNewsTimelineEntry
} from '@/services/jxhApi'

type NewsGroup = {
  publishedAt: string
  accent: string
  entries: SchoolNewsTimelineEntry[]
}

function createTimelineNewsGroups(entries: SchoolNewsTimelineEntry[]) {
  return entries.reduce<NewsGroup[]>((groups, entry) => {
    const group = groups.find(item => item.publishedAt === entry.publishedAt)

    if (group) {
      group.entries.push(entry)
      return groups
    }

    groups.push({
      publishedAt: entry.publishedAt,
      accent: entry.accent,
      entries: [entry]
    })

    return groups
  }, [])
}

export default function CampusNewsPanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [carouselItems, setCarouselItems] = useState<SchoolNewsCarouselItem[]>([])
  const [timelineNewsEntries, setTimelineNewsEntries] = useState<SchoolNewsTimelineEntry[]>([])
  const timelineNewsGroups = useMemo(
    () => createTimelineNewsGroups(timelineNewsEntries),
    [timelineNewsEntries]
  )

  const loadSchoolNews = async () => {
    setLoading(true)
    setError('')

    try {
      const newsData = await jxhApi.getSchoolNews()

      setCarouselItems(newsData.carouselItems)
      setTimelineNewsEntries(newsData.timelineNewsEntries)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '新闻加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSchoolNews()
  }, [])

  if (loading) {
    return (
      <View className='rounded-xl bg-gray-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-gray-900'>正在同步校园新闻</Text>
        <Text className='text-xs text-gray-500 mt-2'>从学校官网获取最新要闻</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='rounded-xl bg-red-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-red-700'>新闻加载失败</Text>
        <Text className='block text-xs text-red-500 mt-2'>{error}</Text>
        <View
          className='inline-flex flex-row items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 mt-5'
          onTap={loadSchoolNews}
        >
          <MaterialIcons name='cached' size={17} color='#FFFFFF' />
          <Text className='text-xs font-bold text-white'>重试</Text>
        </View>
      </View>
    )
  }

  if (carouselItems.length === 0 && timelineNewsEntries.length === 0) {
    return (
      <View className='rounded-xl bg-gray-50 px-4 py-6 text-center'>
        <Text className='block text-sm font-bold text-gray-900'>暂无校园新闻</Text>
        <Text className='text-xs text-gray-500 mt-2'>接口暂未返回新闻数据</Text>
      </View>
    )
  }

  return (
    <View className='campus-news-panel pb-4'>
      {carouselItems.length > 0 && (
        <Swiper
          className='swiper-wrapper mb-5'
          circular
          autoplay
          interval={3500}
          indicatorDots
          indicatorColor='rgba(255, 255, 255, 0.4)'
          indicatorActiveColor='#FFFFFF'
          style={{ height: '330rpx' }}
        >
          {carouselItems.map(item => (
            <SwiperItem key={item.id}>
              <View className='h-full px-3 py-5 relative'>
                <View
                  className='absolute left-10 right-8 top-9 bottom-3 rounded-xl'
                  style={{
                    backgroundColor: item.surface,
                    opacity: 0.22,
                    transform: 'rotate(-5deg)'
                  }}
                />
                <View
                  className='absolute left-8 right-10 top-7 bottom-4 rounded-xl'
                  style={{
                    backgroundColor: item.surface,
                    opacity: 0.36,
                    transform: 'rotate(4deg)'
                  }}
                />

                <View
                  className='swiper-slide h-full w-full px-5 py-4 relative rounded-xl overflow-hidden shadow-md'
                  style={{ backgroundColor: item.surface }}
                >
                  <View className='relative z-10 pr-20 flex flex-col justify-center h-full'>
                    <Text className='block text-xl font-semibold text-white leading-snug mb-2'>
                      {item.title}
                    </Text>
                    <Text className='text-sm text-white/80 leading-relaxed'>
                      {item.subtitle}
                    </Text>
                  </View>

                  <Image
                    src={CampusLogo}
                    mode='aspectFit'
                    className='absolute right-3 bottom-3 w-24 h-24 opacity-70'
                    style={{ width: '300rpx', height: '200rpx' }}
                  />
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      )}

      <View className='flex items-center justify-between mb-4'>
        <Text className='text-base font-semibold text-gray-900'>校园快讯</Text>
        <View
          className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center'
          onTap={loadSchoolNews}
        >
          <MaterialIcons name='cached' size={18} color='#111827' />
        </View>
      </View>

      <View className='flex flex-col'>
        {timelineNewsGroups.map((group, groupIndex) => (
          <View
            key={group.publishedAt}
            className='relative'
            style={{
              paddingBottom: groupIndex === timelineNewsGroups.length - 1 ? '0rpx' : '28rpx'
            }}
          >
            <View
              className='absolute w-px bg-gray-200'
              style={{
                left: '9rpx',
                top: 0,
                height: '17rpx',
                display: groupIndex === 0 ? 'none' : 'block'
              }}
            />
            <View
              className='absolute bottom-0 w-px bg-gray-200'
              style={{
                left: '9rpx',
                top: '17rpx',
                display: groupIndex === timelineNewsGroups.length - 1 ? 'none' : 'block'
              }}
            />

            <View
              className='flex items-center mb-2'
              style={{ height: '34rpx' }}
            >
              <View
                className='flex-none rounded-full border-2 border-white z-2'
                style={{
                  width: '18rpx',
                  height: '18rpx',
                  backgroundColor: group.accent,
                  marginRight: '10rpx'
                }}
              />
              <Text
                className='block font-semibold text-gray-500'
                style={{
                  height: '34rpx',
                  fontSize: '22rpx',
                  lineHeight: '34rpx'
                }}
              >
                {group.publishedAt}
              </Text>
            </View>

            <View
              style={{
                paddingLeft: '28rpx',
                boxSizing: 'border-box'
              }}
            >
              {group.entries.map((entry, entryIndex) => (
                <View
                  key={entry.id}
                  className='rounded-xl p-2'
                  style={{
                    backgroundColor: entry.surface,
                    minWidth: 0,
                    overflow: 'hidden',
                    marginBottom: entryIndex === group.entries.length - 1 ? '0rpx' : '20rpx'
                  }}
                >
                  <View
                    className='relative rounded-lg overflow-hidden bg-gray-100 mb-2'
                    style={{
                      width: '100%',
                      height: '220rpx'
                    }}
                  >
                    <Image
                      src={entry.thumbnail || CampusLogo}
                      mode='aspectFill'
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block'
                      }}
                    />
                    <View
                      className='absolute left-0 right-0 bottom-0 px-3 py-3'
                      style={{
                        background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.84) 100%)'
                      }}
                    >
                      <Text className='block text-sm font-bold text-white leading-snug'>
                        {entry.title}
                      </Text>
                    </View>
                  </View>

                  <Text className='block text-xs text-gray-600 leading-relaxed px-1 pb-1'>
                    {entry.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
