import type { Request, Response } from 'express'
import Controller from '../Controller'
import dropbox from "../../../modules/dropbox";

class DropboxWebhooksController extends Controller {
  public get = async (req: Request, res: Response) => {
    console.log("", (await dropbox.spaceLeft()));

    // dummy data. only for demo
    const payload: any[] = []

    try {
      this.send(res, {
        code: 200,
        message: `OK`,
        payload
      })
    } catch (err: any) {
      this.handleError(req, res, err)
    }
  }
}

export default new DropboxWebhooksController()
