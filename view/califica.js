const Http = new XMLHttpRequest();
let params =  `../json/califica/universidades`

Http.open("GET", params);
Http.send();
Http.onreadystatechange=(e)=>{
  if (Http.readyState == 4 && Http.status == 200) {
    const unis = JSON.parse(Http.response)
    for (let uni in unis){
      document.getElementById('wrapper').innerHTML += uniParser(unis[uni])
    }
    params = '../json/universidades'
    Http.open("GET", params);
    Http.send();
    Http.onreadystatechange=(e)=>{
      if (Http.readyState == 4 && Http.status == 200) {
        const unis = JSON.parse(Http.response)
        for (let uni in unis){
          document.getElementById('uni-select').innerHTML += `<option>${unis[uni].name}</option>`
        }
      }
    }
  }
}


function uniParser(uniJSON){
  let card = '<div class="card university">'

  let general = 0
  let categories = 0

  for (let item in uniJSON){
    if (item === 'imagelink'){
      card += `<div class="image" style="background-image: url('${uniJSON[item]}')"></div><br>`
    } else if (item === 'university') {
      card += `<label class="title">${uniJSON[item]}</label>`
    } else {
      general += parseFloat(uniJSON[item])
      categories += 1
    }
  }
  card += `
  <div class="rating">${starRatingParser(general/categories, 5)}</div>  
  <button>Ver cursos y catedraticos</button>`
  return card
}

function starRatingParser(value, max){
  if (value > max) value = max
  let stars = Math.round((value / max) * 5)
  let html = ''
  for (let i = 0; i < stars; i++){
    html += '<span class="checked">&#x2605;</span>'
  }
  for (let i = 0; i < (max - stars); i++){
    html += '<span>&#x2605;</span>'
  }
  return html
}


function createStars(id, description, label) {
  return `
  <h4>2) ${description}</h4>
  <label for="location">${label}:</label>
  <div class="rate">
    <input type="radio" id="${id}5" name="${id}" value="5" />
    <label for="${id}5" title="5">5 stars</label>
    <input type="radio" id="${id}4" name="${id}" value="4" />
    <label for="${id}4" title="4">4 stars</label>
    <input type="radio" id="${id}3" name="${id}" value="3" />
    <label for="${id}3" title="3">3 stars</label>
    <input type="radio" id="${id}2" name="${id}" value="2" />
    <label for="${id}2" title="2">2 stars</label>
    <input type="radio" id="${id}1" name="${id}" value="1" />
    <label for="${id}1" title="1">1 star</label>
  </div>`
}