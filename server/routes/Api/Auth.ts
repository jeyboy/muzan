import AuthController from '../../app/Controllers/Auth'
import Router from '../Router'

class AuthRoute extends Router {
  public baseRoute = '/auth'

  public routes() {
    this.router.post('/', AuthController.login)
  }
}

export default new AuthRoute()