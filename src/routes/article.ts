import { Client } from 'pg'
import { Router, Request, Response } from 'express'
import { article, ArticleService } from '../services/ArticleService'

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

  router.get('/:header/json', async (req: Request, res: Response) => {
    
  })

  return router
}