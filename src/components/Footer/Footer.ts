import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'
import { HeaderInterface } from '../Header/Header'

const template = fs.readFileSync(path.resolve(__dirname, 'Footer.html'), 'utf8')

/**
 * Class that represents a Footer component
 */
export class FooterComponent extends Component<HeaderInterface> {
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