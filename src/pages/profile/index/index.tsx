import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'
import { MaterialIcons } from 'taro-icons'
import { EmptyState, LoadingState, StandardPage } from '@/components/StandardPage'
import {
  clearSession,
  getStoredUser,
  isGuestSession,
  jxhApi,
  setStoredUser,
  type UserInfo
} from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'

type InfoField = {
  label: string
  value: string
  icon: string
  color: string
}

function getDisplayValue(value: string | undefined) {
  return value?.trim() || '-'
}

function createInfoFields(user: UserInfo): InfoField[] {
  return [
    {
      label: '学号',
      value: getDisplayValue(user.student_id),
      icon: 'confirmation-number',
      color: '#2563EB'
    },
    {
      label: '姓名',
      value: getDisplayValue(user.name),
      icon: 'person',
      color: '#111827'
    },
    {
      label: '性别',
      value: getDisplayValue(user.gender),
      icon: 'wc',
      color: '#0891B2'
    },
    {
      label: '学院',
      value: getDisplayValue(user.faculty),
      icon: 'school',
      color: '#7C3AED'
    },
    {
      label: '专业',
      value: getDisplayValue(user.major),
      icon: 'book',
      color: '#059669'
    },
    {
      label: '班级',
      value: getDisplayValue(user.class_name),
      icon: 'location-city',
      color: '#EA580C'
    }
  ]
}

function logout() {
  clearSession()
  Taro.redirectTo({ url: '/pages/index/index' })
}

export default function ProfilePage() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [loading, setLoading] = useState(() => !getStoredUser())
  const [error, setError] = useState('')
  const [user, setUser] = useState<UserInfo | null>(() => getStoredUser())
  const [guest, setGuest] = useState(() => isGuestSession())

  const loadProfile = async (forceRefresh = false) => {
    const cachedUser = getStoredUser()

    setGuest(isGuestSession())

    if (cachedUser && !forceRefresh) {
      setUser(cachedUser)
      setError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const currentUser = await jxhApi.getCurrentUser()

      setStoredUser(currentUser)
      setUser(currentUser)
      setGuest(isGuestSession())
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '个人信息加载失败')
      setUser(getStoredUser())
      setGuest(isGuestSession())
    } finally {
      setLoading(false)
    }
  }

  useLoad(() => {
    void loadProfile()
  })

  return (
    <StandardPage
      title='个人信息'
      subtitle='校园身份与基础资料'
      actionText='刷新'
      onAction={() => void loadProfile(true)}
    >
      {loading ? (
        <LoadingState title='正在获取个人信息' />
      ) : !user ? (
        <EmptyState title='暂无个人信息' description={error || '当前没有可展示的身份资料'} actionText='重试' onAction={loadProfile} />
      ) : (
        <View className='flex flex-col gap-4'>
          <View className='rounded-2xl bg-gray-900 px-5 py-5'>
            <View className='flex items-center gap-4'>
              <View className='w-14 h-14 rounded-full bg-white flex items-center justify-center'>
                <MaterialIcons name='person' size={30} color='#111827' />
              </View>

              <View className='flex-1'>
                <View className='flex items-center gap-2 mb-1'>
                  <Text className='text-xl font-bold text-white'>
                    {getDisplayValue(user.name)}
                  </Text>
                </View>
                <Text className='block text-xs text-gray-300'>
                  {getDisplayValue(user.faculty)}
                </Text>
                <Text className='block text-xs text-gray-300 mt-1'>
                  {getDisplayValue(user.major)} · {getDisplayValue(user.class_name)}
                </Text>
              </View>
            </View>


          </View>

          {!!error && (
            <View className='rounded-2xl bg-amber-50 px-4 py-3'>
              <Text className='text-xs text-amber-700 leading-relaxed'>
                本次刷新失败，当前显示本地已缓存的个人信息：{error}
              </Text>
            </View>
          )}

          <View>
            <Text className='block text-sm font-bold text-gray-900 mb-3'>基础资料</Text>
            <View className='grid grid-cols-2 gap-3'>
              {createInfoFields(user).map(field => (
                <View key={field.label} className='rounded-2xl bg-white px-4 py-4'>
                  <View className='flex flex-row items-center gap-2'>
                    <View className='w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center'>
                      <MaterialIcons name={field.icon} size={20} color={field.color} />
                    </View>
                    <Text className='text-xs text-gray-400 mt-1'>{field.label}</Text>
                  </View>
                  <Text className='text-sm font-bold text-gray-900'>{field.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='rounded-2xl bg-white px-5 py-4'>
            <Text className='block text-sm font-bold text-gray-900 mb-3'>账号状态</Text>
            <View className='flex items-center justify-between py-2'>
              <Text className='text-xs text-gray-500'>登录方式</Text>
              <Text className='text-sm font-bold text-gray-900'>{guest ? '游客登录' : '校园账号登录'}</Text>
            </View>
            <View className='h-px bg-gray-100 my-2' />
            <View className='flex items-center justify-between py-2'>
              <Text className='text-xs text-gray-500'>资料来源</Text>
              <Text className='text-sm font-bold text-gray-900'>{guest ? '演示数据' : '教务接口'}</Text>
            </View>
          </View>

          <View
            className='rounded-2xl bg-red-50 px-5 py-4 flex items-center justify-center gap-2'
            onTap={logout}
          >
            <MaterialIcons name='logout' size={20} color='#DC2626' />
            <Text className='text-sm font-bold text-red-600'>退出登录</Text>
          </View>
        </View>
      )}
    </StandardPage>
  )
}
