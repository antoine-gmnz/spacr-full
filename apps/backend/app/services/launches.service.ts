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
    const response = await fetch(`${this.baseUrl}/?limit=20&ordering=-net`)
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
    // Use upcoming launches endpoint by default (shows launches from now into the future)
    // If a year filter is applied for past years, use the main launches endpoint
    const currentYear = new Date().getFullYear()
    const isPastYearFilter = params.year && parseInt(params.year) < currentYear
    
    const baseEndpoint = isPastYearFilter ? this.baseUrl : `${this.baseUrl}/upcoming`
    const url = new URL(baseEndpoint)
    const searchParams = new URLSearchParams()

    // Set ordering by launch time (ascending - soonest first for upcoming)
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

    console.log('Fetching launches from:', url.toString())
    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, errorText)
      throw new Error(`Failed to search launches: ${response.status} - ${errorText}`)
    }

    return (await response.json()) as LaunchDataResponse
  }
}
