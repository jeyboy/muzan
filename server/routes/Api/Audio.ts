import AudioController from '../../app/Controllers/Audio'
import Router from '../Router'

class AudioRoute extends Router {
  public baseRoute = '/audios'

  public routes() {
    this.router.get('/', AudioController.get)
    this.router.post('/', AudioController.validateToken, AudioController.create)
  }
}

export default new AudioRoute()