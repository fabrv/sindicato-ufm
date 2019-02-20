import { createServer, Server } from 'http'
import express from 'express'
import cors from 'cors'
import * as path from 'path'

class App{
  public server: Server
  public app: express.Application
  constructor () {
    // App Express
    this.app = express()
    // Load static files
    this.app.use(express.static(path.resolve(__dirname, '../view')))
    // Mount extra routes
    this.mountRoutes()
    // Http Server
    this.server = createServer(this.app)
  }

  mountRoutes(){
    const router: any = express.Router()
    router.get('/*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/index.html'))
    })

    this.app.use('/', router)
  }
}

//Export app
export default new App()