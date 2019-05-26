function interactToast(toastID, text, timeOut) {
  document.getElementById(toastID).innerHTML = text  
  const classes = document.getElementById(toastID).classList
  for (let i in classes) {
    if (classes[i] === 'hidden') {
      document.getElementById(toastID).classList.remove('hidden')
      setTimeout(() => {
        console.log('test')
        document.getElementById(toastID).classList.add('hidden')
      }, timeOut);
      return
    }
  }
  document.getElementById(toastID).classList.add('hidden')
}