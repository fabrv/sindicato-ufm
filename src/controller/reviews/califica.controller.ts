import { Client } from 'pg'

import express from 'express'
import path from 'path'
import axios, { AxiosResponse, AxiosError } from 'axios'

// All main parsing imports
import { ArticleComponent } from '../../components/article/Article'
import { MetaTagsComponent } from '../../components/metaTags/MetaTags'
import { MasterComponent } from '../../components/master/Master'
import { UniversityComponent } from '../../components/reviews/university/University'
import { StarsComponent } from '../../components/reviews/stars/Stars'
import { UniReviewsComponent } from '../../components/reviews/uni-reviews/UniReviews'
import { ReviewFilterComponent, ReviewFilterInterface, TeachersInterface } from '../../components/reviews/reviewFilter/ReviewFilter'
import { TeacherReviewComponent, TeacherReviewInterface, QuestionInterface } from '../../components/reviews/teacherReview/TeacherReview'

export class CalificaController {
  private app: express.Application
  private pgClient: Client

  private rateTeacherQs: Array<QuestionInterface> = [
    {
      index: 1,
      question: 'Calificación general del catédratico',
      val: 'rate',
      caption: 'Calificación'
    },
    {
      index: 2,
      question: '¿Cuál es la dificultad de ganar con el catédratico?',
      val: 'difficulty',
      caption: 'Dificultad'
    },
    {
      index: 3,
      question: '¿Qué tan accesible es el catedratico?',
      val: 'accessibility',
      caption: 'Accesibilidad'
    }
  ]

  constructor(app: express.Application, pgClient: Client) {
    this.app = app
    this.pgClient = pgClient
  }

