import { Component } from "../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'

interface MetaTagsInterface {
  title: string
  description: string
  titleLink: string

  img ?: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'metaTags.html'), 'utf8')

/**
 * Class that represents an MetaTags component
 */
export class MetaTagsComponent extends Component<MetaTagsInterface> {
  constructor(viewData: MetaTagsInterface) {
    viewData.img = viewData.img ? viewData.img : 'sindicato-icon-240x240.png'
    super(viewData, template)
  }
}