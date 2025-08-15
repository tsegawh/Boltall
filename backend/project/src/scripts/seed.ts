import prisma from '../config/database'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create subscription plans
  const plans = [
    {
      name: 'Free',
      price: 0,
      deviceLimit: 1,
      durationDays: 365,
      features: JSON.stringify([
        'Real-time tracking',
        '1 device',
        'Basic reports',
        'Email support'
      ])
    },
    {
      name: 'Basic',
      price: 19.99,
      deviceLimit: 5,
      durationDays: 30,
      features: JSON.stringify([
        'Real-time tracking',
        'Up to 5 devices',
        'Advanced reports',
        'Geofencing (10 zones)',
        'Email & phone support',
        'API access'
      ])
    },
    {
      name: 'Premium',
      price: 49.99,
      deviceLimit: 25,
      durationDays: 30,
      features: JSON.stringify([
        'Real-time tracking',
        'Up to 25 devices',
        'Premium reports',
        'Unlimited geofencing',
        'Priority support',
        'Full API access',
        'Custom integrations',
        'Advanced analytics'
      ])
    }
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    })
  }

  console.log('✅ Database seeded successfully!')
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })