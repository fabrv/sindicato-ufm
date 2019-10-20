const teacherSummary = document.getElementById('teachers-summary')
const teachersTemplate = `
{{#teachers}}
<tr>
  <td><b>Catedratico</b></td>
  <td><b>Calificación</b></td>
  <td><b>Volvería a tomar</b></td>
</tr>
<tr>
  <td>{{teacher}}</td>
  <td>{{rate_avg}}</td>
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
