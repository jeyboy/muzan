import type { Request, Response } from 'express'
import Controller from '../Controller'
import {dropboxApi} from "../../../../build-server/modules/dropbox";

class DropboxWebhooksController extends Controller {
  public get = async (req: Request, res: Response) => {
    console.log("", (await dropboxApi.spaceLeft()));

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
