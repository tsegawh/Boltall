import express from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { validateBody } from '../middleware/validation'
import { Logger } from '../utils/logger'

const router = express.Router()

const createPlanSchema = z.object({
  name: z.string().min(1).max(50),
  price: z.number().min(0),
  deviceLimit: z.number().min(1),
  durationDays: z.number().min(1),
  features: z.array(z.string()).optional()
})

const updatePlanSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  price: z.number().min(0).optional(),
  deviceLimit: z.number().min(1).optional(),
  durationDays: z.number().min(1).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

// Get all subscription plans (public)
router.get('/', async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        durationDays: true,
        features: true,
        createdAt: true
      },
      orderBy: { price: 'asc' }
    })

    // Parse features JSON
    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }))

    res.json({ 
      success: true,
      plans: plansWithFeatures 
    })
  } catch (error) {
    Logger.error('Error fetching subscription plans', { error })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Get single subscription plan (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        durationDays: true,
        features: true,
        createdAt: true
      }
    })

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Subscription plan not found' 
      })
    }

    const planWithFeatures = {
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }

    res.json({ 
      success: true,
      plan: planWithFeatures 
    })
  } catch (error) {
    Logger.error('Error fetching subscription plan', { error, planId: req.params.id })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Create subscription plan (Admin only)
router.post('/', authenticateToken, requireAdmin, validateBody(createPlanSchema), async (req: AuthRequest, res) => {
  try {
    const { name, price, deviceLimit, durationDays, features = [] } = req.body

    // Check if plan name already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name }
    })

    if (existingPlan) {
      return res.status(400).json({ 
        success: false,
        error: 'Subscription plan with this name already exists' 
      })
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price,
        deviceLimit,
        durationDays,
        features: JSON.stringify(features)
      },
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        durationDays: true,
        features: true,
        isActive: true,
        createdAt: true
      }
    })

    const planWithFeatures = {
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }

    Logger.info('Subscription plan created', { 
      planId: plan.id, 
      planName: plan.name, 
      adminId: req.user!.id 
    })

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      plan: planWithFeatures
    })
  } catch (error) {
    Logger.error('Error creating subscription plan', { error, adminId: req.user?.id })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Update subscription plan (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateBody(updatePlanSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { name, price, deviceLimit, durationDays, features, isActive } = req.body

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return res.status(404).json({ 
        success: false,
        error: 'Subscription plan not found' 
      })
    }

    // Check if new name conflicts with existing plan
    if (name && name !== existingPlan.name) {
      const nameConflict = await prisma.subscriptionPlan.findUnique({
        where: { name }
      })

      if (nameConflict) {
        return res.status(400).json({ 
          success: false,
          error: 'Subscription plan with this name already exists' 
        })
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = price
    if (deviceLimit !== undefined) updateData.deviceLimit = deviceLimit
    if (durationDays !== undefined) updateData.durationDays = durationDays
    if (features !== undefined) updateData.features = JSON.stringify(features)
    if (isActive !== undefined) updateData.isActive = isActive

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        durationDays: true,
        features: true,
        isActive: true,
        updatedAt: true
      }
    })

    const planWithFeatures = {
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }

    Logger.info('Subscription plan updated', { 
      planId: plan.id, 
      planName: plan.name, 
      adminId: req.user!.id,
      changes: updateData
    })

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      plan: planWithFeatures
    })
  } catch (error) {
    Logger.error('Error updating subscription plan', { 
      error, 
      planId: req.params.id, 
      adminId: req.user?.id 
    })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Delete subscription plan (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        users: { select: { id: true } }
      }
    })

    if (!existingPlan) {
      return res.status(404).json({ 
        success: false,
        error: 'Subscription plan not found' 
      })
    }

    // Check if plan has active users
    if (existingPlan.users.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete subscription plan with active users. Please migrate users to another plan first.' 
      })
    }

    await prisma.subscriptionPlan.delete({
      where: { id }
    })

    Logger.info('Subscription plan deleted', { 
      planId: id, 
      planName: existingPlan.name, 
      adminId: req.user!.id 
    })

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    })
  } catch (error) {
    Logger.error('Error deleting subscription plan', { 
      error, 
      planId: req.params.id, 
      adminId: req.user?.id 
    })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Get subscription plan statistics (Admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        orders: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    })

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Subscription plan not found' 
      })
    }

    const stats = {
      totalUsers: plan.users.length,
      totalRevenue: plan.orders
        .filter(order => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + order.amount, 0),
      totalOrders: plan.orders.length,
      completedOrders: plan.orders.filter(order => order.status === 'COMPLETED').length,
      pendingOrders: plan.orders.filter(order => order.status === 'PENDING').length,
      recentUsers: plan.users.slice(-5),
      recentOrders: plan.orders.slice(-5)
    }

    res.json({ 
      success: true,
      plan: {
        ...plan,
        features: JSON.parse(plan.features || '[]')
      },
      stats 
    })
  } catch (error) {
    Logger.error('Error fetching subscription plan stats', { 
      error, 
      planId: req.params.id, 
      adminId: req.user?.id 
    })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

export default router