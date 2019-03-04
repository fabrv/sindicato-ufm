function uploadArticle() {
  const category = document.getElementById('category').value  
  const author = document.getElementById('author').value
  const headline = document.getElementById('headline').value
  const subhead = document.getElementById('subhead').value
  const body = document.getElementById('body').value
  const pwd = document.getElementById('pwd').value

  const event = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  const date = event.toLocaleDateString('es-ES', options)
  const Http = new XMLHttpRequest();
  const req = `/upload?category=${category}&author=${author}&headline=${headline}&subhead=${subhead}&body=${body}&date=${date}&pwd=${pwd}`
  Http.open("POST", encodeURI(req))

  Http.send()
  Http.onreadystatechange=(e)=>{
    if (Http.readyState == 4 && Http.status == 200) {
      console.log('RESULT', Http.responseText)
    }
  }
}