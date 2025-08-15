import express from 'express'
import { z } from 'zod'
import prisma from '../config/database'
import { traccarAPI } from '../config/traccar'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { validateBody } from '../middleware/validation'

const router = express.Router()

const createDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  imei: z.string().min(15).max(15)
})

// Get user devices
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const devices = await prisma.device.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        name: true,
        imei: true,
        traccarDeviceId: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ devices })
  } catch (error) {
    console.error('Error fetching devices:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create device
router.post('/', authenticateToken, validateBody(createDeviceSchema), async (req: AuthRequest, res) => {
  try {
    const { name, imei } = req.body
    const userId = req.user!.id

    // Check user's subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        devices: { where: { isActive: true } }
      }
    })

    if (!user || !user.subscription) {
      return res.status(400).json({ error: 'User subscription not found' })
    }

    if (user.devices.length >= user.subscription.deviceLimit) {
      return res.status(400).json({ 
        error: `Device limit reached. Your ${user.subscription.name} plan allows ${user.subscription.deviceLimit} devices.`
      })
    }

    // Check if IMEI already exists
    const existingDevice = await prisma.device.findUnique({
      where: { imei }
    })

    if (existingDevice) {
      return res.status(400).json({ error: 'Device with this IMEI already exists' })
    }

    // Create device in Traccar
    let traccarDeviceId = null
    try {
      const traccarDevice = await traccarAPI.createDevice({ name, uniqueId: imei })
      traccarDeviceId = traccarDevice.id
    } catch (error) {
      console.error('Failed to create Traccar device:', error)
      // Continue without Traccar device for now
    }

    // Create device in our database
    const device = await prisma.device.create({
      data: {
        userId,
        name,
        imei,
        traccarDeviceId
      },
      select: {
        id: true,
        name: true,
        imei: true,
        traccarDeviceId: true,
        isActive: true,
        createdAt: true
      }
    })

    res.status(201).json({
      message: 'Device created successfully',
      device
    })
  } catch (error) {
    console.error('Error creating device:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get device position
router.get('/:deviceId/position', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { deviceId } = req.params
    const userId = req.user!.id

    // Verify device belongs to user
    const device = await prisma.device.findFirst({
      where: { id: deviceId, userId }
    })

    if (!device || !device.traccarDeviceId) {
      return res.status(404).json({ error: 'Device not found or not connected to Traccar' })
    }

    // Get position from Traccar
    const positions = await traccarAPI.getDevicePosition(device.traccarDeviceId)
    
    res.json({ positions })
  } catch (error) {
    console.error('Error fetching device position:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete device
router.delete('/:deviceId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { deviceId } = req.params
    const userId = req.user!.id

    // Verify device belongs to user and delete
    const device = await prisma.device.deleteMany({
      where: { id: deviceId, userId }
    })

    if (device.count === 0) {
      return res.status(404).json({ error: 'Device not found' })
    }

    res.json({ message: 'Device deleted successfully' })
  } catch (error) {
    console.error('Error deleting device:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router