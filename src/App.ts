import { createServer, Server } from 'http'
import { Client } from 'pg'
import express from 'express'
import cors from 'cors'
import * as path from 'path'

import redis from 'redis'
const client = redis.createClient(process.env.REDIS_URL)

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

const indexStart = `<!DOCTYPE html><html><head><!-- Global site tag (gtag.js) - Google Analytics --><script async src="https://www.googletagmanager.com/gtag/js?id=UA-140472386-2"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'UA-140472386-2');</script>`
const indexContent = '<meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><script>(adsbygoogle = window.adsbygoogle || []).push({google_ad_client: "ca-pub-1298512778914438",enable_page_level_ads: true});</script><link rel="stylesheet" type="text/css" media="screen" href="../main.css"><script src="../main.js"></script></head><body><div class="header"><h1>EL SINDICATO</h1><ul class="links"><li><a href="../musica">MÚSICA</a><li><a href="../">OPINIÓN</a></li><li><a href="../nosotros">NOSOTROS</a></li></ul></div><div id="wrapper">'
const indexEnd = '</div><footer class="header"> <h1>🏛️</h1> <h3>La crítica estudiantil</h3><ul class="links"> <li><a href="../musica">MÚSICA</a><li> <li> <a href="../">OPINIÓN</a> </li> <li> <a href="../nosotros">NOSOTROS</a> </li> </ul> </footer></body></html>'

class App{
  public server: Server
  public app: express.Application
  constructor () {
    // App Express
    this.app = express()
    // Load static files
    this.app.use(express.static(path.resolve(__dirname, '../view')))
    //Review routes
    this.reviewRoutes()
    // Mount routes
    this.basicRoutes()

    // Http Server
    this.server = createServer(this.app)

    // Postgres connection
    pgClient.connect()
    // Redis connection error test
    client.on('error', (err: any)=>{
      console.log('Something went wrong on redis ', err)
    })
  }

