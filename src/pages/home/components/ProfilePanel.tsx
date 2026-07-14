import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MaterialIcons } from 'taro-icons'
import { useEffect, useState } from 'react'
import {
  clearSession,
  getStoredUser,
  isGuestSession,
  jxhApi,
  setStoredUser,
  type UserInfo
} from '@/services/jxhApi'

type SettingEntry = {
  icon: string
  title: string
  subtitle: string
  url?: string
}

const settingEntries: SettingEntry[] = [
  {
    icon: 'whatshot',
    title: '个人信息',
    subtitle: '查看校园身份与基础资料',
    url: '/pages/profile/index/index'
  },
  { icon: 'notifications', title: '消息提醒', subtitle: '课程、活动与服务通知' },
  { icon: 'settings', title: '应用设置', subtitle: '偏好设置与隐私选项' },
]

function getDisplayValue(value: string | undefined) {
  return value?.trim() || '-'
}

function openSettingEntry(entry: SettingEntry) {
  if (entry.url) {
    Taro.navigateTo({ url: entry.url })
    return
  }

  Taro.showToast({ title: '功能建设中', icon: 'none' })
}

function logout() {
  clearSession()
  Taro.redirectTo({ url: '/pages/index/index' })
}

function createProfileFields(user: UserInfo | null) {
  return [
    { label: '学院', value: getDisplayValue(user?.faculty) },
    { label: '专业', value: getDisplayValue(user?.major) },
    { label: '班级', value: getDisplayValue(user?.class_name) },
    { label: '性别', value: getDisplayValue(user?.gender) },
  ]
}

export default function ProfilePanel() {
  const [user, setUser] = useState<UserInfo | null>(() => getStoredUser())
  const [loading, setLoading] = useState(false)
  const fields = createProfileFields(user)
  const isGuest = isGuestSession()

  useEffect(() => {
    if (user) {
      return
    }

    const loadUser = async () => {
      setLoading(true)

      try {
        const currentUser = await jxhApi.getCurrentUser()

        setStoredUser(currentUser)
        setUser(currentUser)
      } catch {
        setUser(getStoredUser())
      } finally {
        setLoading(false)
      }
    }

    void loadUser()
  }, [user])

  return (
    <View>
      <View className='rounded-2xl bg-gray-900 px-4 py-5 mb-4'>
        <View className='flex items-start gap-3'>
          <View className='w-12 h-12 rounded-full bg-white flex items-center justify-center'>
            <MaterialIcons name='person' size={26} color='#111827' />
          </View>

          <View className='flex-1'>
            <View className='flex items-center gap-2 mb-1'>
              <Text className='text-lg font-bold text-white'>
                {loading ? '正在同步' : getDisplayValue(user?.name)}
              </Text>

            </View>
            <Text className='block text-xs text-gray-300'>
              学号：{getDisplayValue(user?.student_id)}
            </Text>
            <Text className='block text-xs text-gray-300 mt-1'>
              {getDisplayValue(user?.faculty)} · {getDisplayValue(user?.class_name)}
            </Text>
          </View>
        </View>


      </View>

      <View className='grid grid-cols-2 gap-3 mb-4'>
        {fields.map(field => (
          <View key={field.label} className='rounded-xl bg-gray-50 px-4 py-3'>
            <Text className='block text-xs text-gray-400 mb-1'>{field.label}</Text>
            <Text className='text-sm font-bold text-gray-900'>{field.value}</Text>
          </View>
        ))}
      </View>

      <View className='flex flex-col gap-3'>
        {settingEntries.map(entry => (
          <View
            key={entry.title}
            className='flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3'
            onTap={() => openSettingEntry(entry)}
          >
            <View className='w-10 h-10 rounded-full bg-white flex items-center justify-center'>
              <MaterialIcons name={entry.icon} size={22} color='#111827' />
            </View>

            <View className='flex-1'>
              <Text className='block text-sm font-semibold text-gray-900'>
                {entry.title}
              </Text>
              <Text className='text-xs text-gray-500'>
                {entry.subtitle}
              </Text>
            </View>

            <MaterialIcons name='chevron-right' size={22} color='#CBD5E1' />
          </View>
        ))}
      </View>

      <View
        className='rounded-xl bg-red-50 px-4 py-3 mt-4 flex items-center justify-center gap-2'
        onTap={logout}
      >
        <MaterialIcons name='logout' size={20} color='#DC2626' />
        <Text className='text-sm font-bold text-red-600'>退出登录</Text>
      </View>
    </View>
  )
}
