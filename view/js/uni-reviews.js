const teacherSummary = document.getElementById('teachers-summary')
console.log(teacherSummary)

// eslint-disable-next-line no-undef
const Http = new XMLHttpRequest()
init()

function init () {
  console.log(window.location.href)
  const params = '../json/califica/universidades'
  Http.open('GET', params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState === 4 && Http.status === 200) {
    }
  }
}
