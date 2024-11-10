import type { Request, Response } from 'express'
import Controller from './Controller'
import dropbox from "../../modules/dropbox";

class AudioController extends Controller {
  public get = async (req: Request, res: Response) => {
    console.log("", (await dropbox.spaceLeft()));
    console.log("", (await dropbox.downloadUrl("/!music/крокодилда/В воде таится крутой зверь (1).mp3")))
    // https://www.dropbox.com/scl/fi/9iqp400yo69m7sn8iwx5p/1.mp3?rlkey=m00naeesi8fo8evtr4vgan76u&st=c0bvb9gj&dl=0

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

  public testHandleHttpError = (req: Request, res: Response) => {
    try {
      this.setError(400, 'Bad Request')
    } catch (err: any) {
      this.handleError(req, res, err)
    }
  }
}

export default new AudioController()
