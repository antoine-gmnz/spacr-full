import type { LaunchDataResponse } from '@spacr/shared-types'

export interface LaunchSearchParams {
  search?: string
  limit?: number
  offset?: number
  year?: string
}

export default class LaunchesService {
  private readonly baseUrl = 'https://ll.thespacedevs.com/2.3.0/launches'

  public async getLaunches(): Promise<LaunchDataResponse> {
    const response = await fetch(`${this.baseUrl}/?limit=20&ordering=net`)
    if (!response.ok) {
      throw new Error(`Failed to fetch launches: ${response.statusText}`)
    }

    return (await response.json()) as LaunchDataResponse
  }

  public async getUpcomingLaunches(limit: number = 10): Promise<LaunchDataResponse> {
    const response = await fetch(`${this.baseUrl}/upcoming/?limit=${limit}&ordering=net`)
    console.log(response)
    if (!response.ok || response.status !== 200) {
      throw new Error(`Failed to fetch upcoming launches: ${response}`)
    }

    return (await response.json()) as LaunchDataResponse
  }

  public async searchLaunches(params: LaunchSearchParams = {}): Promise<LaunchDataResponse> {
    const url = new URL(this.baseUrl)
    const searchParams = new URLSearchParams()

    // Set default ordering by launch time
    searchParams.append('ordering', 'net')

    if (params.search) {
      searchParams.append('search', params.search)
    }

    if (params.limit) {
      searchParams.append('limit', params.limit.toString())
    } else {
      searchParams.append('limit', '20')
    }

    if (params.offset) {
      searchParams.append('offset', params.offset.toString())
    }

    if (params.year) {
      // Filter by year - we need to construct a date range
      const startDate = `${params.year}-01-01T00:00:00Z`
      const endDate = `${params.year}-12-31T23:59:59Z`
      searchParams.append('net__gte', startDate)
      searchParams.append('net__lte', endDate)
    }

    url.search = searchParams.toString()

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to search launches: ${response.statusText}`)
    }

    return (await response.json()) as LaunchDataResponse
  }
}
