import type { Request, Response } from 'express'
import Controller from './Controller'
import {Sources} from "../../db/connection";
import Dropbox from "../../modules/dropbox.ts";


class PlaylistController extends Controller {
  public get = async (req: Request, res: Response) => {
    const items = await Dropbox.list();

    // const items = Sources.find({});

    console.log(items)

    const payload: any[] = [

    ]

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

  public create = (req: Request, res: Response) => {
    try {
      this.send(res, {
        code: 201,
        message: `Created`
      })
    } catch (err: any) {
      this.handleError(req, res, err)
    }
  }
}

export default new PlaylistController()
