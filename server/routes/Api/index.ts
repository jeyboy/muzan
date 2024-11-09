import Router from '../Router'
import SongRoute from './Song'
import AudioRoute from './Audio'
import FolderRoute from './Source'
import UserRoute from './User'
import AuthRoute from './Auth'
import ServiceRoute from './Service'
import PlaylistRoute from './Playlist'
import GenRequestRoute from './GenRequest'
import MusicStyleRoute from './MusicStyle'
import MusicStylePresetRoute from './MusicStylePreset'

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
    this.router.use(PlaylistRoute.baseRoute, PlaylistRoute.router)
    this.router.use(GenRequestRoute.baseRoute, GenRequestRoute.router)
    this.router.use(MusicStyleRoute.baseRoute, MusicStyleRoute.router)
    this.router.use(MusicStylePresetRoute.baseRoute, MusicStylePresetRoute.router)
  }
}

export default new ApiRoute()
