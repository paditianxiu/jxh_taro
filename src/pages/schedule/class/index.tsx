import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { jxhApi, type ClassScheduleOption } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

function openScheduleDetail(option: ClassScheduleOption) {
  const params = encodeURIComponent(JSON.stringify(option.payload))
  const title = encodeURIComponent(option.class_name)
  const subtitle = encodeURIComponent(`${option.faculty} · ${option.major || '-'}`)

  Taro.navigateTo({
    url: `/pages/schedule/class/detail/index?params=${params}&title=${title}&subtitle=${subtitle}`
  })
}

export default function ClassSchedulePage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loadingOptions, setLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [options, setOptions] = useState<ClassScheduleOption[]>([])

  const loadOptions = async () => {
    setLoadingOptions(true)
    setOptionsError('')

    try {
      const nextOptions = await jxhApi.getClassScheduleOptions()
      setOptions(nextOptions)
    } catch (requestError) {
      setOptionsError(requestError instanceof Error ? requestError.message : '班级列表加载失败')
    } finally {
      setLoadingOptions(false)
    }
  }

  useLoad(() => {
    void loadOptions()
  })

  return (
    <StandardPage title='班级课表' subtitle='选择班级后查看完整课程安排' actionText='刷新' onAction={loadOptions}>
      {loadingOptions ? (
        <LoadingState title='正在获取班级列表' />
      ) : optionsError && options.length === 0 ? (
        <EmptyState title='班级列表加载失败' description={optionsError} actionText='重试' onAction={loadOptions} />
      ) : (
        <View>
          <Text className='block text-sm font-bold text-gray-900 mb-3'>班级列表</Text>
          {options.length === 0 ? (
            <EmptyState title='暂无班级' description='教务系统未返回可查询班级' />
          ) : (
            <View className='grid grid-cols-2 gap-3'>
              {options.slice(0, 30).map(option => (
                <View
                  key={`${option.faculty}-${option.class_name}`}
                  className='rounded-2xl bg-white px-3 py-4 min-h-[170rpx]'
                  onTap={() => openScheduleDetail(option)}
                >
                  <Text className='block text-sm font-bold leading-snug text-gray-900'>
                    {option.class_name}
                  </Text>
                  <Text className='block text-xs mt-2 leading-relaxed text-gray-500'>
                    {option.faculty}
                  </Text>
                  <Text className='block text-xs mt-1 leading-relaxed text-gray-400'>
                    {option.major || '-'} · {option.student_count || '-'}人
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </StandardPage>
  )
}
