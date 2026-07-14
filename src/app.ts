import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'

import './app.css'

import 'taro-icons/scss/MaterialIcons.scss'
import Taro from '@tarojs/taro'


function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    const updateManager = Taro.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) {
      }
    })
    updateManager.onUpdateReady(function () {
      Taro.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
    updateManager.onUpdateFailed(function () {
      Taro.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络设置',
        showCancel: false
      })
    })
  })

  return children
}



export default App
