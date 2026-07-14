import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MaterialIcons } from 'taro-icons'
import type { ReactNode } from 'react'

type StandardPageProps = {
  title: string
  subtitle?: string
  children: ReactNode
  actionText?: string
  onAction?: () => void
}

type StatusStateProps = {
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
}

type StandardPageLayout = {
  titleBarHeight: number
  titleBarTop: number
  titleBarContentHeight: number
  actionBottom: number
}

const DEFAULT_MENU_BUTTON_HEIGHT = 32
const DEFAULT_MENU_BUTTON_TOP = 24
const DEFAULT_SAFE_BOTTOM = 0

function getStandardPageLayout(): StandardPageLayout {
  try {
    const windowInfo = typeof Taro.getWindowInfo === 'function'
      ? Taro.getWindowInfo()
      : Taro.getSystemInfoSync()
    const menuButton = typeof Taro.getMenuButtonBoundingClientRect === 'function'
      ? Taro.getMenuButtonBoundingClientRect()
      : null
    const titleBarTop = menuButton?.top || windowInfo.statusBarHeight || DEFAULT_MENU_BUTTON_TOP
    const titleBarContentHeight = menuButton?.height || DEFAULT_MENU_BUTTON_HEIGHT
    const safeBottom = windowInfo.safeArea
      ? Math.max(windowInfo.screenHeight - windowInfo.safeArea.bottom, 0)
      : DEFAULT_SAFE_BOTTOM

    return {
      titleBarHeight: titleBarTop + titleBarContentHeight + 14,
      titleBarTop,
      titleBarContentHeight,
      actionBottom: safeBottom + 28
    }
  } catch {
    return {
      titleBarHeight: DEFAULT_MENU_BUTTON_TOP + DEFAULT_MENU_BUTTON_HEIGHT + 14,
      titleBarTop: DEFAULT_MENU_BUTTON_TOP,
      titleBarContentHeight: DEFAULT_MENU_BUTTON_HEIGHT,
      actionBottom: DEFAULT_SAFE_BOTTOM + 28
    }
  }
}

export function StandardPage({ title, subtitle, children, actionText, onAction }: StandardPageProps) {
  const layout = getStandardPageLayout()

  return (
    <View
      className='min-h-screen bg-[#f0f2f5] pb-8 font-sans'
      style={{ paddingTop: `${layout.titleBarHeight + 18}px` }}
    >
      <View
        className='fixed left-0 right-0 top-0 z-40 bg-[#f0f2f5] px-5 pb-3'
        style={{
          height: `${layout.titleBarHeight}px`,
          paddingTop: `${layout.titleBarTop}px`
        }}
      >
        <View
          className='flex items-center gap-3'
          style={{ height: `${layout.titleBarContentHeight}px` }}
        >
          <View
            className='w-10 h-10 rounded-full bg-white flex items-center justify-center'
            onTap={() => Taro.navigateBack()}
          >
            <MaterialIcons name='chevron-left' size={26} color='#111827' />
          </View>
          <View className='flex-1'>
            <Text className='block text-xl font-bold text-gray-900'>{title}</Text>
            {!!subtitle && <Text className='text-xs text-gray-500'>{subtitle}</Text>}
          </View>
        </View>
      </View>

      <View className='px-5'>
        {children}
      </View>

      {!!actionText && !!onAction && (
        <View
          className='standard-page-action-fab fixed z-50 rounded-full flex items-center justify-center'
          style={{
            right: '20px',
            bottom: `${layout.actionBottom}px`
          }}
          onTap={onAction}
        >
          <MaterialIcons name='cached' size={26} color='#111827' />
        </View>
      )}
    </View>
  )
}

export function LoadingState({ title = '加载中' }: { title?: string }) {
  return (
    <View className='rounded-2xl bg-white px-5 py-8 text-center'>
      <Text className='block text-sm font-semibold text-gray-900'>{title}</Text>
      <Text className='text-xs text-gray-400 mt-2'>正在同步校园数据</Text>
    </View>
  )
}

export function EmptyState({ title, description, actionText, onAction }: StatusStateProps) {
  return (
    <View className='rounded-2xl bg-white px-5 py-8 text-center'>
      <Text className='block text-base font-bold text-gray-900'>{title}</Text>
      {!!description && <Text className='block text-xs text-gray-500 mt-2 leading-relaxed'>{description}</Text>}
      {!!actionText && (
        <Button
          className='mt-5 rounded-full bg-black text-white text-sm font-bold px-7 py-2.5 border-0 min-w-[168rpx]'
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </View>
  )
}
