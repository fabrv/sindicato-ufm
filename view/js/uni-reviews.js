const dir = { 1: 'Up', '-1': 'Down' }
const teacherSummary = document.getElementById('teachers-summary')
const teachersTemplate = `
<tr>
  <td><b>Catedratico</b></td>
  <td><b>Calificación</b></td>
  <td><b>Volvería a tomar</b></td>
</tr>
{{#teachers}}
<tr>
  <td><a href="#">{{teacher}}</a></td>
  <td>{{rate_avg}} / 5</td>
  <td>{{repeat_avg}}%</td>
</tr>
{{/teachers}}
`

let teachersLimit = 20
let reviewsPage = 0

init()

async function init () {
  loadTeachers()
  loadReviews()
}

function loadTeachers (limit = 20) {
  // eslint-disable-next-line no-undef
  const Http = new XMLHttpRequest()
  const currURL = new URL(window.location.href)
  const params = `../json${currURL.pathname}/catedraticos?limit=${limit}`
  Http.open('GET', params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState === 4 && Http.status === 200) {
      renderTeachers({ teachers: JSON.parse(Http.response) })
      showMoreTeachersButton(JSON.parse(Http.response).length)
    }
  }
}

function loadReviews (page = 0) {
  // eslint-disable-next-line no-undef
  const Http = new XMLHttpRequest()
  const currURL = new URL(window.location.href)
  const params = `..${currURL.pathname}/reviews?page=${page}`
  Http.open('GET', params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState === 4 && Http.status === 200) {
      document.getElementById('reviews').innerHTML += JSON.parse(Http.response).html
      showMoreReviewsButton(JSON.parse(Http.response).length)
    }
  }
}

function showMoreTeachersButton (returnLength) {
  if (returnLength < teachersLimit) {
    document.getElementById('load-more-teachers').classList.add('no-show')
  } else {
    document.getElementById('load-more-teachers').classList.remove('no-show')
  }
}

function showMoreReviewsButton (returnLength) {
  if (returnLength < 10) {
    document.getElementById('load-more-reviews').classList.add('no-show')
  } else {
    document.getElementById('load-more-reviews').classList.remove('no-show')
  }
}

function renderTeachers (view) {
  // eslint-disable-next-line no-undef
  const rendered = Mustache.render(teachersTemplate, view)
  teacherSummary.innerHTML = rendered
}

document.getElementById('load-more-teachers').addEventListener('click', () => {
  teachersLimit += 20
  loadTeachers(teachersLimit)
})

document.getElementById('load-more-reviews').addEventListener('click', () => {
  reviewsPage += 1
  loadTeachers(reviewsPage)
})

document.getElementById('teacher-filter').addEventListener('change', (evemt) => {
  teacherSummary.innerHTML = 'Cargando...'
  document.getElementById('load-more-teachers').classList.remove('no-show')
  // eslint-disable-next-line no-undef
  if (event.srcElement.value !== '') {
    // eslint-disable-next-line no-undef
    const Http = new XMLHttpRequest()
    // eslint-disable-next-line no-undef
    const params = `../json/califica/catedraticos/filter?search=${event.srcElement.value}&university${uniName}`
    Http.open('GET', params)
    Http.send(null)
    Http.onreadystatechange = (e) => {
      if (Http.readyState === 4 && Http.status === 200) {
        renderTeachers({ teachers: JSON.parse(Http.response) })
      }
    }
  } else {
    loadTeachers()
  }
})

function vote (university, date, vote) {
  const voteSpan = document.getElementById(`votes${date}`)
  const button = document.getElementById(`vote${dir[(vote / Math.abs(vote)).toString()]}${date}`)

  if (!button.classList.contains('voted')) {
    voteSpan.innerHTML = parseInt(voteSpan.innerHTML) + (vote / Math.abs(vote))
    button.classList.add('voted')
    // eslint-disable-next-line no-undef
    grecaptcha.execute('6LdfkL4UAAAAAFw_yCmYUBjHeHsH38J9Yz7nb5D7', { action: 'vote' }).then((token) => {
      const captcha = token
      // eslint-disable-next-line no-undef
      const Http = new XMLHttpRequest()
      const params = '../califica/universidades/vote'
      Http.open('PATCH', params)
      Http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      Http.send(JSON.stringify({ university: university, date: new Date(date), vote: vote, captcha: captcha }))
      Http.onreadystatechange = (e) => {
        if (Http.readyState === 4 && Http.status === 200) {
          const post = JSON.parse(Http.response)
          if (post.success === true) {
            console.log('Vote cast successful')
          } else {
            voteSpan.innerHTML = parseInt(voteSpan.innerHTML) - (vote / Math.abs(vote))
            button.classList.remove('voted')

            let msg = ''
            switch (post.data[0]) {
              case 0:
                msg = 'Error de servidor interno :(, probá votar más tarde.'
                break
              case 1:
                msg = 'Esta calificación ya fue votada en esta sesión. :/'
                break
            }

            // eslint-disable-next-line no-undef
            interactToast('error-toast', msg, 2000)
            // eslint-disable-next-line no-undef
            console.error(post)
          }
        } else if (Http.readyState === 4 && Http.status !== 200) {
          voteSpan.innerHTML = parseInt(voteSpan.innerHTML) - (vote / Math.abs(vote))
          button.classList.remove('voted')
          // eslint-disable-next-line no-undef
          interactToast('error-toast', 'Error de servidor interno, probar más tarde', 2000)
          // eslint-disable-next-line no-undef
          console.error(post)
        }
      }
    })
  }
}
