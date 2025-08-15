import express from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { TelebirrService } from '../services/telebirr'
import { NotificationService } from '../services/notification'
import { Logger } from '../utils/logger'
import { CryptoUtils } from '../utils/crypto'
import { env } from '../config/environment'
import { ORDER_STATUS, TELEBIRR_CONSTANTS } from '../config/constants'
const result = await initiatePayment(data
const router = express.Router()

const createOrderSchema = z.object({
  planId: z.string().min(1),
  returnUrl: z.string().url().optional()
})

const telebirrService = new TelebirrService()

// Create payment order
router.post('/create-order', authenticateToken, validateBody(createOrderSchema), async (req: AuthRequest, res) => {
  try {
    const { planId, returnUrl } = req.body
    const userId = req.user!.id

    // Get subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true }
    })

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Subscription plan not found' 
      })
    }

    // Check if user already has this plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (user?.subscription?.id === planId) {
      return res.status(400).json({ 
        success: false,
        error: 'You already have this subscription plan' 
      })
    }

    // Free plan doesn't require payment
    if (plan.price === 0) {
      // Update user subscription directly
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionId: planId,
          subscriptionExpiry: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
        }
      })

      await NotificationService.sendPaymentSuccess(userId, plan.name, 0)

      return res.json({
        success: true,
        message: 'Free plan activated successfully',
        requiresPayment: false
      })
    }

    // Create order for paid plans
    const order = await prisma.order.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        status: ORDER_STATUS.PENDING
      }
    })

    // Create Telebirr payment
    const paymentData = {
      merchantOrderId: order.id,
      amount: plan.price.toString(),
      subject: `${plan.name} Plan Subscription`,
      returnUrl: returnUrl || env.TELEBIRR_RETURN_URL
    }

    const paymentResult = await telebirrService.createPayment(paymentData)

    if (!paymentResult.success) {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: ORDER_STATUS.FAILED }
      })

      Logger.error('Telebirr payment creation failed', { 
        orderId: order.id, 
        userId, 
        error: paymentResult.error 
      })

      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment creation failed'
      })
    }

    // Update order with payment reference
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        paymentRef: paymentResult.data?.prepay_id,
        status: ORDER_STATUS.PROCESSING
      }
    })

    Logger.payment('Payment order created', { 
      orderId: order.id, 
      userId, 
      planId, 
      amount: plan.price,
      prepayId: paymentResult.data?.prepay_id
    })

    res.json({
      success: true,
      message: 'Payment order created successfully',
      requiresPayment: true,
      order: {
        id: order.id,
        amount: order.amount,
        plan: {
          name: plan.name,
          deviceLimit: plan.deviceLimit,
          durationDays: plan.durationDays
        }
      },
      payment: {
        checkoutUrl: paymentResult.data?.checkoutUrl,
        prepayId: paymentResult.data?.prepay_id
      }
    })
  } catch (error) {
    Logger.error('Error creating payment order', { error, userId: req.user?.id })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Telebirr payment notification webhook
router.post('/notify', async (req, res) => {
  try {
    Logger.payment('Telebirr notification received', { body: req.body })

    const {
      merchantOrderId,
      outTradeNo,
      totalAmount,
      currency,
      tradeStatus,
      signature,
      timestamp
    } = req.body

    // Verify signature
    const signatureData = CryptoUtils.createSignatureString(req.body, ['signature'])
    const isValidSignature = CryptoUtils.verifySignature(
      signatureData,
      signature,
      env.TELEBIRR_PUBLIC_KEY
    )

    if (!isValidSignature) {
      Logger.error('Invalid Telebirr signature', { body: req.body })
      return res.status(400).json({ 
        success: false,
        error: 'Invalid signature' 
      })
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: merchantOrderId },
      include: {
        user: true,
        plan: true
      }
    })

    if (!order) {
      Logger.error('Order not found for Telebirr notification', { merchantOrderId })
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      })
    }

    // Verify amount
    if (parseFloat(totalAmount) !== order.amount) {
      Logger.error('Amount mismatch in Telebirr notification', { 
        orderId: order.id,
        expectedAmount: order.amount,
        receivedAmount: totalAmount
      })
      return res.status(400).json({ 
        success: false,
        error: 'Amount mismatch' 
      })
    }

    // Process payment based on status
    if (tradeStatus === TELEBIRR_CONSTANTS.TRADE_STATUS.SUCCESS) {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: ORDER_STATUS.COMPLETED,
            paymentRef: outTradeNo
          }
        })

        // Update user subscription
        const expiryDate = new Date(Date.now() + order.plan.durationDays * 24 * 60 * 60 * 1000)
        await tx.user.update({
          where: { id: order.userId },
          data: {
            subscriptionId: order.planId,
            subscriptionExpiry: expiryDate
          }
        })
      })

      // Send success notification
      await NotificationService.sendPaymentSuccess(
        order.userId,
        order.plan.name,
        order.amount
      )

      Logger.payment('Payment completed successfully', { 
        orderId: order.id,
        userId: order.userId,
        planName: order.plan.name,
        amount: order.amount
      })

    } else if (tradeStatus === TELEBIRR_CONSTANTS.TRADE_STATUS.FAILED) {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: { status: ORDER_STATUS.FAILED }
      })

      // Send failure notification
      await NotificationService.sendPaymentFailed(
        order.userId,
        order.plan.name,
        order.amount
      )

      Logger.payment('Payment failed', { 
        orderId: order.id,
        userId: order.userId,
        tradeStatus
      })
    }

    res.json({ success: true })
  } catch (error) {
    Logger.error('Error processing Telebirr notification', { error, body: req.body })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Get user payment history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const skip = (page - 1) * limit

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          plan: {
            select: {
              name: true,
              deviceLimit: true,
              durationDays: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    Logger.error('Error fetching payment history', { error, userId: req.user?.id })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Get order details
router.get('/order/:orderId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user!.id

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId 
      },
      include: {
        plan: {
          select: {
            name: true,
            deviceLimit: true,
            durationDays: true,
            features: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Order not found' 
      })
    }

    const orderWithFeatures = {
      ...order,
      plan: {
        ...order.plan,
        features: JSON.parse(order.plan.features || '[]')
      }
    }

    res.json({ 
      success: true,
      order: orderWithFeatures 
    })
  } catch (error) {
    Logger.error('Error fetching order details', { 
      error, 
      orderId: req.params.orderId, 
      userId: req.user?.id 
    })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Cancel pending order
router.patch('/order/:orderId/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { orderId } = req.params
    const userId = req.user!.id

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId,
        status: ORDER_STATUS.PENDING
      }
    })

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Pending order not found' 
      })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.CANCELLED }
    })

    Logger.payment('Order cancelled by user', { orderId, userId })

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    })
  } catch (error) {
    Logger.error('Error cancelling order', { 
      error, 
      orderId: req.params.orderId, 
      userId: req.user?.id 
    })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

// Admin: Get all orders
router.get('/admin/orders', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // This would need admin middleware, but keeping simple for now
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const status = req.query.status as string
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && Object.values(ORDER_STATUS).includes(status as any)) {
      where.status = status
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          plan: {
            select: {
              name: true,
              price: true,
              deviceLimit: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    Logger.error('Error fetching admin orders', { error, userId: req.user?.id })
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
})

export default router