  basicRoutes() {
    const router: express.Router = express.Router()

    router.get('/json/articulo/:article', (req: express.Request, res: express.Response) => {
      const article = replaceAll(req.params.article, '_', ' ')
      pgClient.query(`SELECT * FROM public."ARTICLE" WHERE "headline" = '${article}'`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows[0])
        }
      })
    })

    router.get('/json/categories', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT "CATEGORY", "LABEL" FROM public."CATEGORY"`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let row of result.rows) {
            data.push(row)
          }
          res.status(200).send(data)
        }
      })
    })

    router.get('/json/califica/universidades', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT imagelink, university , ROUND(AVG(reputation),2) AS "Reputación", ROUND(AVG(location),2) AS "Ubicación", ROUND(AVG(events),2) AS "Eventos", ROUND(AVG(security),2) AS "Seguridad", ROUND(AVG(cleanliness),2) AS "Limpieza", ROUND(AVG(happiness),2) AS "Felicidad" FROM uni_reviews, universities WHERE uni_reviews.university = universities.name GROUP BY university, imagelink`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/califica', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT * FROM uni_reviews`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })    
    
    router.get('/json/:category', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT * FROM public."ARTICLE" WHERE category = '${req.params.category}' ORDER BY created DESC`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let row of result.rows) {
            data.push(row)
          }
          res.status(200).send(data)
        }
      })
    })

    router.get('/nosotros', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/nosotros.html'))
    })

    router.get('/califica/universidades', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/califica.html'))
    })

    router.get('/califica', (req: express.Request, res: express.Response) => {
      console.log('test')
      res.redirect('/califica/universidades')
    })

    router.get('/articulo/:article', (req: express.Request, res: express.Response) => {
      let wrapper: string
      let metaTags: string
      const pArticle = replaceAll(req.params.article, '_', ' ')

      pgClient.query(`UPDATE public."ARTICLE" SET "views" = "views" + 1 WHERE "headline" = '${pArticle}'; SELECT * FROM public."ARTICLE" WHERE "headline" = '${pArticle}';`, (error, result: any) => {
        if (error) {
          res.status(500).send(error)
        } else {
          if (result[1].rowCount > 0) {
            console.log(`Articulo visitado: ${pArticle}`)
            
            const article = result[1].rows[0]
            wrapper = parseArticle(article.headline, article.subhead, article.body, article.date, article.author)
            if (article.body.includes('src="')){
              for (let i = 0; i < article.body.length; i++){
                if (article.body[i] == '"'){
                  let string = article.body[i-4] + article.body[i-3] + article.body[i-2] + article.body[i-1] + article.body[i]
                  if (string == 'src="'){
                    let char = ''
                    let o = 1
                    while (char != '"'){
                      char = article.body[i+o]
                      o++
                    }
                    const imgString = article.body.substring(i+1, i+o-1).replace('../', '')
                    metaTags = parseMetaTags(`${article.headline}`, article.subhead, 'articulo/', imgString)
                    i = article.body.length
                  }
                }
              }
            }else{
              metaTags = parseMetaTags(`${article.headline}`, article.subhead, 'articulo/')
            }
          } else {
            wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
            metaTags = parseMetaTags('404 😥', 'No encontramos ese articulo', 'articulo/')
          }


          res.send(`${indexStart}${metaTags}${indexContent}${wrapper}${indexEnd}`)
        }
      })
    })

    router.get('/:category', (req: express.Request, res: express.Response) => {
      let page: number = 0
      const pageBoundary: number = 10
      if (!isNaN(req.query.page)){
        page = parseInt(req.query.page)
      }

      pgClient.query(`SELECT * FROM public."ARTICLE" WHERE category = '${req.params.category}' ORDER BY created DESC OFFSET ${page * (pageBoundary)} FETCH NEXT ${pageBoundary + 1} ROWS ONLY;`, (error, result) => {
        let end: string = indexEnd
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let i = 0; i < result.rowCount && i < pageBoundary; i++) {
            data.push(result.rows[i])
          }

          if (result.rowCount === 0){
            const wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
            const metaTags = parseMetaTags('404 😥', 'No encontramos ese articulo', 'articulo/')
            res.send(`${indexStart}${metaTags}${indexContent}${wrapper}${indexEnd}`)

          } else {
            if (result.rowCount === pageBoundary + 1) {
              end = spliceSlice(end, 6, 0, '<button class="pager" id="more" onClick="addPage()">Más articulos</button>')
            }
            if (page > 0){
              end = spliceSlice(end, 6, 0, '<button class="pager" id="less" onClick="lessPage()">Menos articulos</button>')
            }

            let wrapper: string = ''
            for (let i = 0; i < data.length; i++){
              wrapper += parseArticle(data[i].headline, data[i].subhead, data[i].body, data[i].date, data[i].author);
            }
            const metaTags = parseMetaTags('', '', '')
            res.send(`${indexStart}${metaTags}${indexContent}${wrapper}${end}`)
          }
        }
      })
    })

    router.delete('/delete', (req: express.Request, res: express.Response)=>{
      if (req.query.pwd == process.env.WRITE_PWD){
        client.lindex(decodeURI(req.query.category), req.query.index,(error: any, result: any)=>{
          client.lrem(decodeURI(req.query.category), 1, result, redis.print)
          client.del(req.query.article)
          res.status(303).send(result)
        })
      }else{
        console.log('wrong pwd:', req.query.pwd)
        res.status(403).send("You don't have permission to delete articles on this server")
      }
    })

    router.post('/upload', (req: express.Request, res: express.Response)=>{
      if (req.query.pwd == process.env.WRITE_PWD){
        console.log(req.query.body)
        const newArticle: {
          date: string, 
          author: string, 
          headline: string, 
          subhead: string, 
          body: string, 
          visits: number
        } = {
          date: req.query.date, 
          author: req.query.author, 
          headline: req.query.headline, 
          subhead: req.query.subhead,
          body: req.query.body,
          visits: 0
        }
        client.set(req.query.headline, JSON.stringify(newArticle), redis.print)
        client.lpush(req.query.category, JSON.stringify(newArticle) , redis.print)
        res.send({'article': newArticle})
      }else{
        console.log('wrong pwd:', req.query.pwd)
        res.status(403).send("You don't have permission to upload articles on this server")
      }
    })

    router.get('/', (req: express.Request, res: express.Response)=>{
      res.redirect('/opinion')
    })

    this.app.use('/', router)
  }

  reviewRoutes() {
    const router: express.Router = express.Router()

    router.get('/califica/universidades/:university', (req: express.Request, res: express.Response) => {
      res.status(200).send(req.params.university)
    })

    this.app.use('/', router)
  }

}

function parseArticle(headline: string, subhead: string, body: string, date: string, author:string): string{
  const article = `
  <div class="content">
    <h1><a href="articulo/${encodeURIComponent(replaceAll(headline, ' ', '_'))}">${headline}</a></h1>
    <p class="info"><b>${author}</b>  -  ${date}</p>
    <p class="subhead">${subhead}</p>
    <hr>
    <div class="body">${body}</div>
    <hr>
    ¿Te gustó el artículo?
    <a href="https://www.facebook.com/sharer/sharer.php?u=http://www.sindicato-ufm.com/articulo/${headline}" target="_blank">
      Comparte en Facebook
    </a>,
    <a class="twitter-share-button"
      href="https://twitter.com/intent/tweet?text=${replaceAll(headline, ' ', '_')}, http://www.sindicato-ufm.com/articulo/${encodeURIComponent(replaceAll(headline, ' ', '_'))}"
      data-size="large"
      target="_blank">
    Twitter</a>
    o síguenos en las
    <a href="https://www.facebook.com/sindicatoUFM" target="_blank">redes</a>
    <hr>
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

function parseMetaTags(title: string, description: string, location: string, img: string = 'sindicato-icon-240x240.png'): string{
  return `
    <title>| El Sindicato | ${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="http://www.sindicato-ufm.com/${img}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_ES">    
    <meta property="og:url" content="http://www.sindicato-ufm.com/${location}${replaceAll(title, ' ', '_')}">
    <meta name="google-site-verification" content="jMeI7ML27XYuoifj0zX0IOkJDRe5qnu0Mv1SI2kUOLI" />
    `
}

function spliceSlice(str: string, index: number, count: number, add: any):string {
  if (index < 0) {
    index = str.length + index
    if (index < 0) {
      index = 0
    }
  }

  return str.slice(0, index) + (add || "") + str.slice(index + count)
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

//Export app
export default new App()