var canvas = document.getElementById('aco_render');
var ctx = canvas.getContext('2d');

// Agrega un event listener para el evento mousedown
canvas.addEventListener('mousedown', function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    alert('Coordenadas del clic: x = ' + x + ', y = ' + y);
});