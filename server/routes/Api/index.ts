import Router from '../Router'
import VoucherRoute from './Voucher'
import SongRoute from './Song'
import FolderRoute from './Folder'

class ApiRoute extends Router {
  public baseRoute = '/api'

  public routes() {
    this.router.use(VoucherRoute.baseRoute, VoucherRoute.router)
    this.router.use(SongRoute.baseRoute, SongRoute.router)
    this.router.use(FolderRoute.baseRoute, FolderRoute.router)
  }
}

export default new ApiRoute()
