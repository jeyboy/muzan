import Dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

Dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const {
  NODE_ENV = 'production',
  PORT = 3000
} = process.env

export const IS_PRODUCTION = NODE_ENV === 'production'
export const CLIENT_BUILD_PATH = `${__dirname}/../../build-client`
