import mustache from "mustache";

/**
 * Class that represents a <View, Template> Component
 */
export class Component<T> {
  private _viewData: T
  private _template: string

  /**
   * 
   * @param viewData {T} The information that will be rendered on the page
   * @param template {string} The HTML template itself
   */
  constructor(viewData: T, template: string) {
    this._viewData = viewData
    this._template = template
  }

  /**
   * Get the parsed page in plain HTML text
   * @returns {string} Parsed HTML text
   */
  render(): string {
    return mustache.render(this._template, this._viewData)
  }
}