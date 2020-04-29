var con = require('../lib/conexionbd');

//visualiza las competencias en el front
function buscarCompetencias(req, res) {
    var sql = "select * from competencia"
    con.query(sql, function (error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta de las competencias");
        }
        var response = resultado

        res.send(JSON.stringify(response));
    });
}

//muestra dos peliculas al azar en la competencia
function dosPeliculasRandom(req, res) {
    var idCompetencia = req.params.id; //guardamos el id de la competencia elegida
    var sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
    
    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(500).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        var competencia = resultado[0];

        var sql = "SELECT pelicula.id,pelicula.poster,pelicula.titulo FROM pelicula", join = "", where = ""; //hacemos la query de las peliculas dejando el WHERE y el JOIN para ser utilizado por el filtro de la competencia
            
        //si la competencia es por actor
        if (competencia.actor_id){
            join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" ;
            where += " WHERE actor_pelicula.actor_id = " + competencia.actor_id;
        } 
       
        //si la competencia es por director
        if (competencia.director_id){
            join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" ;

            if (where.length > 0){
                where += " and "; // si ya se utilizó otro filtro
            } else {
                where += " WHERE ";
            }

            where +=  "director_pelicula.director_id = " + competencia.director_id;
        } 
        
        //si ka competencia es por genero
        if (competencia.genero_id){
            if (where.length > 0){
                where += " and "; //si ya se utilizó otro filtro
            } else {
                where += " WHERE ";
            }

            where += "pelicula.genero_id = " + competencia.genero_id;
        }

        //agregamos a la query el orden y el limite de 2
        sql += join + where + " ORDER BY RAND() LIMIT 2"; 
        
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            var response = {
                'competencia': competencia.nombre,
                'peliculas': resultado
            };
            
            res.send(JSON.stringify(response));    
        });             
    });
}

