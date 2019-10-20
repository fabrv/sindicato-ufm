const teacherSummary = document.getElementById('teachers-summary')
console.log(teacherSummary)

const Http = new XMLHttpRequest()
init()

function init() {
  console.log(window.location.href)
  const params =  '../json/califica/universidades'
  Http.open("GET", params);
  Http.send();
  Http.onreadystatechange=(e)=> {
    if (Http.readyState == 4 && Http.status == 200) {
    }
  }
}