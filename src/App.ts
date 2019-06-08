import { createServer, Server } from 'http'
import { Client } from 'pg'
import express from 'express'
import * as path from 'path'
import bodyParser from 'body-parser'
import axios, { AxiosResponse, AxiosError } from 'axios'
//import redis from 'redis'
import fs from 'fs'

import mustache from 'mustache'

// All main parsing imports
import { Parsing } from './Parsing'

//const client = redis.createClient(process.env.REDIS_URL)

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

const MasterTemplate = fs.readFileSync(path.resolve(__dirname, 'templates/Master.html'), 'utf8')

class App{
  public server: Server
  public app: express.Application
  public parsing: Parsing = new Parsing()
  constructor () {
    // App Express
    this.app = express()
    // Use bodyparser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Load static files
    this.app.use(express.static(path.resolve(__dirname, '../view')))
    // Review routes
    this.reviewRoutes()
    // Article routes
    this.articleRoutes()
    // General routes. THIS SHOULD ALWAYS BE THE LAST ROUTES MOUNTED
    this.generalRoutes()

    // Http Server
    this.server = createServer(this.app)

    // Postgres connection
    pgClient.connect()
    // Redis connection error test
    /*client.on('error', (err: any)=>{
      console.log('Something went wrong on redis ', err)
    })*/
  }

  articleRoutes(router: express.Router = express.Router()) {
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
            wrapper = this.parsing.parseArticle(article.headline, article.subhead, article.body, article.date, article.author)
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
                    metaTags = this.parsing.parseMetaTags(`${article.headline}`, article.subhead, 'articulo/', imgString)
                    i = article.body.length
                  }
                }
              }
            }else{
              metaTags = this.parsing.parseMetaTags(`${article.headline}`, article.subhead, 'articulo/')
            }
          } else {
            wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
            metaTags = this.parsing.parseMetaTags('404 😥', 'No encontramos ese articulo', 'articulo/')
          }

          const view = {'metaTags': metaTags, 'wrapper': wrapper}
          const site = mustache.render(MasterTemplate, view)
          res.send(site)
        }
      })
    })

    this.app.use('/', router)
  }

  generalRoutes(router: express.Router = express.Router()) {
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

    router.get('/:category', (req: express.Request, res: express.Response) => {
      let page: number = 0
      const pageBoundary: number = 10
      if (!isNaN(req.query.page)){
        page = parseInt(req.query.page)
      }

      pgClient.query(`SELECT * FROM category_articles_paging('${req.params.category}', ${page * (pageBoundary)}, ${pageBoundary + 1});`, (error, result) => {
        
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let i = 0; i < result.rowCount && i < pageBoundary; i++) {
            data.push(result.rows[i])
          }

          if (result.rowCount === 0){
            const wrapper: string = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
            const metaTags: string = this.parsing.parseMetaTags('404 😥', 'No encontramos ese articulo', 'articulo/')
            const view = {'metaTags': metaTags, 'wrapper': wrapper}
            const site: string = mustache.render(MasterTemplate, view)
            res.send(site)

          } else {
            let paging: string = ''
            if (page > 0){
              paging += '<button class="pager" id="less" onClick="lessPage()">Menos articulos</button>'
            }
            if (result.rowCount === pageBoundary + 1) {
              paging += '<button class="pager" id="more" onClick="addPage()">Más articulos</button>'
            }            

            let wrapper: string = ''
            for (let i = 0; i < data.length; i++){
              wrapper += this.parsing.parseArticle(data[i].headline, data[i].subhead, data[i].body, data[i].date, data[i].author);
            }
            const metaTags: string = this.parsing.parseMetaTags('', '', '')
            const view = {
              'metaTags': metaTags, 
              'wrapper': wrapper, 
              'paging': paging
            }
            const site: string = mustache.render(MasterTemplate, view)
            res.send(site)
          }
        }
      })
    })

    router.get('/', (req: express.Request, res: express.Response)=>{
      res.redirect('/opinion')
    })

    this.app.use('/', router)
  }

  reviewRoutes(router: express.Router = express.Router()) {
    router.get('/json/califica/universidades', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT * FROM public.universities_review_summary`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/califica', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT * FROM public.universities_review_verified`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/universidades', (req: express.Request, res: express.Response) => {
      pgClient.query('SELECT * FROM universities', (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/califica/universidades/:university', (req: express.Request, res: express.Response) => {
      //res.status(200).send(req.params.university)
      pgClient.query(`SELECT * FROM university_summary('${req.params.university}')`, (error, result) => {
        if (error) {
          res.status(200).send(error)
        } 
        if (result.rows.length > 0) {
          const metaTags = this.parsing.parseMetaTags(req.params.university, `${result.rows[0].university} | ${result.rows[0].summary}`, 'califica/universidades/')
          const wrapper = this.parsing.parseUniversity(result.rows[0])
          const view = {'metaTags': metaTags, 'wrapper': wrapper}
          const site = mustache.render(MasterTemplate, view)
          res.send(site)
        } else {
          const wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
          const metaTags = this.parsing.parseMetaTags('404 😥', 'No encontramos ese articulo', 'articulo/')
          const view = {'metaTags': metaTags, 'wrapper': wrapper}
          const site = mustache.render(MasterTemplate, view)
          res.send(site)
        }
      })
    })

    router.get('/json/califica/universidades/:university', (req: express.Request, res: express.Response) => {
      pgClient.query(`SELECT * FROM university_summary('${req.params.university}')`, (error, result) => {
        if (error) {
          res.status(200).send(error)
        } 
        this.parsing.parseUniversity(result.rows[0])
        res.send(result.rows)
      })
    })

    router.get('/califica/universidades', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../view/califica.html'))
    })

    router.post('/califica/universidades', (req: express.Request, res: express.Response) => {
      const captchaSK = process.env.CAPTCHA
      axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSK}&response=${req.body.captcha}`)
      .then((axres: AxiosResponse) => {
        const success: boolean = axres.data.success
        const data: any = req.body
        let result: Array<any>

        if (success === true) {
          const query = `CALL public.insert_university_review('${data.university}', ${data.reputation}, ${data.location}, ${data.events}, ${data.security}, ${data.services}, ${data.cleanliness}, ${data.happiness}, '${data.summary}', ${data.social}, ${data.extracurricular})`
          pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              res.json({
                'success': false,
                'data': pgerror
              })
            } else {
              res.json({
                'success': success,
                'data': pgresult
              })
            }
          })
        } else {
          res.json({
            'success': success,
            'data': result
          })
        }
      }).catch((error: AxiosError) => {
        res.json({
          'success': false,
          'data': error
        })
      })
    })

    router.get('/califica', (req: express.Request, res: express.Response) => {
      res.redirect('/califica/universidades')
    })

    this.app.use('/', router)
  }

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