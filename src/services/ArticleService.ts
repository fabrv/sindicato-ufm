import DbService from "./DbService"

export interface article {
  views: number,
  subhead: string,
  headline: string,
  body: string,
  author: string,
  category: string,
  date: string,
  created: Date,
  last_edited: Date,
  created_by: string
}

export class ArticleService extends DbService{
  async getArticles (limit: number, offset: number): Promise<article[]> {
    if (isNaN(limit) || isNaN(offset)) {
      throw new Error('Incorrect data type for limit or offset')
    }
    return (await this.client.query(`select * from "ARTICLE" limit ${limit} offset ${offset}`)).rows
  }
}