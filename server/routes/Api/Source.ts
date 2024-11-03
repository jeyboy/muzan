import SourceController from '../../app/Controllers/Source'
import Router from '../Router'

class SourceRoute extends Router {
  public baseRoute = '/folders'

  public routes() {
    this.router.get('/', SourceController.get)
    this.router.post('/', SourceController.validateToken, SourceController.create)
  }
}

export default new SourceRoute()