import { Component } from "../../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'

interface ReviewInterface {
  dateText: string
  summary: string
  stars: string
  rate: string
  reputation: string
  cleanliness: string
  extracurricular: string
  security: string
  happiness: string
  university: string
  date: string
}

interface UniReviewsInterface {
  reviews: Array<ReviewInterface>
}

const template = fs.readFileSync(path.resolve(__dirname, 'uni-reviews.html'), 'utf8')

/**
 * Class that represents an Uni-reviews component
 */
export class UniReviewsComponent extends Component<UniReviewsInterface> {
  constructor(viewData: UniReviewsInterface) {
    super(viewData, template)
  }
}