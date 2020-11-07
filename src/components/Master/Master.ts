import { Component } from 'bigojs'
import fs from 'fs'
import path from 'path'

export interface MasterInterface {
  
}

const template = fs.readFileSync(path.resolve(__dirname, 'Master.html'), 'utf8')

/**
 * Class that represents a Master component
 */
export class MasterComponent extends Component<MasterInterface> {
  constructor(viewData: MasterInterface) {
    super(viewData, template)
  }
}