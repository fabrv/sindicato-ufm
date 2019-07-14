const Http = new XMLHttpRequest();
let params = ''

params = `/dashboard/session`
Http.open("GET", params)
Http.send()
Http.onreadystatechange = (e) => {
  if (Http.readyState == 4 && Http.status == 200) {
    const response = JSON.parse(Http.response)
    if (!response) {
      interactModal('login-modal')
    } else {
      init()
    }
  } else if (Http.readyState == 4 && !Http.status == 200) {
    interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
    interactModal('login-modal')
  }
}

function verifyCredentials(username, password) {
  params = `/dashboard/login?username=${username}&password=${password}`
  Http.open("GET", params)
  Http.send()
  return new Promise(resolve => {
    Http.onreadystatechange = (e) => {
      if (Http.readyState == 4 && Http.status == 200) {
        const response = JSON.parse(Http.response)
        resolve(response)
      }
    }
  })
}

async function login() {
  const verify = await verifyCredentials(document.getElementById('usr-txt').value, document.getElementById('pwd-txt').value)
  if (verify === true) {
    interactModal('login-modal')
    interactToast('login-toast', 'Sesión iniciada exitosamente', 5000)
    localStorage.setItem('session', document.getElementById('usr-txt').value)
    init()
  } else {
    interactToast('login-toast', 'Usuario o contraseña incorrecta', 5000)
  }
}

function getArticles() {
  params = `/dashboard/articles`
  Http.open("GET", params)
  Http.send()
  return new Promise(resolve => {
    Http.onreadystatechange = (e) => {
      if (Http.readyState == 4 && Http.status == 200) {
        const response = Http.responseText
        resolve(response)
      }
    }
  })
}

function getModeration() {
  params = `/dashboard/moderation`
  Http.open("GET", params)
  Http.send()
  return new Promise(resolve => {
    Http.onreadystatechange = (e) => {
      if (Http.readyState == 4 && Http.status == 200) {
        const response = Http.responseText
        resolve(response)
      }
    }
  })
}

async function init() {
  document.getElementById('username').innerHTML = localStorage.getItem('session')
  document.getElementById('wrapper').innerHTML = await getArticles()
}

async function moderation() {
  document.getElementById('wrapper').innerHTML = await getModeration()
}

document.getElementById('login-btn').addEventListener('click', async ()=> {
  login()
})

document.getElementById('pwd-txt').addEventListener('keydown', async (k)=> {
  if (k.key === 'Enter') {
    login()
  }
})

document.getElementById('logout').addEventListener('click', ()=> {
  params = `/dashboard/session`
  Http.open("DELETE", params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      const response = JSON.parse(Http.response)
      if (response.success) {
        window.location.reload()
      } else {
        interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      }
    } else if (Http.readyState == 4 && !Http.status == 200) {
      interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      interactModal('login-modal')
    }
  }
})

function approveUniReview(university, date, card){
  params = `/califica/universidades?university=${university}&date=${date}`
  Http.open("PATCH", params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      interactPrompt('wrapper-mod')
      const response = JSON.parse(Http.response)
      if (response.success) {
        interactToast('login-toast', 'Calificación exitosamente aceptada', 3000)
        card.style.opacity = '0'
        setTimeout(() => {
          card.parentNode.removeChild(card);
        }, 300);
      } else {
        interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      }
    } else if (Http.readyState == 4 && !Http.status == 200) {
      interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      interactModal('login-modal')
    }
  }
}

function rejectUniReview(university, date, card){
  params = `/califica/universidades?university=${university}&date=${date}`
  Http.open("DELETE", params)
  Http.send()
  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      interactPrompt('wrapper-mod')
      const response = JSON.parse(Http.response)
      if (response.success) {
        interactToast('login-toast', 'Calificación exitosamente aceptada', 3000)
        card.style.opacity = '0'
        setTimeout(() => {
          card.parentNode.removeChild(card);
        }, 300);
      } else {
        interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      }
    } else if (Http.readyState == 4 && !Http.status == 200) {
      interactToast('login-toast', 'Problema conectandose con el servidor', 3000)
      interactModal('login-modal')
    }
  }
}

function approveReject(university, date, approve, element) {
  if (approve === true){
    let f = () => approveUniReview(university, date, element.parentElement.parentElement)
    document.getElementById('reject-accept-btn').addEventListener('click', f);
  } else {
    let f = () => rejectUniReview(university, date, element.parentElement.parentElement)
    document.getElementById('reject-accept-btn').addEventListener('click', f);
  }
}
var simplemde = new SimpleMDE({ element: document.getElementById('editor-textarea'), spellChecker: false })

function openEditor(headline, subhead, body) {
  document.getElementById('headline').value = headline
  document.getElementById('subhead').value = subhead
  simplemde.value(body);
}