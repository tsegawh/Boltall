import cron from 'node-cron'
import { exec } from 'child_process'
import { Logger } from '../utils/logger'

// Run expiration check daily at 9:00 AM
cron.schedule('0 9 * * *', () => {
  Logger.cron('Starting daily expiration check')
  
  exec('npm run cron:expiration', (error, stdout, stderr) => {
    if (error) {
      Logger.error('Cron job failed', { error: error.message, stderr })
      return
    }
    
    Logger.cron('Expiration check completed', { stdout })
  })
}, {
  scheduled: true,
  timezone: "Africa/Addis_Ababa"
})

Logger.info('Cron jobs scheduled successfully')
console.log('🕒 Cron jobs are running...')
console.log('📅 Daily expiration check: 9:00 AM (Africa/Addis_Ababa)')

// Keep the process running
process.on('SIGINT', () => {
  Logger.info('Cron scheduler shutting down...')
  process.exit(0)
})