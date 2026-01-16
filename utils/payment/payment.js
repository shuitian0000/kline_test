import { TEMPLATES } from './templates'

/**
 * 检查用户是否有付费权限访问特定功能
 * @param {Object} user - 用户对象
 * @param {string} feature - 功能标识，例如 'evolveDetail'
 * @returns {boolean}
 */
export function checkPremiumAccess(user, feature) {
  // 简单示例：user.premiumFeatures = ['evolveDetail', 'fullscreen']
  if (!user || !user.premiumFeatures) return false
  return user.premiumFeatures.includes(feature)
}

/**
 * 请求付费功能
 * @param {Object} user
 * @param {string} feature
 * @returns {Promise<boolean>} 付费成功返回 true
 */
export function requestPayment(user, feature) {
  return new Promise((resolve) => {
    // 微信支付接口调用示例
    wx.requestPayment({
      timeStamp: Date.now().toString(),
      nonceStr: Math.random().toString(36).substring(2),
      package: 'prepay_id=xxx',
      signType: 'MD5',
      paySign: 'mock_signature',
      success() {
        // 标记用户已开通功能
        if (!user.premiumFeatures) user.premiumFeatures = []
        user.premiumFeatures.push(feature)
        resolve(true)
      },
      fail() {
        resolve(false)
      }
    })
  })
}

/**
 * 检查并提示付费
 */
export function ensureAccess(user, feature) {
  if (!checkPremiumAccess(user, feature)) {
    wx.showModal({
      title: '付费功能',
      content: TEMPLATES[feature]?.text || '此功能需要开通会员',
      confirmText: '开通',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          const success = await requestPayment(user, feature)
          if (success) wx.showToast({ title: '开通成功', icon: 'success' })
        }
      }
    })
    return false
  }
  return true
}
