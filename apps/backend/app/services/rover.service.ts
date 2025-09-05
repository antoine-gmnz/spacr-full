import Rover from "#models/rover"

export default class RoverService {
  async getRovers() {
    const rovers = await Rover.query();
    return rovers
  }
}