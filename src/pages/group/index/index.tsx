import { Image, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { jxhApi, type SchoolGroupItem } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

const SCHOOL_GROUP_IMAGE_BASE_URL = 'https://school.paditianxiu.cn/public/group/'

export default function SchoolGroupPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [groups, setGroups] = useState<SchoolGroupItem[]>([])

  const loadGroups = async () => {
    setLoading(true)
    setError('')

    try {
      setGroups(await jxhApi.getSchoolGroup())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '交流社群加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadGroups()
  })

  const getGroupImageUrl = (fileName: string) => `${SCHOOL_GROUP_IMAGE_BASE_URL}${fileName}`

  const previewGroupImage = (currentUrl: string) => {
    Taro.previewImage({
      current: currentUrl,
      urls: groups.map(group => getGroupImageUrl(group.file_name))
    })
  }

  return (
    <StandardPage title='交流社群' subtitle='交流学习心得与体会' actionText='刷新' onAction={loadGroups}>
      {loading ? (
        <LoadingState title='正在获取交流社群' />
      ) : error ? (
        <EmptyState title='交流社群加载失败' description={error} actionText='重试' onAction={loadGroups} />
      ) : groups.length === 0 ? (
        <EmptyState title='暂无交流社群' description='接口未返回交流社群信息' />
      ) : (
        <View className='flex flex-col gap-4'>
          {groups.map(group => {
            const imageUrl = getGroupImageUrl(group.file_name)

            return (
              <View key={group.id} className='rounded-2xl bg-white p-3'>
                <Text className='block text-sm font-bold text-gray-900 mb-3'>{group.title}</Text>
                <Image
                  src={imageUrl}
                  mode='widthFix'
                  className='w-full rounded-xl overflow-hidden'
                  onTap={() => previewGroupImage(imageUrl)}
                />
              </View>
            )
          })}
        </View>
      )}
    </StandardPage>
  )
}
