import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { DateTime } from 'luxon'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

const TOKEN_EXPIRY_HOURS = 1

export default class PasswordResetService {
  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex')
  }

  async requestReset(email: string): Promise<void> {
    const user = await User.findBy('email', email)

    // Always return success — do not reveal whether the email exists
    if (!user) return

    // Invalidate any existing unused tokens for this user
    await PasswordResetToken.query()
      .where('user_id', user.id)
      .whereNull('used_at')
      .delete()

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = this.hashToken(rawToken)
    const expiresAt = DateTime.now().plus({ hours: TOKEN_EXPIRY_HOURS })

    await PasswordResetToken.create({ userId: user.id, tokenHash, expiresAt })

    const appUrl = env.get('APP_URL') ?? 'http://localhost:5173'
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`

    // Log the link in dev so the flow can be tested without real SMTP
    logger.info('Password reset link for %s: %s', email, resetLink)

    // TODO: replace logger.info with mail dispatch once @adonisjs/mail is configured
    // await mail.send(new PasswordResetNotification(user, resetLink))
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken)

    const records = await PasswordResetToken.query()
      .where('token_hash', tokenHash)
      .whereNull('used_at')
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .preload('user')

    if (records.length === 0) {
      const err = new Error('Invalid or expired reset token')
      ;(err as any).code = 'E_INVALID_RESET_TOKEN'
      throw err
    }

    const record = records[0]

    // Timing-safe comparison (belt-and-suspenders on top of the DB query)
    const storedBuf = Buffer.from(record.tokenHash, 'hex')
    const providedBuf = Buffer.from(tokenHash, 'hex')
    if (storedBuf.length !== providedBuf.length || !timingSafeEqual(storedBuf, providedBuf)) {
      const err = new Error('Invalid or expired reset token')
      ;(err as any).code = 'E_INVALID_RESET_TOKEN'
      throw err
    }

    record.user.password = newPassword
    await record.user.save()

    record.usedAt = DateTime.now()
    await record.save()
  }
}
