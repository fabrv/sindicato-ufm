import { Component } from "../../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'

interface SelectInterface {
  val: string
  selected: string
  caption: string
}

interface TeachersInterface {
  summary: string
  name: string
  rating: string
}

interface ReviewFilterInterface {
  name: string
  universities: Array<SelectInterface>
  orders: Array<SelectInterface>
  teachers: Array<TeachersInterface>
  reviewModal: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'reviewFilter.html'), 'utf8')

/**
 * Class that represents an ReviewFilter component
 */
export class ReviewFilterComponent extends Component<ReviewFilterInterface> {
  constructor(viewData: ReviewFilterInterface) {
    super(viewData, template)
  }
}