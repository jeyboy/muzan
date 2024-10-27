import type { Request, Response } from 'express'
import Controller from './Controller'
import {generateJwtToken, generatePassHash} from '../Helpers/tokenUtils'
import { getDbEntity } from '../../db/connection'
import type { User } from '../../db/interfaces/user'

class AuthController extends Controller {
  private checkPassword = async (email: string, password: string = ''): Promise<User | undefined> => {
    const users = await getDbEntity('users');

    const user = (await users.findOne<User>({email}));

    if (user && password) {
     const passHash = await generatePassHash(password)

      if (passHash === user?.passwordHash) {
        return user;
      }
    }

    return undefined;
  }

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await this.checkPassword(email, password);

      if (user) {
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
