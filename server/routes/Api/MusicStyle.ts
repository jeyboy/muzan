import MusicStyleController from '../../app/Controllers/MusicStyle'
import Router from '../Router'

class MusicStyleRoute extends Router {
  public baseRoute = '/audios'

  public routes() {
    this.router.get('/', MusicStyleController.get)
    this.router.post('/', MusicStyleController.validateToken, MusicStyleController.create)
  }
}

export default new MusicStyleRoute()