import { Component } from "../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'
import { MetaTagsComponent } from "../metaTags/MetaTags";

interface MasterInterface {
  metaTagsComponent: MetaTagsComponent
  wrapper: string
  paging: string

  header ?: string
  footer ?: string
  metaTags ?: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'Master.html'), 'utf8')
const header = fs.readFileSync(path.resolve(__dirname, 'header.html'), 'utf8')
const footer = fs.readFileSync(path.resolve(__dirname, 'footer.html'), 'utf8')

/**
 * Class that represents an Master component
 */
export class MasterComponent extends Component<MasterInterface> {
  constructor(viewData: MasterInterface) {
    viewData.metaTags = viewData.metaTagsComponent.parse()
    viewData.header = header
    viewData.footer = footer
    super(viewData, template)
  }
}