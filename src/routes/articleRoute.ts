import { Client } from 'pg'
import { Router, Request, Response } from 'express'
import { ArticleService } from '../services/ArticleService'
import { ArticleComponent } from '../components/Article/Article'
import { MasterComponent } from '../components/Master/Master'

export function articleRoute(pgClient: Client) {
  const router = Router()
  const articleService = new ArticleService(pgClient)

  router.get('/json', (req: Request, res: Response) => {
    const limit = req.query.limit ?? 25
    const offset = req.query.offset ?? 0
    articleService.getArticles(parseInt(<string>limit), parseInt(<string>offset)).then(articles => {
      res.send(articles)
    }).catch(error => {
      res.status(500).send({data: error})
    })
  })

  router.get('/:headline/json', (req: Request, res: Response) => {
    const headline = req.params.headline.replace(/_/g, ' ')
    articleService.getArticle(headline).then(article => {
      res.send(article)
    }).catch(error => {
      res.status(500).send({data: error})
    })
  })

  router.get('/:headline', (req: Request, res: Response) => {
    const headline = req.params.headline.replace(/_/g, ' ')
    articleService.getArticle(headline).then(article => {

      const articleComponent = new ArticleComponent({
        author: article.author,
        body: article.body,
        date: article.date,
        headline: article.headline,
        headlineLink: headline.replace(/ /g, '_'),
        subhead: article.subhead
      }).render()

      res.send(new MasterComponent(articleComponent, headline).render())
    }).catch(error => {
      console.error(error)
      res.status(500).send({data: error})
    })
  })

  return router
}