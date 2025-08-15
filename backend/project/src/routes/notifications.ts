import express from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { NotificationService } from '../services/notification'

const router = express.Router()

// Get user notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const limit = parseInt(req.query.limit as string) || 20

    const notifications = await NotificationService.getUserNotifications(userId, limit)

    res.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { notificationId } = req.params
    const userId = req.user!.id

    await NotificationService.markAsRead(notificationId, userId)

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    await NotificationService.markAllAsRead(userId)

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router