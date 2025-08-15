import prisma from '../config/database'

export interface NotificationData {
  userId: string
  type: 'SUBSCRIPTION_EXPIRY_WARNING' | 'SUBSCRIPTION_EXPIRED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'DEVICE_LIMIT_EXCEEDED'
  title: string
  message: string
  data?: Record<string, any>
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createNotification(notificationData: NotificationData): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data ? JSON.stringify(notificationData.data) : null
        }
      })
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  /**
   * Send subscription expiry warning
   */
  static async sendExpiryWarning(userId: string, daysLeft: number, planName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'SUBSCRIPTION_EXPIRY_WARNING',
      title: 'Subscription Expiring Soon',
      message: `Your ${planName} subscription will expire in ${daysLeft} days. Please renew to continue using all features.`,
      data: { daysLeft, planName }
    })
  }

  /**
   * Send subscription expired notification
   */
  static async sendSubscriptionExpired(userId: string, planName: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'SUBSCRIPTION_EXPIRED',
      title: 'Subscription Expired',
      message: `Your ${planName} subscription has expired. You have been moved to the Free plan.`,
      data: { planName }
    })
  }

  /**
   * Send payment success notification
   */
  static async sendPaymentSuccess(userId: string, planName: string, amount: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Your payment of ${amount} ETB for ${planName} plan has been processed successfully.`,
      data: { planName, amount }
    })
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailed(userId: string, planName: string, amount: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: `Your payment of ${amount} ETB for ${planName} plan could not be processed. Please try again.`,
      data: { planName, amount }
    })
  }

  /**
   * Send device limit exceeded notification
   */
  static async sendDeviceLimitExceeded(userId: string, currentLimit: number): Promise<void> {
    await this.createNotification({
      userId,
      type: 'DEVICE_LIMIT_EXCEEDED',
      title: 'Device Limit Exceeded',
      message: `You have exceeded your device limit of ${currentLimit}. Some devices have been disabled. Please upgrade your plan.`,
      data: { currentLimit }
    })
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit: number = 20) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    })
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }
}