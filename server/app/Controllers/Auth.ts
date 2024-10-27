import type { Request, Response } from 'express'
import Controller from './Controller'
import { generateJwtToken } from '../Helpers/tokenUtils'
import { getDbEntity } from '../../db/connection'
import type { User } from '../../db/interfaces/user'

class AuthController extends Controller {
  private checkPassword = async (email: string, password: string): Promise<boolean> => {
    const users = await getDbEntity('users');

    const user = (await users.findOne<User>({email}));

    // (email === user.email && password === user.password)

    return true;
  }

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      if (await this.checkPassword(email, password)) {
        // Generate JWT token
        const token = generateJwtToken({ id: user.id, email: user.email });
    
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
