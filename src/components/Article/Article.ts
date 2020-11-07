import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'
import showdown from "showdown"

export interface ArticleInterface {
  headline: string
  headlineLink: string
  author: string
  date: string
  subhead: string
  body: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'Article.html'), 'utf8')

/**
 * Class that represents a Article component
 */
export class ArticleComponent extends Component<ArticleInterface> {
  constructor(viewData: ArticleInterface) {
    super(viewData, template)

    const converter = new showdown.Converter({tables: true, strikethrough: true})
    viewData.body = converter.makeHtml(viewData.body)
  }
}