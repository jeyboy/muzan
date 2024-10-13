import Dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

Dotenv.config()

export const {
  NODE_ENV = 'production',
  PORT = 3000
} = process.env

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export const IS_PRODUCTION = NODE_ENV === 'production'
export const CLIENT_BUILD_PATH = `${__dirname}/../../build`