//funcion para insertar voto
function insertarVoto(req, res) {
    var idCompetencia= req.params.idCompetencia; //guardamos el id de la competencia elegida
        var idPelicula = req.body.idPelicula; //guardamos el id de la pelicula elegida
        var sql = "INSERT INTO voto (competencia_id, pelicula_id) values (" + idCompetencia + ", " + idPelicula + ")"; //query para insertar los datos en la tabla voto
        
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
            var response = {
                'voto': resultado
            };
            res.status(200).send(JSON.stringify(response));    
        });
    }

    //función para ver los resultados 
    function obtenerResultados(req, res) {
        var idCompetencia = req.params.id; //guardamos el id de la competencia elegida
        var sql = "SELECT * FROM competencia WHERE id = " + idCompetencia; 
        
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
    
            if (resultado.length === 0) {
                console.log("No se encontro ninguna competencia con este id");
                return res.status(404).send("No se encontro ninguna competencia con este id");
            }
    
            var competencia = resultado[0];
            
            //hacemos la query para seleccionar los votos guardados y le damos un orden desc para mostrar los primeros 3
            var sql = "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " + idCompetencia + " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3"; 
    
            con.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(500).send("Hubo un error en la consulta");
                }
    
                var response = {
                   // 'competencia': competencia.nombre,
                    'resultados': resultado
                };
               
                res.send(JSON.stringify(response));    
            });             
        });
    }

     // función para crear nueva competencia   
    function nuevaCompetencia(req, res) {
    //guardamos en variables el nombre de la competencia y los filtros de actor, director y genero
    var request = req.body;
    var genero = request.genero === '0' ? null : request.genero;
    var director = request.director === '0' ? null : request.director;
    var actor = request.actor === '0' ? null : request.actor;
    var nuevaCompetencia = request.nombre;
    
    
    //chequeo que el nombre no esté vacío ni sea igual a una competencia existente
    con.query('SELECT nombre FROM competencia', function(error,resultadoCompetencia,fields){
        for(var i=0;i<resultadoCompetencia.length;i++){
            if(nuevaCompetencia === resultadoCompetencia[i].nombre){
                return res.status(422).send('Ya existe una competencia con ese nombre ')
            }
            if (nuevaCompetencia < 1 ) {
                return res.status(422).send("El nombre no puede estar vacío");
                }
        }
      
    //hacemos una query para ir ingresando los distintos campos y comprobar si hay + de 2 peliculas en la competencia   
    var queryPeliculas = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
    var queryGenero = genero ? ' AND pelicula.genero_id = '  + genero : '';
    var queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
    var queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
    var sqlQuery = queryPeliculas + queryGenero + queryActor + queryDirector;
    console.log(sqlQuery);
    con.query(sqlQuery,function(error,resultadoQuery,fields){
        if(director != null || actor != null){
            
        if(resultadoQuery.length < 2){
            console.log('No hay suficientes peliculas para armar esta competencia');
            return res.status(422).send('No hay suficinetes peliculas para armar esta competencia');
            }
        }

    //query para insertar la nueva competencia a la base de datos
    con.query('INSERT INTO competencia (nombre,genero_id,director_id,actor_id) VALUES (?,?,?,?)',[nuevaCompetencia,genero,director,actor],function(error,results,fields){
                
        if(error){
            console.log('Hubo un error en la consulta', error.message);
            return res.status(404).send('hubo un error en la consulta');
        }
        if(error) return res.status(500).json(error);
            res.send(JSON.stringify(results));
        })
    })
})
}

    //funcion para eliminar votos 
    function eliminarVotos(req, res) {
        var idCompetencia = req.params.id; //guardamos el id de la competencia
        
        //hacemos la query DELETE para borrar los votos de la competencia elegida
        var borrar = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;
        con.query(borrar, function (error, resultado){
            if (error) {
                console.log("Error al eliminar votos", error.message);
                return res.status(500).send(error);
            }
            console.log("Competencia reiniciada id: " + idCompetencia);
            res.send(JSON.stringify(resultado));
        });
    }

    function nombreCompetencia(req, res){
        var nombreCompetencia = req.params.id;
        var query = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " + nombreCompetencia;  
    
            connection.query(query, function(error, resultado){
                if (error) {
                    return res.status(500).json(error);
                }
    
                var response = {
                    'id': resultado,
                    'nombre': resultado[0].nombre,
                    'genero_nombre': resultado[0].genero,
                    'actor_nombre': resultado[0].actor,
                    'director_nombre': resultado[0].director
                }
            res.send(JSON.stringify(response));    
        });
    }
    
    //cargamos la lista de generos
    function cargarGeneros(req,res) {
        var pedido = "SELECT * FROM genero"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar géneros", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    }

    //cargamos la lista de directores
    function cargarDirectores(req,res) {
        var pedido = "SELECT * FROM director"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar directores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    }

    //cargamos la lista de actores
    function cargarActores(req,res) {
        var pedido = "SELECT * FROM actor"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar actores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    }

    //funcion para poder eliminar una competencia
    function eliminarCompetencia(req, res) {
        var idCompetencia = req.params.idCompetencia; //guadamos el id de la competencia a eliminar

        //creamos la query DELETE para borrar la competencia con el id elegido
        var borrar = "DELETE FROM competencia WHERE id =" + idCompetencia;
        
        con.query(borrar, function (error, resultado){
            if(error){
                console.log("Error al eliminar la competencia", error.message);
                return res.status(500).send("Error al eliminar competencia");
            }
            res.send(JSON.stringify(resultado));
        });
    }

    //función para editar el nombre de la competencia
    function editarCompetencia(req, res) {
        var idCompetencia = req.params.id; //guardamos el id eleido
        var nuevoNombre = req.body.nombre; //guardamos el nuevo nombre elegio

        // hacemos la query para actualizar el nombre de la competencia
        var queryString = "UPDATE competencia SET nombre = '"+ nuevoNombre +"' WHERE id = "+ idCompetencia +";";
        
        con.query(queryString,function(error, resultado, fields){
            if(error){
                return res.status(500).send("Error al modificar la competencia")
            }
            if (resultado.length == 0){
                console.log("No se encontro la pelicula buscada con ese id");
                return res.status(404).send("No se encontro ninguna pelicula con ese id");
            } else {
                var response = {
                    'id': resultado
                };
            }
            res.send(JSON.stringify(response));
        });
    }


    //exportamos funciones
module.exports = {
    buscarCompetencias: buscarCompetencias,
    dosPeliculasRandom: dosPeliculasRandom,
    insertarVoto: insertarVoto,
    obtenerResultados: obtenerResultados,
    nuevaCompetencia: nuevaCompetencia,
    eliminarVotos: eliminarVotos,
    nombreCompetencia: nombreCompetencia,
    cargarGeneros: cargarGeneros,
    cargarDirectores: cargarDirectores,
    cargarActores: cargarActores,
    eliminarCompetencia: eliminarCompetencia,
    editarCompetencia: editarCompetencia
};