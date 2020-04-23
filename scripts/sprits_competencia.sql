DROP TABLE IF EXISTS `competencia`;

CREATE TABLE `competencia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`)
);


ALTER TABLE competencia ADD COLUMN genero_id INT (11) UNSIGNED, ADD FOREIGN KEY (genero_id) REFERENCES genero(id);

ALTER TABLE competencia ADD COLUMN director_id INT (11) UNSIGNED, ADD FOREIGN KEY (director_id) REFERENCES director(id);

ALTER TABLE competencia ADD COLUMN actor_id INT (11) UNSIGNED, ADD FOREIGN KEY (actor_id) REFERENCES actor(id);


INSERT INTO `competencia` (`id`, `nombre`, `genero_id`) VALUES (1,'¿Qué drama te hizo llorar más?',8);
INSERT INTO `competencia` (`id`, `nombre`, `genero_id`) VALUES(2,'Con qué pelicula te asustaste más?',10);
INSERT INTO `competencia` (`id`, `nombre`, `actor_id`) VALUES (3,'¿Cuál es la mejor peli de Angelina Jolie?',114);
INSERT INTO `competencia` (`id`, `nombre`, `director_id`) VALUES(4,'¿Cuál es la mejor peli del Woody Allen?',3279);
INSERT INTO `competencia` (`id`, `nombre`, `genero_id`) VALUES (5,'¿Cuál es la mejor peli de acción?',1);
INSERT INTO `competencia` (`id`, `nombre`, `genero_id`) VALUES(6,'¿Con qué peli te reiste más?',5);

CREATE TABLE voto (
  id int(11) NOT NULL AUTO_INCREMENT,
  competencia_id int(11) ,
  pelicula_id int(11) unsigned , 
  PRIMARY KEY (id),
  FOREIGN KEY (competencia_id) REFERENCES competencia(id),
  FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
);