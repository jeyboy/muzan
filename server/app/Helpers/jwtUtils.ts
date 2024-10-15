import jwt from 'jsonwebtoken';

export const generateToken = (payload: string | object | Buffer) => {
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
