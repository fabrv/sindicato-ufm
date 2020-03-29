import { Component } from "../../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'
import { StarsComponent } from "../stars/Stars";

interface UniversityInterface {
  university: string
  summary: string
  rating: number
  reviews: string
  imagelink: string
  ratings: Array<{description: string, value: string}>
  stars ?: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'university.html'), 'utf8')

/**
 * Class that represents a University component
 */
export class UniversityComponent extends Component<UniversityInterface> {
  constructor(viewData: UniversityInterface) {
    viewData.stars = new StarsComponent(viewData.rating, 5).parse()
    super(viewData, template)
  }
}