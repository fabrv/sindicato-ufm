import { Router, Request, Response } from 'express'
import { Client } from 'pg'
import { ArticleComponent } from '../components/Article/Article'
import { CategoryComponent } from '../components/Category/Category'
import { MasterComponent } from '../components/Master/Master'
import { ArticleService } from '../services/ArticleService'

export function categoryRoute(pgClient: Client) {
  const router = Router()
  const articleService = new ArticleService(pgClient)

  router.get('/json', (req: Request, res: Response) => {
    const limit = req.query.limit ?? 25
    const offset = req.query.offset ?? 0
    articleService.getCategory('opinion', parseInt(<string>limit), parseInt(<string>offset)).then(articles => {
      res.send(articles)
    }).catch(error => {
      res.status(500).send({data: error})
    })
  })

  router.get('/:category/json', (req: Request, res: Response) => {
    const limit = req.query.limit ?? 25
    const offset = req.query.offset ?? 0
    articleService.getCategory(req.params.category, parseInt(<string>limit), parseInt(<string>offset)).then(articles => {
      res.send(articles)
    }).catch(error => {
      res.status(500).send({data: error})
    })
  })

  router.get('/:category', (req: Request, res: Response) => {
    const page = isNaN(parseInt(<string>req.query.page)) ? 0 : parseInt(<string>req.query.page)
    articleService.getCategory(req.params.category, 11, 10 * page).then(articles => {
      const comps = articles.map(article => {
        return new ArticleComponent({
          author: article.author,
          body: article.body,
          date: article.date,
          headline: article.headline,
          headlineLink: article.headline.replace(/ /g, '-'),
          subhead: article.subhead
        }).render()
      })

      const categoryComponent = new CategoryComponent({
        articles: comps,
        next: articles.length === 11 ? page + 1 : undefined,
        previous: page > 0 ? page - 1 : undefined,
      }).render()

      res.send(new MasterComponent(categoryComponent, req.params.category).render())
    }).catch(error => {
      res.status(500).send({data: error})
    })
  })

  return router
}