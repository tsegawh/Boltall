import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/environment'
import authRoutes from './routes/auth'
import deviceRoutes from './routes/devices'
import subscriptionRoutes from './routes/subscriptions'
import subscriptionPlanRoutes from './routes/subscription-plans'
import paymentRoutes from './routes/payments'
import notificationRoutes from './routes/notifications'
import publicRoutes from './routes/public'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/devices', deviceRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/subscription-plans', subscriptionPlanRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/public', publicRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  })
})

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

const PORT = env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔗 API base URL: http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🏠 Home API: http://localhost:${PORT}/api/public`)
})

export default app