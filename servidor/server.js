//paquetes necesarios para el proyecto
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var controlador = require('./controladores/controlador');
var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/generos', controlador.cargarGeneros);
app.get('/directores', controlador.cargarDirectores);
app.get('/actores', controlador.cargarActores);

app.get('/competencias',controlador.buscarCompetencias);
app.get('/competencias/:id', controlador.nombreCompetencia)
app.get('/competencias/:id/peliculas', controlador.dosPeliculasRandom);
app.get('/competencias/:id/resultados', controlador.obtenerResultados);

app.post('/competencias/:idCompetencia/voto', controlador.insertarVoto);
app.post('/competencias', controlador.nuevaCompetencia);
app.put('/competencias/:id', controlador.editarCompetencia);

app.delete('/competencias/:id/votos', controlador.eliminarVotos);
app.delete('/competencias/:idCompetencia', controlador.eliminarCompetencia);

//seteamos el puerto en el cual va a escuchar los pedidos la aplicación
var puerto = '3002';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});

