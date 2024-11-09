import type { Request, Response } from 'express'
import Controller from './Controller'
import {Services} from "../../db/connection";

class ServiceController extends Controller {
  public get = async (req: Request, res: Response) => {
    const items = Services.find({});

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

  public testHandleHttpError = (req: Request, res: Response) => {
    try {
      this.setError(400, 'Bad Request')
    } catch (err: any) {
      this.handleError(req, res, err)
    }
  }
}

export default new ServiceController()
