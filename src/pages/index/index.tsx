import { View, Image, Text, Input } from '@tarojs/components'
import './index.css'
import JhHomeLogo from "@/assets/images/jh-home-logo.png"
import Taro, { useDidShow } from '@tarojs/taro'
import { MaterialIcons } from 'taro-icons'
import { useState } from 'react'
import {
  clearSession,
  getStoredCookie,
  getStoredLoginForm,
  jxhApi,
  setGuestSession,
  setStoredCookie,
  setStoredLoginForm,
  setStoredUser
} from '@/services/jxhApi'
import { getJxhShareMessage } from '@/utils/share'


export default function Index() {
  Taro.useShareAppMessage(() => getJxhShareMessage())

  const [username, setUsername] = useState(() => getStoredLoginForm()?.username || '')
  const [password, setPassword] = useState(() => getStoredLoginForm()?.password || '')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(false)

  const checkStoredSession = async () => {
    if (!getStoredCookie()) {
      return
    }

    setCheckingSession(true)

    try {
      const user = await jxhApi.getCurrentUser()
      setStoredUser(user)
      Taro.redirectTo({ url: '/pages/home/index' })
    } catch {
      clearSession()
    } finally {
      setCheckingSession(false)
    }
  }

  useDidShow(() => {
    void checkStoredSession()
  })

  const handleLogin = async () => {
    if (loading || checkingSession) {
      return
    }

    if (!username.trim()) {
      Taro.showToast({ title: '请输入学号', icon: 'none' })
      return
    }

    if (!password) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    setLoading(true)

    try {
      const trimmedUsername = username.trim()
      const loginResult = await jxhApi.login(trimmedUsername, password)

      if (!loginResult.cookie) {
        throw new Error('登录未返回 cookie')
      }

      setStoredCookie(loginResult.cookie)
      setStoredLoginForm(trimmedUsername, password)

      try {
        const user = await jxhApi.getCurrentUser()
        setStoredUser(user)
      } catch {
        // 个人信息失败不阻断登录，进入个人信息页时会继续按需同步。
      }

      Taro.redirectTo({ url: '/pages/home/index' })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : '登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
    if (loading || checkingSession) {
      return
    }

    setGuestSession()
    Taro.redirectTo({ url: '/pages/home/index' })
  }


  const handleCopySafe = (text, successMsg = '复制成功') => {
    if (Taro.setClipboardData) {
      Taro.setClipboardData({
        data: text,
        success: () => {
          Taro.showToast({ title: successMsg, icon: 'success' });
        }
      });
    }
  }

  return (
    <View className='flex flex-col min-h-screen font-sans relative overflow-hidden' style={{ backgroundColor: '#000000' }}>
      {/* 顶部 Header 区域 */}
      <View className='flex-none pt-16 pb-10 px-6 text-center text-white relative z-10'>
        {/* 背景图片 */}
        <Image
          src={JhHomeLogo}
          className='absolute inset-0 w-full h-full z-0'
          mode='aspectFill'
          style={{ opacity: 0.15 }}
        />
        <Text className='text-xs font-semibold tracking-widest mb-4 opacity-90 block'>
          江小航
        </Text>
        <Text className='text-3xl font-bold mb-3 tracking-wide block'>
          欢迎回来
        </Text>
        <Text className='text-sm text-gray-200 px-6 leading-relaxed opacity-90 block'>
          请填写以下信息，以登录你的校园账户。
        </Text>
        {checkingSession && (
          <Text className='text-xs text-gray-200 mt-4 block opacity-80'>
            正在校验登录状态
          </Text>
        )}
      </View>
      {/* 底部白色表单面板 */}
      <View className='flex-1 bg-white rounded-t-[2.5rem] px-6 pt-6 pb-8 flex flex-col z-20'>
        {/* 登录/注册 切换器 */}
        <View className='flex bg-[#f3f4f6] p-1.5 rounded-full mb-6'>
          <View className='flex-1 py-3 text-sm font-bold rounded-full bg-white shadow-sm text-gray-900 text-center'>
            <Text className='block'>登录</Text>
          </View>
          <View className='flex-1 py-3 text-sm font-bold rounded-full text-gray-400 text-center'>
            <Text className='block'>关于</Text>
          </View>
        </View>
        {/* 表单输入区 */}
        <View className='flex flex-col gap-5'>
          {/* 账号输入框 */}
          <View>
            <Text className='block text-sm font-bold text-gray-900 mb-2 ml-1'>账号</Text>
            <View className='flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white'>
              <MaterialIcons name='security' color='#1f1f1f' />
              <Input
                className='flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium ml-3'
                type='text'
                placeholder='输入你的学号'
                value={username}
                onInput={event => setUsername(String(event.detail.value || ''))}
              />
            </View>
          </View>
          {/* 密码输入框 */}
          <View>
            <Text className='block text-sm font-bold text-gray-900 mb-2 ml-1'>密码</Text>
            <View className='flex items-center border border-gray-200 rounded-2xl px-4 py-3.5 bg-white'>
              <MaterialIcons name='fingerprint' color='#1f1f1f' />
              <Input
                className='flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium ml-3'
                type='text'
                password
                placeholder='输入你的密码'
                value={password}
                onInput={event => setPassword(String(event.detail.value || ''))}
              />
            </View>
          </View>
        </View>

        {/* 登录按钮 */}
        <View
          className='w-full rounded-2xl mt-8 mb-8 flex items-center justify-center'
          style={{
            height: '96rpx',
            backgroundColor: loading || checkingSession ? '#4B5563' : '#000000'
          }}
          onTap={handleLogin}
        >
          <Text className='text-white font-bold text-sm'>
            {checkingSession ? '校验中' : loading ? '登录中' : '登录'}
          </Text>
        </View>

        <View
          className='w-full rounded-2xl mb-8 flex items-center justify-center border border-gray-200 bg-white'
          style={{
            height: '92rpx'
          }}
          onTap={handleGuestLogin}
        >
          <MaterialIcons name='person' color='#111827' />
          <Text className='text-gray-900 font-bold text-sm ml-2'>游客登录</Text>
        </View>

        {/* 分割线 */}
        <View className='flex items-center gap-3 mb-6'>
          <View className='flex-1 h-px bg-gray-200'></View>
          <Text className='text-xs font-semibold text-gray-800'>勤勇达智 · 力行博艺</Text>
          <View className='flex-1 h-px bg-gray-200'></View>
        </View>

        {/* 联系方式 */}
        <View className='grid grid-cols-2 gap-4'>
          <View
            className='flex items-center justify-center gap-2 bg-[#f9fafb] py-3.5 rounded-2xl border border-gray-100'
            onClick={() => {
              handleCopySafe("3373587110", "QQ号复制成功")
            }}
          >
            <MaterialIcons name='email' color='#1f1f1f' />
            <Text className='text-sm font-bold text-gray-800'>联系作者</Text>
          </View>
          <View
            className='flex items-center justify-center gap-2 bg-[#f9fafb] py-3.5 rounded-2xl border border-gray-100'
            onClick={() => {
              handleCopySafe("376622375", "QQ群号复制成功")
            }}
          >
            <MaterialIcons name='group' color='#1f1f1f' />
            <Text className='text-sm font-bold text-gray-800'>交流群</Text>
          </View>
        </View>

        {/* 底部版权信息 */}
        <View className='text-center mt-auto pt-8 text-sm font-medium text-gray-600'>
          <Text>© 2026 Paditianxiu. All rights reserved.</Text>
          <View className='mt-1'>
            <Text className='text-xs text-gray-400'>Designed with ❤️ by </Text>
            <Text className='text-xs font-bold text-[#0b4d5a]'>©帕帝天秀</Text>
          </View>
        </View>

      </View>
    </View>
  )
}