  /**
   * All routes related to reviews are defined here.
   * @param {express.Router} router - Router, new instance of expres.Router() by default.
   */
  reviewRoutes(router: express.Router = express.Router()) {
    router.get('/json/califica/universidades', (req: express.Request, res: express.Response) => {
      this.pgClient.query(`SELECT * FROM public.universities_review_summary`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/califica', (req: express.Request, res: express.Response) => {
      this.pgClient.query(`SELECT * FROM public.universities_review_verified`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/universidades', (req: express.Request, res: express.Response) => {
      this.pgClient.query('SELECT * FROM universities', (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/json/califica/catedraticos/filter', (req: express.Request, res: express.Response) => {
      if (req.query.search) {
        let query = `SELECT * FROM filter_teachers('${req.query.search.replace(/[&()\-'"*]/g, '')}')`

        if (req.query.university) {
          query += ` WHERE university = '${req.query.university.replace(/[&()\-'"*]/g, '')}'`
        }
        this.pgClient.query(query, (error, result: any) => {
          if (error) {
            return res.status(500).send(error)
          } else {
            return res.status(200).send(result.rows)
          }
        })
      } else {
        return res.status(400).send('Insufficient parameters sent.')
      }
    })

    router.get('/json/califica/universidades/:university/catedraticos', (req: express.Request, res: express.Response) => {
      let limit = parseInt(req.query.limit) || 20
      this.pgClient.query(`SELECT * FROM university_teachers('${req.params.university.replace(/[&()\-'"*]/g, '')}') LIMIT ${limit}`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          res.status(200).send(result.rows)
        }
      })
    })

    router.get('/califica/universidades/:university', (req: express.Request, res: express.Response) => {
      //res.status(200).send(req.params.university)
      this.pgClient.query(`SELECT * FROM university_summary('${req.params.university}')`, (error, result) => {
        if (error) {
          res.status(200).send(error)
        } 
        if (result.rows.length > 0) {
          const metaTags = new MetaTagsComponent({
            title: req.params.university,
            description: `${result.rows[0].university} | ${result.rows[0].summary}`,
            titleLink: 'califica/universidades/'
          })

          let ratings: Array<{description: string, value: string}> = []
          for (let item in result.rows[0]) {
            if (item !== 'university' && item !== 'summary' && item !== 'imagelink' && item !== 'reviews' && item !== 'rating') {
              ratings.push({description: item, value: result.rows[0][item]})
            }
          }

          const wrapper = new UniversityComponent({
            university: result.rows[0].university,
            summary: result.rows[0].summary,
            rating: result.rows[0].rating,
            reviews: result.rows[0].reviews,
            imagelink: result.rows[0].imagelink,
            ratings: ratings
          }).render()

          const site = new MasterComponent({
            metaTagsComponent: metaTags,
            paging: '',
            wrapper: wrapper
          }).render()

          res.send(site)
        } else {
          const wrapper = '<h1>404 😥</h1> <p>No encontramos ese articulo, pero quizás encontrés algo interesante <a href="../">aquí</a></p>'
          
          const metaTags = new MetaTagsComponent({
            title: '404 😥',
            description: 'No encontramos ese articulo',
            titleLink: 'articulo/'
          })

          const site = new MasterComponent({
            metaTagsComponent: metaTags,
            paging: '',
            wrapper: wrapper
          }).render()

          res.send(site)
        }
      })
    })

    router.get('/json/califica/universidades/:university', (req: express.Request, res: express.Response) => {
      this.pgClient.query(`SELECT * FROM university_summary('${req.params.university}')`, (error, result) => {
        if (error) {
          res.status(200).send(error)
        }
        res.send(result.rows)
      })
    })

    router.get('/califica/universidades/:university/reviews', (req: express.Request, res: express.Response) => {
      const page = parseInt(req.params.page) || 0
      this.pgClient.query(`SELECT * FROM university_reviews_paging('${req.params.university}', ${page})`, (error, result) => {
        if (error) {
          res.status(500).send(error)
        } else {
          for (let i: number = 0; i < result.rowCount; i++) {
            result.rows[i].stars = new StarsComponent(result.rows[i].rate, 5).render()
            result.rows[i].date = JSON.stringify(result.rows[i].date).substr(1, 24)
            result.rows[i].dateText = result.rows[i].date.substr(0, 10)
          }
          const site = new UniReviewsComponent({reviews: result.rows}).render()

          res.status(200).send({length: result.rowCount, html: site})
        }
      })
    })

    router.get('/califica/filtro', (req: express.Request, res: express.Response) => {
      const possibleOrders = ['asc', 'desc']
      
      req.query.nombre = req.query.nombre == null ? '' : req.query.nombre
      req.query.clase = req.query.clase == null ? '' : req.query.clase
      req.query.universidad = req.query.universidad == null ? '' : req.query.universidad
      req.query.orden = req.query.orden == null || !possibleOrders.includes(req.query.orden) ? 'asc' : req.query.orden

      for (const query in req.query) {
        req.query[query] = req.query[query].replace(/[&()\-;'"*]/g, '')
      }
      
      const filterInfo: ReviewFilterInterface = {
        name: req.query.nombre,
        class: req.query.clase,
        universities: [],
        orders: [],
        teachers: [],
        reviewModal: ''
      }

      const orders = [
        {val: 'asc', caption: 'Ascendente', selected: ''},
        {val: 'desc', caption: 'Descendente', selected: ''}
      ]
      
      for (let i = 0; i < 2; i++) {
        if (req.query.orden === orders[i].val) {
          orders[i].selected = 'selected'
        }
        filterInfo.orders.push(orders[i])
      }
      
      this.pgClient.query(`SELECT * FROM filter_teacher_reviews('${req.query.universidad}', '${req.query.nombre}', '${req.query.clase}', 0) ORDER BY rate_avg ${req.query.orden}; SELECT name as caption, acronym as val FROM universities;`, (error, result: any) => {
        if (error) {
          res.status(500).send(error)
        } else {
          const teachersView = []
          for (let i = 0; i < result[0].rows.length; i++) {
            const teacher: TeachersInterface = {
              name: result[0].rows[i].teacher,
              rating: new StarsComponent(result[0].rows[i].rate_avg, 5).render(),
              summary: result[0].rows[i].review
            }

            teachersView.push(teacher)
          }

          filterInfo.teachers = teachersView

          for (let i = 0; i < result[1].rowCount; i++) {
            if (req.query.universidad === result[1].rows[i].val) {
              result[1].rows[i].selected = 'selected'
            }
          }

          filterInfo.universities = result[1].rows

          const modalView: TeacherReviewInterface = {
            questions: this.rateTeacherQs,
            universities: result[1].rows
          }

          const wrapper = new ReviewFilterComponent({
            name: filterInfo.name,
            class: filterInfo.class,
            orders: filterInfo.orders,
            teachers: filterInfo.teachers,
            universities: filterInfo.universities,
            reviewModal: new TeacherReviewComponent(modalView).render()
          }).render()

          const site = new MasterComponent({
            wrapper: wrapper,
            paging: '',
            metaTagsComponent: new MetaTagsComponent({
              title: 'Calificá y compará tu U, cursos y catedraticos',
              description: '',
              titleLink: '/califica/filtro'
            })
          }).render()

          res.status(200).send(site)
        }
      })
    })

    router.get('/califica/universidades', (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, '../../../view/califica.html'))
    })

    router.post('/califica/universidades', (req: express.Request, res: express.Response) => {
      const captchaSK = process.env.CAPTCHA
      axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSK}&response=${req.body.captcha}`)
      .then((axres: AxiosResponse) => {
        const success: boolean = axres.data.success
        const data: any = req.body
        let result: Array<any>

        if (success === true && axres.data.score > 0.5) {
          const query = `CALL public.insert_university_review('${data.university.replace(/[&()\-'"*]/g, '')}', ${data.reputation}, ${data.location}, ${data.events}, ${data.security}, ${data.services}, ${data.cleanliness}, ${data.happiness}, '${data.summary.replace(/[&'"*]/g, '')}', ${data.social}, ${data.extracurricular})`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              res.json({
                'success': false,
                'data': pgerror
              })
            } else {
              res.json({
                'success': success,
                'data': pgresult
              })
            }
          })
        } else {
          res.json({
            'success': success,
            'data': result
          })
        }
      }).catch((error: AxiosError) => {
        res.json({
          'success': false,
          'data': error
        })
      })
    })

    router.patch('/califica/universidades', (req: express.Request, res: express.Response) => {
      if (req.session.name) {
        if (req.query.university && req.query.date) {
          const query = `CALL validate_review('${req.query.university.replace(/[&()\-'"*]/g, '')}', '${req.query.date.replace(/[&()\-'"*]/g, '')}')`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              return res.status(500).send({'success': false, 'error': pgerror})
            } else {
              return res.status(200).send({'success': true, 'data': pgresult})
            }
          })
        } else {
          return res.status(400).send('Insufficient parameters sent.')
        }
      } else {
        return res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    router.patch('/califica/universidades/vote', (req: express.Request, res: express.Response) => {
      const captchaSK = process.env.CAPTCHA
      let sessionVotes = req.session.votes || []
      if (sessionVotes.includes(req.body.date)) {
        return res.status(200).send({'success': false, 'data': [1, 'Session already voted for this review.']})
      } else {
        if (req.body.vote && req.body.university && req.body.date && req.body.captcha) {
          axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSK}&response=${req.body.captcha}`)
          .then((axres: AxiosResponse) => {
            const success: boolean = axres.data.success
            let result: Array<any>
  
            if (success === true && axres.data.score > 0.5) {
              const query = `CALL vote_uni_review('${req.body.university}', '${req.body.date}', ${req.body.vote})`
              this.pgClient.query(query, (pgerror, pgresult) => {
                if (pgerror) {
                  return res.status(500).send({'success': false, 'error': pgerror})
                } else {
                  sessionVotes.push(req.body.date)
                  req.session.votes = sessionVotes
                  return res.status(200).send({'success': true, 'data': pgresult})
                }
              })
            } else {
              console.log('bot:', axres.data.score)
              return res.status(200).send({'success': false, 'data': [0, 'Possible bot detected']})
            }
          })
        } else {
          return res.status(400).send('Insufficient parameters sent.')
        }
      }
    })

    router.delete('/califica/universidades', (req: express.Request, res: express.Response) => {
      if (req.session.name){
        if (req.query.university && req.query.date) {
          const query = `CALL delete_university_review('${req.query.university.replace(/[&()\-'"*]/g, '')}', '${req.query.date.replace(/[&()\-'"*]/g, '')}')`
          this.pgClient.query(query, (pgerror, pgresult) => {
            if (pgerror) {
              return res.status(500).send({'success': false, 'error': pgerror})
            } else {
              return res.status(200).send({'success': true, 'data': pgresult})
            }
          })
        } else {
          return res.status(400).send('Insufficient parameters sent.')
        }
      } else {
        return res.status(401).send('Unathorized access, credentials expired or invalid.')
      }
    })

    router.get('/califica', (req: express.Request, res: express.Response) => {
      res.redirect('/califica/universidades')
    })

    this.app.use('/', router)
  }
}