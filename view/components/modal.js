function interactModal(modalID) {
  const classes = document.getElementById(modalID).classList
  for (let i in classes) {
    if (classes[i] === 'hidden') {
      document.body.style.overflow = 'hidden'
      document.getElementById(modalID).classList.remove('hidden')
      return
    }
  }
  document.getElementById(modalID).classList.add('hidden')
  document.body.style.overflow = 'auto'
}