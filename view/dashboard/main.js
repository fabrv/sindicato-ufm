var arts = []
function uploadArticle() {
  openLoading()
  const category = document.getElementById('category').value  
  const author = document.getElementById('author').value
  const headline = document.getElementById('headline').value
  const subhead = document.getElementById('subhead').value.replace(/\n/g, "<br />")
  const body = document.getElementById('body').value
  const pwd = document.getElementById('pwd').value
  
  const event = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  const date = event.toLocaleDateString('es-ES', options)
  const Http = new XMLHttpRequest();
  const req = `/upload?category=${category}&author=${author}&headline=${encodeURIComponent(headline)}&subhead=${encodeURIComponent(subhead)}&body=${encodeURIComponent(body)}&date=${date}&pwd=${pwd}`
  console.log(req)
  Http.open("POST", req)

  Http.send()
  Http.onreadystatechange=(e)=>{
    if (Http.readyState == 4 && Http.status == 200) {
      console.log('RESULT', Http.responseText)
      dismissLoadig()
      getArticles()
    } else if (Http.readyState == 4 && Http.status !== 200){
      dismissLoadig()
      alert(Http.responseText)
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
  arts = JSON.parse(localStorage.articles)
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
      arts = JSON.parse(Http.responseText)
      loadArticles(articles)
    } else if (Http.readyState == 4 && Http.status !== 200){
      console.log('error')
      dismissLoadig()
      alert(Http.responseText)
    }
  }
}

function loadArticles(articles, sort = 'date'){
  let sortHeadline = ''
  let sortAuthor = ''
  let sortDate = ''
  switch (sort){
    case 'headline':
      sortHeadline = '🔽'
      break
    case 'author':
      sortAuthor = '🔽'
      break
    case 'date':
      sortDate = '🔽'
      break
  }
  document.getElementById('articles-table').innerHTML = `<tr><td style="cursor:pointer;" onclick="sortByAuthor()"><b>Autor ${sortAuthor}</b></td><td style="cursor:pointer;" onclick="sortByHeadline()"><b>Título ${sortHeadline}</b></td><td style="cursor:pointer;" onclick="sortByDate()"><b>Fecha ${sortDate}</b></td><td>👁️</td><td></td></tr>`
  for (let i = 0; i < articles.length; i++){
    document.getElementById('articles-table').innerHTML += `
    <tr>
      <td>${articles[i].author}</td>
      <td><a href="../${encodeURIComponent(replaceAll(article, ' ', '_'))}">${articles[i].headline}</a></td>
      <td>${articles[i].date}</td>
      <td onclick="getViews(event.target, '${encodeURIComponent(articles[i].headline)}')" style="cursor:pointer;">👁️</td>
      <td onclick="deleteArticle(${i}, '${articles[i].headline}')" style="cursor:pointer;"><abbr title="Borrar articulo">❌</abbr></td>
    </tr>
    `
  }
}

function getViews(target, article){
  const Http = new XMLHttpRequest();
  const req = `/json/articulo/${replaceAll(article, ' ', '_')}`
  Http.open("GET", encodeURI(req))

  Http.send()
  Http.onreadystatechange=(e)=>{
    if (Http.readyState == 4 && Http.status == 200) {
      const article = JSON.parse(Http.responseText)
      target.innerHTML = `<span onclick="getViews(event.target, '${encodeURI(article.headline)}')">${article.views}</span>`
    } else if (Http.readyState == 4 && Http.status !== 200){
      console.log('error')
      dismissLoadig()
      alert(Http.responseText)
    }
  }
}

function deleteArticle(index, article, category = 'opinions'){
  const pPrompt = prompt("Ingresar contraseña para borrar articulo")
  if (pPrompt != null){
    dismissForm()
    openLoading()
    const Http = new XMLHttpRequest();
    const req = `/delete?article=${article}&index=${index}&category=${category}&pwd=${pPrompt}`
    Http.open("DELETE", encodeURI(req))

    Http.send()
    Http.onreadystatechange=(e)=>{
      if (Http.readyState == 4 && Http.status == 303) {
        dismissLoadig()
        getArticles()
      } else if (Http.readyState == 4 && Http.status !== 303){
        console.log('error')
        dismissLoadig()
        alert(Http.responseText)
      }
    }
  }
}

function sortByAuthor(){
  loadArticles(sortByKey(arts, 'author'), 'author')
}

function sortByHeadline(){
  loadArticles(sortByKey(arts, 'headline'), 'headline')
}

function sortByDate(){
  arts = JSON.parse(localStorage.articles)
  loadArticles(arts)
}

function sortByKey(array, key) {
  return array.sort( (a, b) => {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function changePreview(){
  document.getElementById('preview').innerHTML = document.getElementById('body').value
}
let previewVisible = false
function showPreview(){
  changePreview()
  if (previewVisible) {
    document.getElementById('body').style.display = 'initial'
    document.getElementById('preview').style.display = 'none'
  } else {
    document.getElementById('body').style.display = 'none'
    document.getElementById('preview').style.display = 'block'
  }
  previewVisible = !previewVisible
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
