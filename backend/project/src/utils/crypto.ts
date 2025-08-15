import crypto from 'crypto'

export class CryptoUtils {
  /**
   * Generate RSA-SHA256 signature
   */
  static generateSignature(data: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(data, 'utf8')
    return sign.sign(privateKey, 'base64')
  }

  /**
   * Verify RSA-SHA256 signature
   */
  static verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(data, 'utf8')
      return verify.verify(publicKey, signature, 'base64')
    } catch (error) {
      console.error('Signature verification error:', error)
      return false
    }
  }

  /**
   * Generate MD5 hash
   */
  static generateMD5(data: string): string {
    return crypto.createHash('md5').update(data, 'utf8').digest('hex')
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length)
  }

  /**
   * Create signature string from object parameters
   */
  static createSignatureString(params: Record<string, any>, excludeKeys: string[] = ['signature']): string {
    const sortedKeys = Object.keys(params)
      .filter(key => !excludeKeys.includes(key) && params[key] !== undefined && params[key] !== null)
      .sort()

    return sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&')
  }
}