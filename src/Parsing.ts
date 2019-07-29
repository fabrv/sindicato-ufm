import fs from 'fs'
import mustache from 'mustache'
import * as path from 'path'

import showdown from 'showdown'

export class Parsing {
  constructor (){}

  /**
   * Parses articles
   * @param headline 
   * @param subhead 
   * @param body 
   * @param date 
   * @param author 
   */
  parseArticle(headline: string, subhead: string, body: string, date: string, author:string): string{
    const template = fs.readFileSync(path.resolve(__dirname, 'templates/article.html'), 'utf8')
    const converter = new showdown.Converter({tables: true, strikethrough: true})
    const parsedBody = converter.makeHtml(body)
    const view = {
      'headlineLink': encodeURIComponent(replaceAll(headline, ' ', '_')),
      'headline': headline,
      'subhead': subhead,
      'body': parsedBody,
      'date': date,
      'author': author
    }
    const article = mustache.render(template, view)
    return article
  }
  
  /**
   * Parses university pages
   * @param {object} uniSummary - Postgres return from a unisummary request
   */
  parseUniversity(uniSummary: any) {
    let template = fs.readFileSync(path.resolve(__dirname, 'templates/university.html'), 'utf8')
    let ratings: Array<{description: string, value: string}> = []
    for (let item in uniSummary) {
      if (item !== 'university' && item !== 'summary' && item !== 'imagelink' && item !== 'reviews' && item !== 'rating') {
        ratings.push({description: item, value: uniSummary[item]})
      }
    }
    const view = {
      'university': uniSummary.university,
      'summary': uniSummary.summary,
      'imagelink': uniSummary.imagelink,
      'reviews': uniSummary.reviews,
      'stars': this.starRatingParser(uniSummary.rating, 5),
      'rating': uniSummary.rating,
      'ratings': ratings
    }
    const rendered = mustache.render(template, view)
    return rendered
  }

  /**
   * Returns an HTML star for different ratios.
   * @param value dividend for star percentage.
   * @param max divisor for star percentage.
   */
  starRatingParser(value: number, max: number) {
    if (value > max) value = max
    let stars = Math.round((value / max) * 5)
    let html = ''
    for (let i = 0; i < stars; i++){
      html += '<span class="checked">&#x2605;</span>'
    }
    for (let i = 0; i < (max - stars); i++){
      html += '<span>&#x2605;</span>'
    }
    return html
  }

  /**
   * Parses ogp meta tags for social media sharing
   * @param title 
   * @param description 
   * @param location 
   * @param img 
   */
  parseMetaTags(title: string, description: string, location: string, img: string = 'sindicato-icon-240x240.png'): string{
    const template = fs.readFileSync(path.resolve(__dirname, 'templates/metaTags.html'), 'utf8')
    const view = {
      'titleLink': replaceAll(title, ' ', '_'),
      'title': title,
      'description': description,
      'img': img,
      'location': location    
    }
    const metaTags = mustache.render(template, view)
    return metaTags
  }
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}