const path = window.location.pathname.slice(1,window.location.pathname.length)

if (path === ''){
  window.location.replace('/opinion')
}

const urlParams = new URLSearchParams(window.location.search);
const pageParam = urlParams.get('page');

const Http = new XMLHttpRequest();
const req = `/json/${path}`
Http.open("GET", req)
Http.send()
Http.onreadystatechange=(e)=>{
  if (Http.readyState == 4 && Http.status == 200) {
    const articles = JSON.parse(Http.responseText)  

    let page = 0
    let wrapper = ""
    const maxPage = Math.floor(articles.length/10)

    if (!isNaN(page)){
      page = pageParam
    }
    
    if (articles.length > (page + 1) * 10){
      document.getElementById('more').style.display = 'inline-block';
    }
    if (page > 0){
      document.getElementById('less').style.display = 'inline-block';
    }

    if (page > maxPage){
      window.location.replace(`${path}?page=${maxPage}`)
    }

    for (let i = page * 10; i < (page * 10) + 10; i++){
      if (i >= articles.length){
        i = (page * 10) + 11
      } else{
        wrapper += parseArticle(articles[i].headline, articles[i].subhead, articles[i].body, articles[i].date, articles[i].author)
      }
    }
    document.getElementById('wrapper').innerHTML = wrapper
  }
}

function parseArticle(headline, subhead, body, date, author){
  const article = `
  <div class="content">
    <h1><a href="${encodeURIComponent(headline)}">${headline}</a></h1>
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
  window.location.href = `/${window.location.href}?page=${page + 1}`
}

function lessPage(){
  window.location.href = `/${window.location.href}?page=${page - 1}`
}