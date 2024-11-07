import Router from '../Router'
// import VoucherRoute from './Voucher'
import SongRoute from './Song'
import AudioRoute from './Audio'
import FolderRoute from './Source'
import UserRoute from './User'
import AuthRoute from './Auth'
import ServiceRoute from './Service'

class ApiRoute extends Router {
  public baseRoute = '/api'

  public routes() {
    // this.router.use(VoucherRoute.baseRoute, VoucherRoute.router)
    this.router.use(SongRoute.baseRoute, SongRoute.router)
    this.router.use(AudioRoute.baseRoute, AudioRoute.router)
    this.router.use(FolderRoute.baseRoute, FolderRoute.router)
    this.router.use(UserRoute.baseRoute, UserRoute.router)
    this.router.use(AuthRoute.baseRoute, AuthRoute.router)
    this.router.use(ServiceRoute.baseRoute, ServiceRoute.router)
  }
}

export default new ApiRoute()
