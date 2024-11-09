import MusicStylePresetController from '../../app/Controllers/MusicStylePreset'
import Router from '../Router'

class MusicStylePresetRoute extends Router {
  public baseRoute = '/audios'

  public routes() {
    this.router.get('/', MusicStylePresetController.get)
    this.router.post('/', MusicStylePresetController.validateToken, MusicStylePresetController.create)
  }
}

export default new MusicStylePresetRoute()