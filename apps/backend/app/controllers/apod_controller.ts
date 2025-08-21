import ApodService from '#services/apod_service'
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

export default class ApodController {
  @inject()
  async getApod({ response }: HttpContext) {
    const apod = await new ApodService().getApod();
    return response.json(await apod.json());
  }
}