import UserController from '../../app/Controllers/User'
import Router from '../Router'

class UserRoute extends Router {
  public baseRoute = '/users'

  public routes() {
    this.router.get('/', UserController.get)
    this.router.post('/', UserController.create)
  }
}

export default new UserRoute()