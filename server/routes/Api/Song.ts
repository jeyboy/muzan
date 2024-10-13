import SongController from '../../app/Controllers/Song'
import Router from '../Router'

class SongRoute extends Router {
  public baseRoute = '/songs'

  public routes() {
    this.router.get('/', SongController.get)
    this.router.post('/', SongController.create)
  }
}

export default new SongRoute()