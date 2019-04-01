const urlParams = new URLSearchParams(window.location.search);
const pageParam = urlParams.get('page');

let page = 0

if (!isNaN(pageParam)){
  console.log(pageParam)
  if (pageParam == null) pageParam = 0
  page = parseInt(pageParam)
}

function addPage(){
  window.location.href = `${window.location.href.split('?')[0]}?page=${page + 1}`
}

function lessPage(){
  window.location.href = `${window.location.href.split('?')[0]}?page=${page - 1}`
}