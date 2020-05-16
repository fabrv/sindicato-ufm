import { createServer, Server } from 'http'
import { Client, QueryResult } from 'pg'

import express from 'express'
import session from 'express-session'
import connectReddis from 'connect-redis'

import compression, { filter } from 'compression'

import path from 'path'
import bodyParser from 'body-parser'
import axios, { AxiosResponse, AxiosError } from 'axios'
import redis from 'redis'
import fs from 'fs'

import mustache from 'mustache'

// All main parsing imports
import { Parsing } from './Parsing'
import { ArticleComponent } from './components/article/Article'
import { MetaTagsComponent } from './components/metaTags/MetaTags'
import { MasterComponent } from './components/master/Master'
import { ArticleController } from './controller/articles/article.controller'
import { CalificaController } from './controller/reviews/califica.controller'

const client = redis.createClient(process.env.REDIS_URL)
const RedisStore = connectReddis(session)



const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

interface select {
  val: string, caption: string, selected: string
}

class App{
  public server: Server
  public app: express.Application
  public parsing: Parsing = new Parsing()
  
  private rateTeacherQs = [
    {
      index: 1,
      question: 'Calificación general del catédratico',
      val: 'rate',
      caption: 'Calificación'
    },
    {
      index: 2,
      question: '¿Cuál es la dificultad de ganar con el catédratico?',
      val: 'difficulty',
      caption: 'Dificultad'
    },
    {
      index: 3,
      question: '¿Qué tan accesible es el catedratico?',
      val: 'accessibility',
      caption: 'Accesibilidad'
    }
  ]

