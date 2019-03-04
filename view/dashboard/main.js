function uploadArticle() {
  openLoading()
  const category = document.getElementById('category').value  
  const author = document.getElementById('author').value
  const headline = document.getElementById('headline').value
  const subhead = document.getElementById('subhead').value.replace(/\n/g, "<br />")
  const body = document.getElementById('body').value.replace(/\n/g, "<br />")
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
      dismissLoadig()
    }
  }
}

function openLoading(){
  document.getElementById('upload-loading').style.display = 'initial'
  document.getElementById('wrapper').style.display = 'initial'  
}

function dismissLoadig(){
  document.getElementById('upload-loading').style.display = 'none'
  document.getElementById('wrapper').style.display = 'none'
}

function openForm(){
  document.getElementById('article-form').style.display = 'initial'
  document.getElementById('wrapper').style.display = 'initial'
}

function dismissForm(){
  document.getElementById('article-form').style.display = 'none'
  document.getElementById('wrapper').style.display = 'none'
  
  document.getElementById('author').value = ''
  document.getElementById('headline').value = ''
  document.getElementById('subhead').value = ''
  document.getElementById('body').value = ''
  document.getElementById('pwd').value = ''
}
