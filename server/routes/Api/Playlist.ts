import PlaylistController from '../../app/Controllers/Playlist'
import Router from '../Router'

class PlaylistRoute extends Router {
  public baseRoute = '/playlists'

  public routes() {
    this.router.get('/', PlaylistController.get)
    this.router.post('/', PlaylistController.create)
  }
}

export default new PlaylistRoute()