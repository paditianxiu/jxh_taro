import { Image, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { jxhApi } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

export default function CalendarPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>([])

  const loadCalendar = async () => {
    setLoading(true)
    setError('')

    try {
      setImages(await jxhApi.getSchoolCalendar())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '校历加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadCalendar()
  })

  const previewCalendarImage = (currentUrl: string) => {
    Taro.previewImage({
      current: currentUrl,
      urls: images
    })
  }

  return (
    <StandardPage title='江航校历' subtitle='学期安排与校历图片' actionText='刷新' onAction={loadCalendar}>
      {loading ? (
        <LoadingState title='正在获取校历' />
      ) : error ? (
        <EmptyState title='校历加载失败' description={error} actionText='重试' onAction={loadCalendar} />
      ) : images.length === 0 ? (
        <EmptyState title='暂无校历' description='接口未返回校历图片' />
      ) : (
        <View className='flex flex-col gap-4'>
          {images.map((url, index) => (
            <View key={url} className='rounded-2xl bg-white p-3'>
              <Text className='block text-sm font-bold text-gray-900 mb-3'>校历 {index + 1}</Text>
              <Image
                src={url}
                mode='widthFix'
                className='w-full rounded-xl overflow-hidden'
                onTap={() => previewCalendarImage(url)}
              />
            </View>
          ))}
        </View>
      )}
    </StandardPage>
  )
}
