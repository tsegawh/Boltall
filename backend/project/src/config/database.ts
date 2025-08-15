import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

export default prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})