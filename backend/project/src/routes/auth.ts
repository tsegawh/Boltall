import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../config/database'
import { traccarAPI } from '../config/traccar'
import { env } from '../config/environment'
import { validateBody } from '../middleware/validation'

const router = express.Router()

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Get free subscription plan
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' }
    })

    if (!freePlan) {
      return res.status(500).json({ error: 'Free plan not available' })
    }

    // Create user in Traccar
    let traccarUserId = null
    try {
      const traccarUser = await traccarAPI.createUser({ name, email, password })
      traccarUserId = traccarUser.id
    } catch (error) {
      console.error('Failed to create Traccar user:', error)
      // Continue without Traccar user for now
    }

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        subscriptionId: freePlan.id,
        traccarUserId
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: {
          select: {
            name: true,
            deviceLimit: true,
            durationDays: true
          }
        }
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: {
          select: {
            name: true,
            deviceLimit: true,
            durationDays: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router