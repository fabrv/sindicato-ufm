function cardNavigate(element, link) {
  element.classList.add('card-grow')
  document.body.style.overflow = 'hidden'
  setTimeout(() => {
    window.location.href = `${window.location.href}/${link}`
  }, 200);
}