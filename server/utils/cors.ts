import Cors, { type CorsOptions } from 'cors'
import { IS_PRODUCTION } from './config'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const productionWhiteList: string[] = [

]

const developmentWhiteList: string[] = [
  'http://localhost',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://localhost:4321',
]

export const whiteListDomain = IS_PRODUCTION
  ? productionWhiteList
  : developmentWhiteList

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    console.log("JOP", IS_PRODUCTION)

    if (!origin || whiteListDomain.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error(`Not Allowed to access the request! ${origin}`))
    }
  }
}

const CorsInstance = (newOptions: CorsOptions = {}) =>
  Cors({ ...corsOptions, ...newOptions })

export default CorsInstance