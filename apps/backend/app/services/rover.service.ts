import Rover from '#models/rover'

export default class RoverService {
  public async getRovers() {
    return await Rover.query().preload('cameras')
  }
}
