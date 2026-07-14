import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { getStoredUser, jxhApi, type AcademicExamItem, type LocalExamItem } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

export default function ExamsPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [academicExams, setAcademicExams] = useState<AcademicExamItem[]>([])
  const [localExams, setLocalExams] = useState<LocalExamItem[]>([])

  const loadExams = async () => {
    setLoading(true)
    setError('')

    try {
      const user = getStoredUser()
      const [academicData, localData] = await Promise.all([
        jxhApi.getAcademicExams(),
        user?.student_id ? jxhApi.getLocalExams(user.student_id) : Promise.resolve([])
      ])

      setAcademicExams(academicData)
      setLocalExams(localData)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '考试安排加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadExams()
  })

  return (
    <StandardPage title='考试安排' subtitle='教务考试与本地考场信息' actionText='刷新' onAction={loadExams}>
      {loading ? (
        <LoadingState title='正在获取考试安排' />
      ) : error ? (
        <EmptyState title='考试安排加载失败' description={error} actionText='重试' onAction={loadExams} />
      ) : (
        <View className='flex flex-col gap-5'>
          <View>
            <Text className='block text-sm font-bold text-gray-900 mb-3'>教务考试</Text>
            {academicExams.length === 0 ? (
              <EmptyState title='暂无教务考试' description='当前账号暂无考试安排' />
            ) : (
              <View className='flex flex-col gap-3'>
                {academicExams.map((item, index) => (
                  <View key={`${item.course_name}-${index}`} className='rounded-2xl bg-white px-4 py-4'>
                    <Text className='block text-base font-bold text-gray-900'>{item.course_name}</Text>
                    <Text className='block text-xs text-gray-500 mt-2'>时间：{item.exam_time || '-'}</Text>
                    <Text className='block text-xs text-gray-500 mt-1'>地点：{item.location || '-'}</Text>
                    <Text className='block text-xs text-gray-500 mt-1'>方式：{item.exam_method || '-'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View>
            <Text className='block text-sm font-bold text-gray-900 mb-3'>本地考试表</Text>
            {localExams.length === 0 ? (
              <EmptyState title='暂无本地考试记录' description='本地考试表未匹配到当前学号' />
            ) : (
              <View className='flex flex-col gap-3'>
                {localExams.map((item, index) => (
                  <View key={`${item.exam_name}-${index}`} className='rounded-2xl bg-white px-4 py-4'>
                    <View className='flex items-start justify-between gap-3'>
                      <View className='flex-1'>
                        <Text className='block text-base font-bold text-gray-900'>{item.exam_name}</Text>
                        <Text className='block text-xs text-gray-500 mt-2'>{item.exam_date} {item.exam_time}</Text>
                        <Text className='block text-xs text-gray-500 mt-1'>{item.exam_place}</Text>
                      </View>
                      <View className='rounded-full bg-blue-50 px-3 py-1'>
                        <Text className='text-xs font-bold text-blue-700'>{item.seat_number || '-'}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </StandardPage>
  )
}
