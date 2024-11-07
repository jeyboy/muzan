import ServiceController from '../../app/Controllers/Service'
import Router from '../Router'

class ServiceRoute extends Router {
  public baseRoute = '/services'

  public routes() {
    this.router.get('/', ServiceController.get)
    this.router.post('/', ServiceController.create)
  }
}

export default new ServiceRoute()