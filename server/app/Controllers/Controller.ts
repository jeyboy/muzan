import type { Request, Response } from 'express'
import Http, { type HttpResponse } from '../Helpers/Http'
import HttpError from '../Helpers/HttpError'
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user: any
}

export default class Controller {
  protected send<T>(res: Response, data: HttpResponse<T>): Response {
    return Http.send(res, data)
  }
  
  protected setError(code: number, msg: string): void {
    throw new HttpError(code, msg)
  }
  
  protected handleError(req: Request, res: Response, error: Error): Response {
    return HttpError.handle(req, res, error)
  }

  
  public validateToken = (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      jwt.verify(token, 'yourSecretKey', (err, payload) => {
        if (err) {
          return res.status(403).json({
            status: 403,
            message: 'Invalid token',
          });
        } else {
          (req as AuthRequest).user = payload;
          next();
        }
      });
    } else {
      res.status(401).json({
        status: 401,
        message: 'Token is not provided',
      });
    }
  };
}
