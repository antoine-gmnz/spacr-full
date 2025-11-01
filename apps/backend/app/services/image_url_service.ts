import crypto from 'crypto'
import type { EsaImageType } from '#models/optimized_esa_image'

export default class ImageUrlService {
  private static readonly BASE_URLS = {
    ESA_WEBB: {
      large: 'https://cdn.esawebb.org/archives/images/large',
      full: 'https://cdn.esawebb.org/archives/images/publicationjpg',
    },
    ESA_HUBBLE: {
      large: 'https://cdn.spacetelescope.org/archives/images/large',
      full: 'https://cdn.spacetelescope.org/archives/images/publicationjpg',
    },
    NASA_MARS: {
      large: 'https://mars.nasa.gov/msl-raw-images/msss',
      full: 'https://mars.nasa.gov/msl-raw-images/msss',
    },
  }

  /**
   * Generate MD5 hash from image URL for compact storage
   */
  static generateImageHash(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex')
  }

  /**
   * Reconstruct ESA image URL from ESA ID and type
   */
  static reconstructEsaImageUrl(
    esaId: string,
    type: EsaImageType,
    fullSize: boolean = false
  ): string {
    const baseUrl = type === 'JWST' ? this.BASE_URLS.ESA_WEBB : this.BASE_URLS.ESA_HUBBLE

    const sizeUrl = fullSize ? baseUrl.full : baseUrl.large
    return `${sizeUrl}/${esaId}.jpg`
  }

  /**
   * Reconstruct NASA Mars rover image URL from hash
   * This is a simplified implementation - you'd need to adapt based on actual URL patterns
   */
  static reconstructRoverImageUrl(hash: string, fullSize: boolean = false): string {
    const baseUrl = this.BASE_URLS.NASA_MARS.large

    // Convert hash back to original path structure
    // This is a placeholder - you'd implement based on your specific URL patterns
    const pathFromHash = this.hashToRoverPath(hash)

    return `${baseUrl}/${pathFromHash}`
  }

  /**
   * Extract metadata from original URL for optimization
   */
  static extractUrlMetadata(url: string): {
    hash: string
    type: 'rover' | 'esa'
    esaId?: string
  } {
    const hash = this.generateImageHash(url)

    // Determine type based on URL pattern
    if (url.includes('esawebb.org') || url.includes('spacetelescope.org')) {
      const esaId = this.extractEsaIdFromUrl(url)
      return { hash, type: 'esa', esaId }
    } else {
      return { hash, type: 'rover' }
    }
  }

  /**
   * Extract ESA ID from ESA image URL
   */
  private static extractEsaIdFromUrl(url: string): string {
    // Extract ESA ID from URL patterns like:
    // https://cdn.esawebb.org/archives/images/large/weic2216a.jpg
    const match = url.match(/\/([^\/]+)\.(jpg|jpeg|png)$/i)
    return match ? match[1] : ''
  }

  /**
   * Convert hash back to rover image path
   * This is a placeholder implementation
   */
  private static hashToRoverPath(hash: string): string {
    // This would be implemented based on your specific hashing strategy
    // For now, creating a simple path structure
    return `${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash}.jpg`
  }

  /**
   * Validate if URL is accessible
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get image size information without downloading full image
   */
  static async getImageInfo(url: string): Promise<{
    size?: number
    contentType?: string
    lastModified?: string
  }> {
    try {
      const response = await fetch(url, { method: 'HEAD' })

      return {
        size: response.headers.get('content-length')
          ? parseInt(response.headers.get('content-length')!)
          : undefined,
        contentType: response.headers.get('content-type') || undefined,
        lastModified: response.headers.get('last-modified') || undefined,
      }
    } catch {
      return {}
    }
  }

  /**
   * Batch validate multiple URLs
   */
  static async batchValidateUrls(urls: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()

    const promises = urls.map(async (url) => {
      const isValid = await this.validateImageUrl(url)
      results.set(url, isValid)
    })

    await Promise.all(promises)
    return results
  }

  /**
   * Get optimized URL for different screen sizes
   */
  static getResponsiveImageUrl(
    esaId: string,
    type: EsaImageType,
    size: 'thumb' | 'medium' | 'large' | 'full'
  ): string {
    const sizeMap = {
      thumb: 'thumbs',
      medium: 'medium',
      large: 'large',
      full: 'publicationjpg',
    }

    const baseUrl =
      type === 'JWST'
        ? 'https://cdn.esawebb.org/archives/images'
        : 'https://cdn.spacetelescope.org/archives/images'

    return `${baseUrl}/${sizeMap[size]}/${esaId}.jpg`
  }
}
