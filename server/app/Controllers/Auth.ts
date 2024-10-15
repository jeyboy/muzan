import type { Request, Response } from 'express'
import Controller from './Controller'
import { generateToken } from '../Helpers/jwtUtils'

class AuthController extends Controller {
  private checkPassword = async (email: string, password: string): Promise<boolean> => {
    // (email === user.email && password === user.password)

    return true;
  }

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      if (await this.checkPassword(email, password)) {
        // Generate JWT token
        const token = generateToken({ id: user.id, email: user.email });
    
        res.json({
          token: token,
        });
      } else {
        res.status(401).json({
          message: 'Invalid username or password',
        });
      }

      this.send(res, {
        code: 200,
        message: `Created`
      })
    } catch (err: any) {
      this.handleError(req, res, err)
    }
  }
}

export default new AuthController()
