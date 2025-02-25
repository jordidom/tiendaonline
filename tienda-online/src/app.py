from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='template')
app.secret_key = "pinchellave"

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''  # Cambia esto por tu contraseña
app.config['MYSQL_DB'] = 'tienda_online'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = MySQL(app)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/registrarse')
def registrarse():
    return render_template('registrarse.html')

@app.route('/tienda-online')
def tiendaOnline():
    if 'usuario' in session:
        return render_template('tienda-online.html', usuario=session['usuario'])
    else:
        return redirect(url_for('index'))
    
# Endpoint para agregar un producto al carrito
@app.route('/agregar-carrito', methods=['POST'])
def agregar_carrito():
    if 'usuario' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    data = request.json
    usuario = session['usuario']  # Asignar carrito al usuario
    producto_id = data['producto_id']

    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM carritos WHERE usuario = %s AND producto_id = %s", (usuario, producto_id))
    producto = cur.fetchone()

    if producto:
        cur.execute("UPDATE carritos SET cantidad = cantidad + 1 WHERE usuario = %s AND producto_id = %s", (usuario, producto_id))
    else:
        cur.execute("INSERT INTO carritos (usuario, producto_id, cantidad) VALUES (%s, %s, 1)", (usuario, producto_id))

    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Producto agregado al carrito"}), 200

# Endpoint para obtener el carrito de un usuario
@app.route('/obtener-carrito', methods=['GET'])
def obtener_carrito():
    if 'usuario' not in session:
        return jsonify([])  # Si no hay usuario, enviar un carrito vacío

    usuario = session['usuario']
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT p.id, p.nombre, p.precio, c.cantidad
        FROM carritos c
        JOIN productos p ON c.producto_id = p.id
        WHERE c.usuario = %s
    """, [usuario])
    carrito = cur.fetchall()
    cur.close()
    return jsonify(carrito)

# Endpoint para modificar la cantidad de un producto en el carrito
@app.route('/modificar-carrito', methods=['POST'])
def modificar_carrito():
    if 'usuario' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    data = request.json
    usuario = session['usuario']
    producto_id = data['producto_id']
    cantidad = data['cantidad']

    if cantidad <= 0:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM carritos WHERE usuario = %s AND producto_id = %s", (usuario, producto_id))
    else:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE carritos SET cantidad = %s WHERE usuario = %s AND producto_id = %s", (cantidad, usuario, producto_id))

    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Carrito actualizado"}), 200

# Endpoint para vaciar el carrito después del pago
@app.route('/vaciar-carrito', methods=['POST'])
def vaciar_carrito():
    if 'usuario' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    usuario = session['usuario']
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM carritos WHERE usuario = %s", [usuario])
    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Carrito vaciado correctamente"}), 200

@app.route('/eliminar-del-carrito', methods=['POST'])
def eliminar_del_carrito():
    if 'usuario' not in session:
        return jsonify({"error": "No has iniciado sesión"}), 401

    data = request.json
    usuario = session['usuario']
    producto_id = data.get('producto_id')

    if not producto_id:
        return jsonify({"error": "Falta el producto_id"}), 400

    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM carritos WHERE usuario = %s AND producto_id = %s", (usuario, producto_id))
    mysql.connection.commit()
    cur.close()

    return jsonify({"mensaje": "Producto eliminado del carrito"}), 200

# Ruta para registrar usuario
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    nombre = data['nombre']
    usuario = data['usuario']
    email = data['email']
    password = generate_password_hash(data['password'])
    
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO usuarios (nombre, usuario, email, password) VALUES (%s, %s, %s, %s)", (nombre, usuario, email, password))
    mysql.connection.commit()
    cur.close()
    return jsonify({"mensaje": "Usuario registrado correctamente", "redirect": url_for('index')})

# Ruta para iniciar sesión
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    usuario = data['usuario']
    password = data['password']
    
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM usuarios WHERE usuario = %s", [usuario])
    user = cur.fetchone()
    cur.close()
    
    if user and check_password_hash(user['password'], password):
        session['usuario'] = usuario
        return jsonify({"mensaje": "Inicio de sesión exitoso", "redirect": url_for('tiendaOnline')})
    else:
        return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

# Ruta para cerrar sesión
@app.route('/logout')
def logout():
    session.pop('usuario', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)