import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'

export interface HeaderInterface {
  links: {url: string, title: string}[]
}

const template = fs.readFileSync(path.resolve(__dirname, 'Header.html'), 'utf8')

/**
 * Class that represents a Header component
 */
export class HeaderComponent extends Component<HeaderInterface> {
  constructor() {
    const viewData: HeaderInterface = {
      links: [
        {
          title: 'MÚSICA',
          url: '../musica'
        },
        {
          title: 'OPINIÓN',
          url: '../'
        },
        {
          title: 'NOSOTROS',
          url: '../nosotros'
        }
      ]
    }
    super(viewData, template)
  }
}