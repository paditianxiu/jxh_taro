import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { jxhApi, type ScoreItem } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

const FILTER_ALL = '全部'

function parseScoreSemester(semester: string) {
  const normalized = semester.trim()
  const schoolYear = normalized.match(/\d{4}\s*[-~至]\s*\d{4}/)?.[0].replace(/\s/g, '') || '未知学年'
  const term = normalized.match(/第[一二三四五六七八九十\d]+学期|上学期|下学期/)?.[0] || '未知学期'

  return {
    schoolYear,
    term
  }
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export default function ScoresPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scores, setScores] = useState<ScoreItem[]>([])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(FILTER_ALL)
  const [selectedTerm, setSelectedTerm] = useState(FILTER_ALL)

  const loadScores = async () => {
    setLoading(true)
    setError('')

    try {
      setScores(await jxhApi.getScores())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '成绩加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadScores()
  })

  const schoolYears = useMemo(
    () => uniqueValues(scores.map(item => parseScoreSemester(item.semester).schoolYear)),
    [scores]
  )
  const terms = useMemo(
    () => uniqueValues(scores.map(item => parseScoreSemester(item.semester).term)),
    [scores]
  )
  const filteredScores = useMemo(
    () => scores.filter(item => {
      const semester = parseScoreSemester(item.semester)
      const matchesSchoolYear =
        selectedSchoolYear === FILTER_ALL || semester.schoolYear === selectedSchoolYear
      const matchesTerm = selectedTerm === FILTER_ALL || semester.term === selectedTerm

      return matchesSchoolYear && matchesTerm
    }),
    [scores, selectedSchoolYear, selectedTerm]
  )

  return (
    <StandardPage title='考试成绩' subtitle='课程成绩、学分与开课信息' actionText='刷新' onAction={loadScores}>
      {loading ? (
        <LoadingState title='正在获取成绩' />
      ) : error ? (
        <EmptyState title='成绩加载失败' description={error} actionText='重试' onAction={loadScores} />
      ) : scores.length === 0 ? (
        <EmptyState title='暂无成绩' description='教务系统暂未返回成绩数据' />
      ) : (
        <View className='flex flex-col gap-4'>
          <View className='rounded-2xl bg-white px-4 py-4'>
            <View className='flex items-center justify-between mb-3'>
              <Text className='text-sm font-bold text-gray-900'>筛选成绩</Text>
              <Text className='text-xs text-gray-400'>
                {filteredScores.length}/{scores.length} 门
              </Text>
            </View>

            <View className='mb-3'>
              <Text className='block text-xs font-bold text-gray-500 mb-2'>学年</Text>
              <View className='flex flex-row flex-wrap gap-2'>
                {[FILTER_ALL, ...schoolYears].map(year => {
                  const active = selectedSchoolYear === year

                  return (
                    <View
                      key={year}
                      className={`rounded-full px-3 py-2 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
                      onTap={() => setSelectedSchoolYear(year)}
                    >
                      <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-600'}`}>
                        {year}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>

            <View>
              <Text className='block text-xs font-bold text-gray-500 mb-2'>学期</Text>
              <View className='flex flex-row flex-wrap gap-2'>
                {[FILTER_ALL, ...terms].map(term => {
                  const active = selectedTerm === term

                  return (
                    <View
                      key={term}
                      className={`rounded-full px-3 py-2 ${active ? 'bg-gray-900' : 'bg-gray-100'}`}
                      onTap={() => setSelectedTerm(term)}
                    >
                      <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-600'}`}>
                        {term}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </View>

          {filteredScores.length === 0 ? (
            <EmptyState title='暂无匹配成绩' description='当前筛选条件下没有成绩记录' />
          ) : (
            <View className='flex flex-col gap-3'>
              {filteredScores.map((item, index) => (
                <View key={`${item.course_name}-${index}`} className='rounded-2xl bg-white px-4 py-4'>
                  <View className='flex items-start justify-between gap-3 mb-3'>
                    <View className='flex-1'>
                      <Text className='block text-base font-bold text-gray-900'>{item.course_name}</Text>
                      <Text className='text-xs text-gray-500'>{item.semester}</Text>
                    </View>
                    <View className='rounded-full bg-gray-900 px-3 py-1'>
                      <Text className='text-sm font-bold text-white'>{item.score}</Text>
                    </View>
                  </View>
                  <View className='grid grid-cols-2 gap-2'>
                    <Text className='text-xs text-gray-500'>学分：{item.credit || '-'}</Text>
                    <Text className='text-xs text-gray-500'>类型：{item.course_type || '-'}</Text>
                    <Text className='text-xs text-gray-500'>考试：{item.exam_type || '-'}</Text>
                    <Text className='text-xs text-gray-500'>教师：{item.teacher_name || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </StandardPage>
  )
}
