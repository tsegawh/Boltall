import express from 'express'
import prisma from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        durationDays: true,
        features: true
      },
      orderBy: { price: 'asc' }
    })

    // Parse features JSON
    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }))

    res.json({ plans: plansWithFeatures })
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's current subscription
router.get('/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        subscription: true,
        devices: { where: { isActive: true } }
      }
    })

    if (!user || !user.subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    const subscription = {
      ...user.subscription,
      features: JSON.parse(user.subscription.features || '[]'),
      devicesUsed: user.devices.length
    }

    res.json({ subscription })
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router