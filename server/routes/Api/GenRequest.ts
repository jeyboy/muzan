import GenRequestController from '../../app/Controllers/GenRequest'
import Router from '../Router'

class GenRequestRoute extends Router {
  public baseRoute = '/audios'

  public routes() {
    this.router.get('/', GenRequestController.get)
    this.router.post('/', GenRequestController.validateToken, GenRequestController.create)
  }
}

export default new GenRequestRoute()