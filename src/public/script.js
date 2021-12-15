let contenido = document.querySelector('#contenido');

//fetch api
fetch('http://localhost:3000/list')
    .then(res => res.text())
    .then(data => {
    contenido.innerHTML = data
    })
    .catch(err => console.log(err));

