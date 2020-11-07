import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'

export interface CategoryInterface {
  articles: string[],
  previous?: number,
  next?: number
}

const template = fs.readFileSync(path.resolve(__dirname, 'Category.html'), 'utf8')

/**
 * Class that represents a Category component
 */
export class CategoryComponent extends Component<CategoryInterface> {
  constructor(viewData: CategoryInterface) {
    super(viewData, template)
  }
}