import { PORT } from './utils/config'
import Express, { type Application } from 'express'
import Routes from './routes/index'
import Cors from './utils/cors'
import {connectToDB} from "./db/connection.ts";
// import bodyParser from 'body-parser';

export default class Server {
  private application: Application
  private port: number|string

  constructor() {
    this.port = PORT
    this.application = Express()
  }
  
  private plugins() {
    this.application.use(Express.urlencoded({ extended: true }))
    // this.application.use(bodyParser.json());
    this.application.use(Express.json())
    this.application.use(Cors())
    this.application.use(Routes)
  }
  
  public async run() {
    try {
      await connectToDB();
      this.plugins()
      this.application.listen(this.port, () => {
        console.log(`> Server running on http://localhost:${this.port}`)
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
}

new Server().run()
    .then(r => '')
    .catch((error) => {
      console.error(error);
    });
