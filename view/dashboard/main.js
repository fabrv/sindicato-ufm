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

if (!localStorage.articles){
  getArticles()
}else{
  loadArticles(JSON.parse(localStorage.articles))
}

function getArticles(){
  const Http = new XMLHttpRequest();
  const req = `/json/opinion`
  Http.open("GET", encodeURI(req))

  Http.send()
  Http.onreadystatechange=(e)=>{
    if (Http.readyState == 4 && Http.status == 200) {
      const articles = JSON.parse(Http.responseText)
      localStorage.articles = Http.responseText
      loadArticles(articles)
    }
  }
}

function loadArticles(articles){
  document.getElementById('articles-table').innerHTML = '<tr><td style="cursor:pointer;"><b>Autor</b></td><td style="cursor:pointer;"><b>Título</b></td><td style="cursor:pointer;"><b>Fecha 🔽</b></td><td>👁️</td><td></td></tr>'
  for (let i = 0; i < articles.length; i++){
    document.getElementById('articles-table').innerHTML += `
    <tr>
      <td>${articles[i].author}</td>
      <td><a href="../${encodeURI(articles[i].headline)}">${articles[i].headline}</a></td>
      <td>${articles[i].date}</td>
      <td onclick="getViews(event.target, '${encodeURI(articles[i].headline)}')" style="cursor:pointer;">👁️</td>
      <td onclick="deleteArticle(0, '')" style="cursor:pointer;"><abbr title="Borrar articulo">❌</abbr></td>
    </tr>
    `
  }
}

function getViews(target, article){
  const Http = new XMLHttpRequest();
  const req = `/json/${article}`
  Http.open("GET", encodeURI(req))

  Http.send()
  Http.onreadystatechange=(e)=>{
    if (Http.readyState == 4 && Http.status == 200) {
      const article = JSON.parse(Http.responseText)
      target.innerHTML = `<span onclick="getViews(event.target, '${encodeURI(article.headline)}')">${article.visits}</span>`
    }
  }
}

function deleteArticle(index, article, category = 'opinions'){
  const pPrompt = prompt("Ingresar contraseña para borrar articulo")
  if (pPrompt != null){
    console.log(pPrompt)
  }
}