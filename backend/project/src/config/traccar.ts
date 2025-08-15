import axios from 'axios'
import { env } from './environment'

export class TraccarAPI {
  private baseURL: string
  private auth: { username: string; password: string }

  constructor() {
    this.baseURL = env.TRACCAR_API_URL
    this.auth = {
      username: env.TRACCAR_USERNAME,
      password: env.TRACCAR_PASSWORD
    }
  }

  private get axiosConfig() {
    return {
      baseURL: this.baseURL,
      auth: this.auth,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  async createUser(userData: { name: string; email: string; password: string }) {
    try {
      const response = await axios.post('/users', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        administrator: false,
        readonly: false,
        disabled: false
      }, this.axiosConfig)
      
      return response.data
    } catch (error) {
      console.error('Error creating Traccar user:', error)
      throw new Error('Failed to create Traccar user')
    }
  }

  async createDevice(deviceData: { name: string; uniqueId: string }) {
    try {
      const response = await axios.post('/devices', {
        name: deviceData.name,
        uniqueId: deviceData.uniqueId,
        disabled: false
      }, this.axiosConfig)
      
      return response.data
    } catch (error) {
      console.error('Error creating Traccar device:', error)
      throw new Error('Failed to create Traccar device')
    }
  }

  async getDevicePosition(deviceId: number) {
    try {
      const response = await axios.get(`/positions?deviceId=${deviceId}`, this.axiosConfig)
      return response.data
    } catch (error) {
      console.error('Error fetching device position:', error)
      throw new Error('Failed to fetch device position')
    }
  }

  async generateReport(reportData: { 
    type: string; 
    deviceIds: number[]; 
    from: string; 
    to: string 
  }) {
    try {
      const response = await axios.post('/reports/route', reportData, this.axiosConfig)
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw new Error('Failed to generate report')
    }
  }
}

export const traccarAPI = new TraccarAPI()