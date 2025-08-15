import fs from 'fs'
import path from 'path'

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export class Logger {
  private static logDir = path.join(process.cwd(), 'logs')

  static {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : ''
    return `[${timestamp}] ${level}: ${message}${dataStr}`
  }

  private static writeToFile(filename: string, message: string): void {
    const filePath = path.join(this.logDir, filename)
    const logMessage = message + '\n'
    
    fs.appendFileSync(filePath, logMessage, 'utf8')
  }

  static error(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.ERROR, message, data)
    console.error(formattedMessage)
    this.writeToFile('error.log', formattedMessage)
  }

  static warn(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.WARN, message, data)
    console.warn(formattedMessage)
    this.writeToFile('app.log', formattedMessage)
  }

  static info(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data)
    console.info(formattedMessage)
    this.writeToFile('app.log', formattedMessage)
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage(LogLevel.DEBUG, message, data)
      console.debug(formattedMessage)
      this.writeToFile('debug.log', formattedMessage)
    }
  }

  static payment(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data)
    console.info(formattedMessage)
    this.writeToFile('payment.log', formattedMessage)
  }

  static cron(message: string, data?: any): void {
    const formattedMessage = this.formatMessage(LogLevel.INFO, message, data)
    console.info(formattedMessage)
    this.writeToFile('cron.log', formattedMessage)
  }
}