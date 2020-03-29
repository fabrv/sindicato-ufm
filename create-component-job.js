function f (name) {
  return `
  import { Component } from "../../RenderEngine/Component";
  import fs from 'fs'
  import path from 'path'
  
  interface ${name}Interface {
    
  }
  
  const template = fs.readFileSync(path.resolve(__dirname, '${name.toLowerCase()}.html'), 'utf8')
  
  /**
   * Class that represents a ${name} component
   */
  export class ${name}Component extends Component<${name}Interface> {
    constructor(viewData: ${name}Interface) {
      super(viewData, template)
    }
  }`
}
