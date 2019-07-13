function interactPrompt(promptID) {
  const classes = document.getElementById(promptID).classList
  for (let i in classes) {
    if (classes[i] === 'hidden') {
      document.getElementById(promptID).classList.remove('hidden')
      return
    }
  }
  document.getElementById(promptID).classList.add('hidden')
}