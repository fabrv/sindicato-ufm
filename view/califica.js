const Http = new XMLHttpRequest();
let params = ''


function initUniReviews() {
  document.getElementById('wrapper').innerHTML = ''
  document.getElementById('uni-select').innerHTML = ''
  params =  '../json/califica/universidades'
  Http.open("GET", params);
  Http.send();
  Http.onreadystatechange=(e)=> {
    if (Http.readyState == 4 && Http.status == 200) {
      const unis = JSON.parse(Http.response)
      for (let uni in unis){
        document.getElementById('wrapper').innerHTML += uniParser(unis[uni])
      }
      params = '../json/universidades'
      Http.open("GET", params);
      Http.send();
      Http.onreadystatechange=(e)=> {
        if (Http.readyState == 4 && Http.status == 200) {
          const unis = JSON.parse(Http.response)
          for (let uni in unis){
            document.getElementById('uni-select').innerHTML += `<option value="${unis[uni].name}">${unis[uni].name}</option>`
          }
        }
      }
    }
  }
}

function uniParser(uniJSON) {
  let card = `<div class="card university" onclick="cardNavigate(this, '${uniJSON.acronym}')">`

  let general = 0
  let categories = 0

  for (let item in uniJSON) {
    if (item === 'imagelink') {
      card += `<div class="image" style="background-image: url('${uniJSON[item]}')"></div><br>`
    } else if (item === 'university') {
      card += `<label class="title">${uniJSON[item]}</label>`
    } else if (item === 'acronym') { }
    else {
      general += parseFloat(uniJSON[item])
      categories += 1
    }
  }
  card += `
  <div class="rating">${starRatingParser(general/categories, 5)}</div>  
  <button>Ver cursos y catedraticos</button>`
  return card
}

function starRatingParser(value, max) {
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

function clearUniForm() {
  const categories = ['reputation', 'location', 'events', 'security', 'services', 'cleanliness', 'happiness', 'social', 'extracurricular']
  for (let category in categories){
    document.getElementById(`${categories[category]}1`).checked = true
  }
  document.getElementById('summary').value = ''
  document.getElementById('summary-empty').style.display = 'none';
  document.getElementById('captcha-empty').style.display = 'none';
  grecaptcha.reset();
}

document.getElementById('submit-review').addEventListener('click', ()=> {
  const captcha = grecaptcha.getResponse()
  if (document.getElementById('summary').value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') != '' && captcha != ''){
    const categories = ['reputation', 'location', 'events', 'security', 'services', 'cleanliness', 'happiness', 'social', 'extracurricular']
    const uniReview = {
      'university': document.getElementById('uni-select').value,
      'captcha': captcha,
      'summary': document.getElementById('summary').value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    }
    for (let category in categories){
      uniReview[categories[category]] = parseInt(document.querySelector(`input[name="${categories[category]}"]:checked`).value);
    }  
    params = '../califica/universidades'
    Http.open("POST", params);
    Http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    Http.send(JSON.stringify(uniReview));
    Http.onreadystatechange=(e)=>{
      if (Http.readyState == 4 && Http.status == 200) {
        const post = JSON.parse(Http.response)
        if (post.success === true) {
          clearUniForm()
          interactModal('calificar-modal')
          interactModal('uploaded-modal')
          initUniReviews()
        } else {
          interactToast('error-toast', 'Error al subir calificación, probar más tarde', 2000)
        }
      }
    }
  } else {
    if (document.getElementById('summary').value.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') != '') {
      document.getElementById('summary-empty').style.display = 'none';
    } else {
      document.getElementById('summary-empty').style.display = 'initial';
    }

    if (captcha != '') {
      document.getElementById('captcha-empty').style.display = 'none';
    } else {
      document.getElementById('captcha-empty').style.display = 'initial';
    }
  }
});
