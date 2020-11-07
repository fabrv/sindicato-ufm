import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'
import { FooterComponent } from '../Footer/Footer'
import { HeaderComponent } from '../Header/Header'

export interface MasterInterface {
  content: string,
  header: string, 
  footer: string,
  title?: string
}

const template = fs.readFileSync(path.resolve(__dirname, 'Master.html'), 'utf8')

/**
 * Class that represents a Master component
 */
export class MasterComponent extends Component<MasterInterface> {
  constructor(content: string, title?: string) {
    const viewData: MasterInterface = {
      content: content,
      header: new HeaderComponent().render(),
      footer: new FooterComponent().render(),
      title: title
    }
    super(viewData, template)
  }
}