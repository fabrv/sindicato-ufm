const Http = new XMLHttpRequest();
const params =  `../json/califica/universidades`
const req = params

Http.open("GET", req);
Http.send();
Http.onreadystatechange=(e)=>{
  if (Http.readyState == 4 && Http.status == 200) {
    const unis = JSON.parse(Http.response)
    for (let uni in unis){
      document.getElementById('wrapper').innerHTML += uniParser(unis[uni])
    }
  }
}

function uniParser(uniJSON){
  let card = '<div class="card university">'

  let ratings = ''
  let general = 0
  let categories = 0

  for (let item in uniJSON){
    if (item === 'imagelink'){
      card += `<div class="image" style="background-image: url('${uniJSON[item]}')"></div><br>`
    } else if (item === 'university') {
      card += `<label class="title">${uniJSON[item]}</label>`
    } else {
      ratings += `
      <br>
      <span>${item}:</span>
      ${starRatingParser(uniJSON[item], 5)}`
      general += parseFloat(uniJSON[item])
      categories += 1
    }
  }
  card += `
  <div class="rating">${starRatingParser(general/categories, 5)}</div><br>${ratings}
  <br>
  <button>Ver cursos y catedraticos</button>`
  return card
}

function starRatingParser(value, max){
  if (value > max) value = max
  let stars = Math.round((value / max) * 5)
  let html = ''
  for (let i = 0; i < stars; i++){
    html += '<span class="fa fa-star checked"></span>'
  }
  for (let i = 0; i < (max - stars); i++){
    html += '<span class="fa fa-star"></span>'
  }
  return html
}