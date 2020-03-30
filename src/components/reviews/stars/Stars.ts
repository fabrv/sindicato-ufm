import { Component } from "../../../RenderEngine/Component";
import fs from 'fs'
import path from 'path'

interface StarsInterface {
  fill: Array<string>
  empty: Array<string>
}

const template = fs.readFileSync(path.resolve(__dirname, 'stars.html'), 'utf8')

/**
 * Class that represents an Stars component
 */
export class StarsComponent extends Component<StarsInterface> {
  constructor(value: number, max: number) {
    const fills: number = Math.round((value / max) * 5)
    super({ 
      fill: Array(fills).fill(''), 
      empty: Array(5 - fills).fill('')
    }, template)
  }
}