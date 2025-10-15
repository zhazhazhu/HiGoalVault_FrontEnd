const authToastContent: Partial<Record<keyof UniApp.AuthSetting, string>> = {
  'scope.record': '录音权限',
  'scope.camera': '相机权限',
  'scope.writePhotosAlbum': '相册权限',
  'scope.userInfo': '用户信息权限',
}

/**
 * 检查并请求 Uni-app (微信小程序) 中的权限
 * @returns {Promise<boolean>} 如果获得权限返回 true，否则返回 false
 */
export function checkPermission(key: keyof UniApp.AuthSetting): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const status = res.authSetting[key]

        if (status === true) {
          resolve(true)
        }
        else if (status === false) {
          uni.showModal({
            title: '授权提醒',
            content: `我们需要您的${authToastContent[key]}才能使用语音功能，请前往设置页面开启。`,
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting()
              }
              else {
                resolve(false)
              }
            },
          })
        }
        else {
          uni.authorize({
            scope: key,
            fail: () => {
              uni.showToast({
                title: '授权失败',
                icon: 'none',
              })
              resolve(false)
            },
          })
        }
      },
      fail: () => {
        console.error('获取设置失败')
        resolve(false)
      },
    })
  })
}
