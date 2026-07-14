import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import { jxhApi, type CampusCardInfo } from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

export default function CampusCardPage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState<CampusCardInfo | null>(null)

  const loadInfo = async () => {
    setLoading(true)
    setError('')

    try {
      setInfo(await jxhApi.getCampusCard())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '校园卡信息加载失败')
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadInfo()
  })

  return (
    <StandardPage title='校园卡' subtitle='账号、手机号与认证信息' actionText='刷新' onAction={loadInfo}>
      {loading ? (
        <LoadingState title='正在获取校园卡信息' />
      ) : error ? (
        <EmptyState title='校园卡信息加载失败' description={error} actionText='重试' onAction={loadInfo} />
      ) : !info ? (
        <EmptyState title='暂无校园卡信息' />
      ) : (
        <View className='rounded-2xl bg-white px-5 py-5'>
          <Text className='block text-xl font-bold text-gray-900 mb-1'>{info.name || '校园卡'}</Text>
          <Text className='block text-xs text-gray-500 mb-5'>开通日期：{info.activation_date || '-'}</Text>

          <View className='grid grid-cols-2 gap-3'>
            <View className='rounded-xl bg-gray-50 px-4 py-3'>
              <Text className='block text-xs text-gray-400 mb-1'>手机号</Text>
              <Text className='text-sm font-bold text-gray-900'>{info.phone_number || '-'}</Text>
            </View>
            <View className='rounded-xl bg-gray-50 px-4 py-3'>
              <Text className='block text-xs text-gray-400 mb-1'>账号</Text>
              <Text className='text-sm font-bold text-gray-900'>{info.encrypted_account || '-'}</Text>
            </View>
            <View className='rounded-xl bg-gray-50 px-4 py-3'>
              <Text className='block text-xs text-gray-400 mb-1'>年级</Text>
              <Text className='text-sm font-bold text-gray-900'>{info.grade || '-'}</Text>
            </View>
            <View className='rounded-xl bg-gray-50 px-4 py-3'>
              <Text className='block text-xs text-gray-400 mb-1'>密码</Text>
              <Text className='text-sm font-bold text-gray-900'>{info.password || '-'}</Text>
            </View>
          </View>

          {!!info.notification && (
            <View className='rounded-xl bg-blue-50 px-4 py-3 mt-4'>
              <Text className='text-xs text-blue-700'>{info.notification}</Text>
            </View>
          )}
        </View>
      )}
    </StandardPage>
  )
}
