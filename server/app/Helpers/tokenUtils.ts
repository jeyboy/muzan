import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export const generateJwtToken = (payload: string | object | Buffer) => {
  const secretKey = process.env.SALT;

  if (!secretKey) {
    throw new Error('AAAAAAA')
  }

  const options = {
    expiresIn: '7d', // Token expiration time
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
};

export const generatePassHash = async (password: string, saltRound: number = 10) => {
  return await bcrypt.hash(process.env.SALT + password, saltRound);
}
