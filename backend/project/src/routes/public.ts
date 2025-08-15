import express from 'express'
import prisma from '../config/database'

const router = express.Router()

// Home page data
router.get('/', async (req, res) => {
  try {
    const stats = {
      totalUsers: await prisma.user.count(),
      totalDevices: await prisma.device.count({ where: { isActive: true } }),
      totalReports: await prisma.report.count({ where: { status: 'COMPLETED' } })
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        deviceLimit: true,
        features: true
      },
      orderBy: { price: 'asc' }
    })

    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }))

    res.json({
      message: 'Welcome to Traccar SaaS - GPS Tracking Made Simple',
      stats,
      plans: plansWithFeatures,
      features: [
        'Real-time GPS tracking',
        'Historical route playback',
        'Geofencing alerts',
        'Detailed reporting',
        'Multi-device management',
        'API integration'
      ]
    })
  } catch (error) {
    console.error('Error fetching home data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// About page
router.get('/about', (req, res) => {
  res.json({
    title: 'About Traccar SaaS',
    description: 'Professional GPS tracking solution built on top of the reliable Traccar platform.',
    mission: 'To provide affordable, scalable, and reliable GPS tracking services for businesses of all sizes.',
    features: [
      {
        title: 'Real-time Tracking',
        description: 'Monitor your vehicles and assets in real-time with precise GPS coordinates.'
      },
      {
        title: 'Historical Data',
        description: 'Access detailed historical data and generate comprehensive reports.'
      },
      {
        title: 'Flexible Plans',
        description: 'Choose from our flexible subscription plans that grow with your business.'
      },
      {
        title: 'API Integration',
        description: 'Integrate with your existing systems using our comprehensive REST API.'
      }
    ],
    team: {
      size: '10+ professionals',
      experience: '5+ years in GPS tracking',
      support: '24/7 customer support'
    }
  })
})

// Contact page
router.get('/contact', (req, res) => {
  res.json({
    title: 'Contact Us',
    description: 'Get in touch with our team for support, sales inquiries, or partnerships.',
    contacts: {
      sales: {
        email: 'sales@traccar-saas.com',
        phone: '+1-555-0123',
        hours: 'Monday-Friday, 9 AM - 6 PM EST'
      },
      support: {
        email: 'support@traccar-saas.com',
        phone: '+1-555-0124',
        hours: '24/7 support available'
      },
      general: {
        email: 'info@traccar-saas.com',
        address: '123 Business Ave, Tech City, TC 12345'
      }
    },
    social: {
      twitter: 'https://twitter.com/traccar-saas',
      linkedin: 'https://linkedin.com/company/traccar-saas',
      github: 'https://github.com/traccar-saas'
    }
  })
})

export default router