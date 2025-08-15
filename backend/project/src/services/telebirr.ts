import axios from 'axios'
import { env } from '../config/environment'

export class TelebirrService {
  private apiBaseUrl = env.TELEBIRR_API_BASE_URL
  private appKey = env.TELEBIRR_APP_KEY
  private appSecret = env.TELEBIRR_APP_SECRET
  private shortCode = env.TELEBIRR_SHORT_CODE
  private notifyUrl = env.TELEBIRR_NOTIFY_URL
  private returnUrl = env.TELEBIRR_RETURN_URL

  constructor() {
    // initialize anything if needed
  }

  async createPayment(data: { merchantOrderId: string; amount: string; subject: string; returnUrl: string }) {
    try {
      // Build payload according to Telebirr API
      const payload = {
        appKey: this.appKey,
        shortCode: this.shortCode,
        notifyUrl: this.notifyUrl,
        returnUrl: data.returnUrl || this.returnUrl,
        merchantOrderId: data.merchantOrderId,
        amount: data.amount,
        subject: data.subject,
        // ... other required fields or signature
      }

      // Example POST request to Telebirr (adjust URL and headers as needed)
      const response = await axios.post(`${this.apiBaseUrl}/payment/initiate`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'App-Key': this.appKey,
          'App-Secret': this.appSecret
        }
      })

      return { success: true, data: response.data }
    } catch (error: any) {
      return { success: false, error: error.message || 'Payment initiation failed' }
    }
  }
}