import { Client, QueryResult } from 'pg'

import express from 'express'

// All main parsing imports
import { ArticleComponent } from '../../components/article/Article'
import { MetaTagsComponent } from '../../components/metaTags/MetaTags'
import { MasterComponent } from '../../components/master/Master'

export class ArticleController {
  private app: express.Application
  private pgClient: Client

  constructor(app: express.Application, pgClient: Client) {
    this.app = app
    this.pgClient = pgClient
  }

  /**
   * All routes related to articles are defined here.
   * @param {express.Router} router - Router, new instance of expres.Router() by default.
   */
  articleRoutes(router: express.Router = express.Router()) {
    router.get('/json/articulo/:article', (req: express.Request, res: express.Response) => {
      const article = req.params.article.replace(/[_-]/g, ' ')
      this.pgClient.query(`SELECT * FROM public."ARTICLE" WHERE "headline" = '${article.replace(/[&()\-'"*]/g, '')}'`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows[0])
        }
      })
    })

    router.get('/articulo/:article', (req: express.Request, res: express.Response) => {
      let wrapper: string
      let metaTags: MetaTagsComponent
      const pArticle = req.params.article.replace(/[_-]/g, ' ')

      this.pgClient.query(`UPDATE public."ARTICLE" SET "views" = "views" + 1 WHERE "headline" = '${pArticle}'; SELECT * FROM public."ARTICLE" WHERE "headline" = '${pArticle}';`, (error, result: any) => {
        if (error) {
          res.status(500).send(error)
        } else {
          if (result[1].rowCount > 0) {
            
            const article = result[1].rows[0]
            //wrapper = this.parsing.parseArticle(article.headline, article.subhead, article.body, article.date, article.author)
            wrapper = new ArticleComponent({
              headline: article.headline,
              headlineLink: encodeURIComponent(article.headline.replace(/ /g, '-')),
              author: article.author,
              date: article.date,
              subhead: article.subhead,
              body: article.body
            }).render()

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
                    metaTags = 
                    new MetaTagsComponent({
                      title: article.headline,
                      description: article.subhead,
                      titleLink: 'articulo/',
                      img: imgString
                    })
                    i = article.body.length
                  }
                }
              }
            }else{
              metaTags = new MetaTagsComponent({
                title: article.headline,
                description: article.subhead,
                titleLink: 'articulo/'
              })
            }
          } else {
            wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
            metaTags = new MetaTagsComponent({
              title: '404 😥',
              description: 'No encontramos ese articulo',
              titleLink: 'articulo/'
            })
          }          
          
          const site = new MasterComponent({
            metaTagsComponent: metaTags,
            paging: '',
            wrapper: wrapper
          }).render()
          
          res.send(site)
        }
      })
    })

    router.patch('/articulo', (req: express.Request, res: express.Response) => {
      if (req.session.name) {
        const data: any = req.body
        const query = `CALL public.update_article('${data.subhead.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.headline.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.body.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.author.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.category.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.pkHeadline}')`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              res.json({
                'success': false,
                'data': pgerror
              })
            } else {
              res.json({
                'success': true,
                'data': pgresult
              })
            }
          })
      } else {
        return res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    router.post('/articulo', (req: express.Request, res: express.Response) => {
      if (req.session.name) {
        const data: any = req.body
        const query = `CALL public.insert_article('${data.subhead.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.headline.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.body.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.author.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.category.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.date.replace(/`/g, '\x60').replace(/'/g, '&#39;')}', '${data.user.replace(/`/g, '\x60').replace(/'/g, '&#39;')}')`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              res.json({
                'success': false,
                'data': pgerror
              })
            } else {
              res.json({
                'success': true,
                'data': pgresult
              })
            }
          })
      } else {
        return res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    router.delete('/articulo', (req: express.Request, res: express.Response) => {
      if (req.session.name) {
        const data: any = req.body
        const query = `CALL public.delete_article('${data.headline.replace(/`/g, '\x60').replace(/'/g, '&#39;')}')`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              res.json({
                'success': false,
                'data': pgerror
              })
            } else {
              res.json({
                'success': true,
                'data': pgresult
              })
            }
          })
      } else {
        return res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    this.app.use('/', router)
  }

}