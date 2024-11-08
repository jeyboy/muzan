import Router from '../../Router'
import DropboxWebhooksController from '../../../app/Controllers/webhooks/Dropbox'

class DropboxWebhooksRoute extends Router {
  public baseRoute = '/webhooks/dropbox'

  public routes() {
    this.router.get('/', DropboxWebhooksController.get)
  }
}

export default new DropboxWebhooksRoute()