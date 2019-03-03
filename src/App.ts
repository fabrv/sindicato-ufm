import { createServer, Server } from 'http'
import express from 'express'
import cors from 'cors'
import * as path from 'path'

var redis = require('redis')
var client = redis.createClient(process.env.REDIS_URL);

const indexStart = '<!DOCTYPE html><html><head>'
const indexContent = '<meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" type="text/css" media="screen" href="main.css"></head><body><div class="header"><h1>EL SINDICATO</h1><ul class="links"><li><a href="../">OPINIÓN</a></li><li><a href="nosotros.html">NOSOTROS</a></li></ul></div><div id="wrapper">'
const indexEnd = '</div><button class="pager" id="more" onClick="addPage()">Más articulos</button><button class="pager" id="less" onClick="lessPage()">Menos articulos</button></body></html>'

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


    // Database connection error test
    client.on('error', (err: any)=>{
      console.log('Something went wrong on redis ', err)
    })
  }

  mountRoutes(){
    const router: any = express.Router()
    router.get('/json/opinion', (req: express.Request, res: express.Response) => {
      client.lrange('opinions', 0, -1, function(err: any, reply: any) {
        res.send(parseSection(reply))
      })
    })

    router.get('/opinion', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/index.html'))
    })

    router.get('/nosotros', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/nosotros.html'))
    })

    router.get('/:article', (req: express.Request, res: express.Response) => {
      let article: {date: string, author: string, headline: string, subhead: string, body: string, visits: number}
      let wrapper: string
      let metaTags: string
      client.get(decodeURI(req.params.article), (error: any, result: any)=>{
        if (error) throw error
        if (result != null){
          article = JSON.parse(result)
          wrapper = parseArticle(article.headline, article.subhead, article.body, article.date, article.author)
          article.visits += 1
          console.log(`Articulo visitado: ${decodeURI(req.params.article)}`)
          client.set(decodeURI(req.params.article), JSON.stringify(article), redis.print)
          metaTags = parseMetaTags(`${article.headline}`, article.subhead)
        }else{
          wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
          metaTags = parseMetaTags('404 😥', 'No encontramos ese articulo')
        }
        
        res.send(`${indexStart}${metaTags}${indexContent}${wrapper}${indexEnd}`)
      })
    })

    this.app.use('/', router)
  }
}

function parseArticle(headline: string, subhead: string, body: string, date: string, author:string): string{
  const article = `
  <div class="content">
    <h1><a href="${encodeURI(headline)}">${headline}</a></h1>
    <p class="info"><b>${author}</b>  -  ${date}</p>
    <p class="subhead">${subhead}</p>
    <hr>
    <div class="body">${body}</div>
    <hr>
  </div>
  `
  return article
}

function parseSection(unparsedArticles: Array<string>): Array<{date: string, author: string, headline: string, subhead: string, body: string, visits: number}>{
  let parsedArticles: Array<{
    date: string, 
    author: string, 
    headline: string, 
    subhead: string, 
    body: string, 
    visits: number
  }> = []
  for (let i = 0; i < unparsedArticles.length; i++){
    const opinion: {date: string, author: string, headline: string, subhead: string, body: string, visits: number} = JSON.parse(unparsedArticles[i])
    parsedArticles.push(opinion)
  }

  return parsedArticles
}

function parseMetaTags(title: string, description: string): string{
  return `
    <title>El Sindicato - ${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="sindicato-icon-240x240.png">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_ES">
    <meta property="og:url" content="http://www.sindicato-ufm.com/${encodeURI(title)}">
    `
}

//Export app
export default new App()