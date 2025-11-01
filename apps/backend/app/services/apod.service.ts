import env from '#start/env'

export default class ApodService {
  async getApod() {
    return await fetch(`https://api.nasa.gov/planetary/apod?api_key=${env.get('NASA_API_KEY')}`)
  }
}
