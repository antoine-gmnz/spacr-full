export default class ApodService {
  async getApod() {
    return await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`,
    );
  }
}