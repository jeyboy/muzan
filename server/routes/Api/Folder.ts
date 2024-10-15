import Controller from '../../app/Controllers/Controller'
import FolderController from '../../app/Controllers/Folder'
import Router from '../Router'

class FolderRoute extends Router {
  public baseRoute = '/folders'

  public routes() {
    this.router.get('/', FolderController.get)
    this.router.post('/', FolderController.validateToken, FolderController.create)
  }
}

export default new FolderRoute()