  constructor () {
    // App Express
    this.app = express()

    // Use compression
    this.app.use(compression())

    // Use bodyparser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Use express session
    this.app.use(session({
      store: new RedisStore({client: client}),
      secret: process.env.SECRET, 
      resave: false, 
      saveUninitialized: true
    }))

    // Load static files
    this.app.use(express.static(path.resolve(__dirname, '../view')))
    
    // Review routes
    const reviewController = new CalificaController(this.app, pgClient)
    reviewController.reviewRoutes()

    // Article routes
    const articleController = new ArticleController(this.app, pgClient)
    articleController.articleRoutes()

    // Dashboard routes
    this.dashboardRoutes()
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

  /**
   * All global and general routes are defined here,
   * routes that are on the root directory or used by all sections.
   * @param {express.Router} router - Router, new instance of expres.Router() by default.
   */
  generalRoutes(router: express.Router = express.Router()) {
    router.get('/session/destroy', (req: express.Request, res: express.Response) => {
      if (req.session.name) {
        req.session.destroy(() => {
          res.send(';)')
        })
      } else {
        res.send(':(')
      }
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
      const pageBoundary: number = 6
      if (!isNaN(req.query.page)){
        page = parseInt(req.query.page)
      }

      pgClient.query(`SELECT * FROM category_articles_paging('${req.params.category.replace(/[&()'";*]/g, '')}', ${page * (pageBoundary)}, ${pageBoundary + 1});`, (error, result) => {
        
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let i = 0; i < result.rowCount && i < pageBoundary; i++) {
            data.push(result.rows[i])
          }

          if (result.rowCount === 0){
            const wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
          
            const metaTags = new MetaTagsComponent({
              title: '404 😥',
              description: 'No encontramos ese articulo',
              titleLink: 'articulo/'
            })

            const site = new MasterComponent({
              metaTagsComponent: metaTags,
              paging: '',
              wrapper: wrapper
            }).render()

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
              //wrapper += this.parsing.parseArticle(data[i].headline, data[i].subhead, data[i].body, data[i].date, data[i].author);

              wrapper += new ArticleComponent({
                headline: data[i].headline,
                headlineLink: encodeURIComponent(data[i].headline.replace(/ /g, '-')),
                author: data[i].author,
                date: data[i].date,
                subhead: data[i].subhead,
                body: data[i].body
              }).render()
            }

            const metaTags = new MetaTagsComponent({
              title: capitalize(req.params.category),
              description: '',
              titleLink: ''
            })
  
            const site = new MasterComponent({
              metaTagsComponent: metaTags,
              paging: paging,
              wrapper: wrapper
            }).render()
  
            res.send(site)
          }
        }
      })
    })

    router.get('/', (req: express.Request, res: express.Response)=>{
      let page: number = 0
      const pageBoundary: number = 6
      if (!isNaN(req.query.page)){
        page = parseInt(req.query.page)
      }

      pgClient.query(`SELECT * FROM category_articles_paging('opinion', ${page * (pageBoundary)}, ${pageBoundary + 1});`, (error, result) => {
        
        if (error) {
          res.status(500).send(error)
        } else {
          let data = []
          for (let i = 0; i < result.rowCount && i < pageBoundary; i++) {
            data.push(result.rows[i])
          }

          if (result.rowCount === 0){
            const wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
          
            const metaTags = new MetaTagsComponent({
              title: '404 😥',
              description: 'No encontramos ese articulo',
              titleLink: 'articulo/'
            })

            const site = new MasterComponent({
              metaTagsComponent: metaTags,
              paging: '',
              wrapper: wrapper
            }).render()

            res.send(site)
          } else {
            let paging: string = ''
            if (page > 0){
              paging += `<a class="pager btn" id="less" href="?page=${page - 1}">Anterior página</a>`
            }
            if (result.rowCount === pageBoundary + 1) {
              paging += `<a class="pager btn" id="more" href="?page=${page + 1}">Siguiente página</a>`
            }            

            let wrapper: string = ''
            for (let i = 0; i < data.length; i++){
              //wrapper += this.parsing.parseArticle(data[i].headline, data[i].subhead, data[i].body, data[i].date, data[i].author);

              wrapper += new ArticleComponent({
                headline: data[i].headline,
                headlineLink: encodeURIComponent(data[i].headline.replace(/ /g, '-')),
                author: data[i].author,
                date: data[i].date,
                subhead: data[i].subhead,
                body: data[i].body
              }).render()
            }

            const metaTags = new MetaTagsComponent({
              title: '',
              description: 'Somos es una plataforma independiente de estudiantes para poder exponer opiniones libres sin adoctrinamiento forzada.',
              titleLink: ''
            })
            
            const site = new MasterComponent({
              metaTagsComponent: metaTags,
              paging: paging,
              wrapper: wrapper
            }).render()

            res.send(site)
          }
        }
      })
    })

    this.app.use('/', router)
  }

  dashboardRoutes(router: express.Router = express.Router()) {
    router.get('/dashboard/login', (req: express.Request, res: express.Response)=>{
      if (req.query.username && req.query.password) {
        const query = `SELECT * FROM validate_credential('${req.query.username.replace(/[&()\-'"*]/g, '')}', '${req.query.password.replace(/[&()\-'"*]/g, '')}')`
        pgClient.query(query, (pgerror, pgresult) => {
          if (pgerror) {
            return res.status(500).send({error: pgerror.message})
          } else {
            if (pgresult.rowCount == 0) {
              return res.status(200).send(false)
            } else {
              req.session.name = req.query.username
              return res.status(200).send(pgresult.rows[0].password)
            }
          }
        })
      } else {
        return res.status(400).send({error: 'Invalid request, missing query parameters'})
      }
    })

    router.get('/dashboard/session', (req: express.Request, res: express.Response)=>{
      if (!req.session.name) {
        return res.status(200).send(false)
      } else {
        return res.status(200).send(true)
      }
    })

    router.delete('/dashboard/session', (req: express.Request, res: express.Response)=>{
      req.session.destroy((err)=> {
        if (err) {
          return res.json({
            'success': false,
            'status': 'Unable to destroy session'
          })
        }
        return res.json({
          'success': true,
          'status': 'Session succesfully destroyed'
        })
      })
    })

    router.get('/dashboard/articles',(req: express.Request, res: express.Response)=>{
      if (req.session.name) {
        pgClient.query(`SELECT views, subhead, body, headline, author, category, date FROM "ARTICLE" WHERE created_by = '${req.session.name}' ORDER BY created DESC`, (pgerror, pgresult) => {
          if (pgerror) {
            return res.status(500).send({error:pgerror})
          }
          const template = fs.readFileSync(path.resolve(__dirname, 'components/dashboard/profile.html'), 'utf8')
          for (let i = 0; i < pgresult.rowCount; i++) {
            pgresult.rows[i].body = pgresult.rows[i].body.replace(/`/g, '&96;')
          }
          const view = {'articles': pgresult.rows}
          const site = mustache.render(template, view)
          return res.send(site)
        })
      } else {
        res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    router.get('/dashboard/moderation', (req: express.Request, res: express.Response)=>{
      if (req.session.name) {
        pgClient.query('SELECT * FROM university_unverified_reviews()', (pgerror, pgresult) => {
          if (pgerror) {
            return res.status(500).send({error:pgerror})
          }
          const template = fs.readFileSync(path.resolve(__dirname, 'components/dashboard/moderation.html'), 'utf8')
          for (let i = 0; i < pgresult.rowCount; i ++) {
            const jsDate = new Date(pgresult.rows[i].date)
            //const sqlDate = `${jsDate.getUTCFullYear()}-${jsDate.getUTCMonth()}-${jsDate.getUTCDate()} ${jsDate.getUTCHours()}:${jsDate.getUTCMinutes()}:${jsDate.getUTCSeconds()}.${jsDate.getUTCMilliseconds()}+00`
            const sqlDate = jsDate.toISOString().replace('T', ' ').replace('Z', '');
            pgresult.rows[i].date = sqlDate
          }
          const view = {'categories': [{name: 'calificacion'}], 'reviews': pgresult.rows}
          const site = mustache.render(template, view)
          return res.send(site)
        })
      } else {
        res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })
    
    router.patch('/dashboard/user', (req: express.Request, res: express.Response)=>{
      if (req.session.name) {
        if (req.query.username && req.query.password) {
          const query = `CALL update_credential('${req.query.username.replace(/[&()\-'"*]/g, '')}', '${req.query.password.replace(/[&()\-'"*]/g, '')}')`
          pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              console.log(pgerror)
              return res.status(500).send({error: pgerror})
            } else {
              return res.status(200).send({success: true, data: pgresult.rows})
            }
          })
        } else {
          return res.status(400).send({error: 'Invalid request, missing query parameters'})
        }
      } else {
        res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })
    this.app.use('/', router)
  }
}

function capitalize(s: string) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

//Export app
export default new App()