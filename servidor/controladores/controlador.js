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
            return res.status(404).send("Hubo un error en la consulta");
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
                return res.status(404).send("Hubo un error en la consulta");
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
        var nombreCompetencia = req.body.nombre; 
        var generoCompetencia = req.body.genero === '0' ? null : req.body.genero;
        var directorCompetencia = req.body.director === '0' ? null : req.body.director;
        var actorCompetencia = req.body.actor === '0' ? null : req.body.actor;
        console.log(req.body);
        
        //query que inserta a la tabla competencia una nueva fila
        var queryNueva = "INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES ('" + nombreCompetencia + "', " + generoCompetencia + ", " + directorCompetencia + ", " + actorCompetencia + ");";
        console.log(queryNueva);
        
        con.query(queryNueva, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error al crear la competencia", error.message);
                return res.status(500).send("Hubo un error al crear la competencia");
            }
            res.send(JSON.stringify(resultado));
        }); 
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
    cargarGeneros: cargarGeneros,
    cargarDirectores: cargarDirectores,
    cargarActores: cargarActores,
    eliminarCompetencia: eliminarCompetencia,
    editarCompetencia: editarCompetencia
};