export interface TelebirrConfig {
  appKey: string
  appSecret: string
  shortCode: string
  apiBaseUrl: string
  notifyUrl: string
  returnUrl: string
  publicKey: string
  privateKey: string
}

export interface FabricTokenRequest {
  appKey: string
}

export interface FabricTokenResponse {
  code: string
  msg: string
  data: {
    token: string
    expires_in: number
  }
}

export interface PreOrderRequest {
  merchantOrderId: string
  notifyUrl: string
  returnUrl: string
  amount: string
  shortCode: string
  subject: string
  outTradeNo: string
  timeoutExpress: string
  totalAmount: string
  receiveName: string
  signature: string
}

export interface PreOrderResponse {
  code: string
  msg: string
  data: {
    prepay_id: string
    raw_request: string
  }
}

export interface PaymentNotification {
  merchantOrderId: string
  outTradeNo: string
  totalAmount: string
  currency: string
  tradeStatus: string
  signature: string
  timestamp: string
}

export interface PaymentVerificationResult {
  isValid: boolean
  data?: PaymentNotification
}