CREATE TABLE carritos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario) REFERENCES usuarios(usuario)
);