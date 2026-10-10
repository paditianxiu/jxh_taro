import { Input, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { getStoredUser, jxhApi, type ClassScheduleOption } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

function normalizeClassName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function prioritizeCurrentClass(options: ClassScheduleOption[], currentClassName: string) {
  const normalizedCurrentClass = normalizeClassName(currentClassName)

  if (!normalizedCurrentClass) {
    return options
  }

  const currentClassIndex = options.findIndex(
    option => normalizeClassName(option.class_name) === normalizedCurrentClass
  )

  if (currentClassIndex <= 0) {
    return options
  }

  return [
    options[currentClassIndex],
    ...options.slice(0, currentClassIndex),
    ...options.slice(currentClassIndex + 1)
  ]
}

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
  const [searchKeyword, setSearchKeyword] = useState('')

  const filteredOptions = useMemo(() => {
    const keyword = searchKeyword.trim().toLocaleLowerCase()

    if (!keyword) {
      return options
    }

    return options.filter(option => {
      const searchableText = [option.class_name, option.faculty, option.major]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()

      return searchableText.includes(keyword)
    })
  }, [options, searchKeyword])

  const loadOptions = async () => {
    setLoadingOptions(true)
    setOptionsError('')

    try {
      const nextOptions = await jxhApi.getClassScheduleOptions()
      const storedUser = getStoredUser()
      const nextCurrentClassName = storedUser?.class_name || ''

      setOptions(prioritizeCurrentClass(nextOptions, nextCurrentClassName))
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
          <View className='rounded-2xl bg-white px-4 py-3 mb-4'>
            <Input
              className='w-full text-sm text-gray-900'
              type='text'
              value={searchKeyword}
              placeholder='搜索班级名称、学院或专业'
              confirmType='search'
              onInput={event => setSearchKeyword(String(event.detail.value || ''))}
            />
          </View>
          <Text className='block text-sm font-bold text-gray-900 mb-3'>班级列表</Text>
          {options.length === 0 ? (
            <EmptyState title='暂无班级' description='教务系统未返回可查询班级' />
          ) : filteredOptions.length === 0 ? (
            <EmptyState title='没有找到匹配班级' description='换个关键词试试' />
          ) : (
            <View className='grid grid-cols-2 gap-3'>
              {filteredOptions.map(option => (
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
