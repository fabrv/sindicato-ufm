import { Component } from "../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'

interface ArticleInterface {
  headline: string
  headlineLink: string
  author: string
  date: string
  subhead: string
  body: string
}

const articleTemplate = fs.readFileSync(path.resolve(__dirname, 'article.html'), 'utf8')

/**
 * Class that represents an Article component
 */
export class ArticleComponent extends Component<ArticleInterface> {
  constructor(viewData: ArticleInterface) {
    super(viewData, articleTemplate)
  }
}