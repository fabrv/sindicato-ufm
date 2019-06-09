const Http = new XMLHttpRequest();
let params = ''

params = `/dashboard/validate-session`
Http.open("GET", params)
Http.send()
Http.onreadystatechange = (e) => {
  if (Http.readyState == 4 && Http.status == 200) {
    const response = JSON.parse(Http.response)
    if (!response) {
      interactModal('login-modal')
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
    sessionStorage.setItem('session', document.getElementById('usr-txt').value)
  } else {
    interactToast('login-toast', 'Usuario o contraseña incorrecta', 5000)
  }
}

document.getElementById('login-btn').addEventListener('click', async ()=> {
  login()
})

document.getElementById('pwd-txt').addEventListener('keydown', async (k)=> {
  if (k.key === 'Enter') {
    login()
  }
})
