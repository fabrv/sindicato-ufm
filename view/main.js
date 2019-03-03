const path = window.location.pathname.slice(1,window.location.pathname.length)
let page = 0
let wrapper = ""
const maxPage = Math.floor(opinions.length/10)

if(!isNaN(path)){
  page = parseInt(path)
}
if (path === ""){
  console.log('test')
  page = 0
}

if (opinions.length > (page + 1) * 10){
  document.getElementById('more').style.display = 'inline-block';
}
if (page > 0){
  document.getElementById('less').style.display = 'inline-block';
}

if (!isNaN(path)){
  if (path > maxPage){
    window.location.replace(`/${maxPage}`)
  }

  for (let i = page * 10; i < (page * 10) + 10; i++){
    if (i >= opinions.length){
      i = (page * 10) + 11
    } else{
      wrapper += parseArticle(opinions[i].headline, opinions[i].subhead, opinions[i].body, opinions[i].date, opinions[i].author)
    }
  } 
}else {
  /*const article = opinions.find(opinion => opinion.headline === decodeURI(path))
  wrapper += parseArticle(article.headline, article.subhead, article.body, article.date, article.author)
  document.title = `El Sindicato - ${article.headline}`*/
}

document.getElementById('wrapper').innerHTML = wrapper

function parseArticle(headline, subhead, body, date, author){
  const article = `
  <div class="content">
    <h1><a href="${encodeURI(headline)}">${headline}</a></h1>
    <p class="info"><b>${author}</b>  -  ${date}</p>
    <p class="subhead">${subhead}</p>
    <hr>
    <div class="body">${body}</div>
    <hr>
  </div>
  `
  return article
}

function addPage(){
  window.location.href = `/${page + 1}`
}

function lessPage(){
  window.location.href = `/${page - 1}`
}