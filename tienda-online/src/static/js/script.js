// Lista de productos con varias imágenes
const productos = [
    {
        id: 1,
        nombre: "Castigo - Anne Holt",
        precio: 4,
        imagenes: [
            "static/img/producto 1/castigo-delante.jpg",
            "static/img/producto 1/castigo-detras.jpg",
            "static/img/producto 1/castigo-lateral.jpg"
        ]
    },
    {
        id: 2,
        nombre: "La chica de nieve - Javier Castillo",
        precio: 12,
        imagenes: [
            "static/img/producto 2/la-chica-de-nieve-delante.jpg",
            "static/img/producto 2/la-chica-de-nieve-detras.jpg",
            "static/img/producto 2/la-chica-de-nieve-lateral.jpg"
        ]
    },
    {
        id: 3,
        nombre: "The second stranger - Martin Griffin",
        precio: 10,
        imagenes: [
            "static/img/producto 3/the-second-stranger-delante.jpg",
            "static/img/producto 3/the-second-stranger-detras.jpg",
            "static/img/producto 3/the-second-stranger-lateral.jpg"
        ]
    },
    {
        id: 4,
        nombre: "Qué bueno que te fuiste - Lae Sánchez",
        precio: 5,
        imagenes: [
            "static/img/producto 4/que-bueno-que-te-fuiste-delante.jpg",
            "static/img/producto 4/que-bueno-que-te-fuiste-detras.jpg",
            "static/img/producto 4/que-bueno-que-te-fuiste-lateral.jpg"
        ]
    },
    {
        id: 5,
        nombre: "Fablehaven El refugi de la màgia - Brandon Mull",
        precio: 9,
        imagenes: [
            "static/img/producto 5/fablehaven-delante.jpg",
            "static/img/producto 5/fablehaven-detras.jpg",
            "static/img/producto 5/fablehaven-lateral.jpg"
        ]
    },
    {
        id: 6,
        nombre: "La buena crisis - Álex Rovira",
        precio: 6,
        imagenes: [
            "static/img/producto 6/la-buena-crisis-delante.jpg",
            "static/img/producto 6/la-buena-crisis-detras.jpg",
            "static/img/producto 6/la-buena-crisis-lateral.jpg"
        ]
    }
];

// Recuperamos carrito del localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function login() {
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje === "Inicio de sesión exitoso") {
            localStorage.removeItem("carrito");  // Eliminar carrito anterior
            carrito = {};  // Resetear carrito en memoria
            window.location.reload();  // Recargar página para cargar nuevo carrito
        } else {
            alert(data.error);
        }
    });
}

// 🚀 Cargar productos con carrusel
function cargarProductos() {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach((producto, index) => {
        let div = document.createElement("div");
        div.classList.add("producto");

        div.innerHTML = `
            <div class="swiper product-swiper">
                <div class="swiper-wrapper">
                    ${producto.imagenes.map(img => `<div class="swiper-slide"><img src="${img}" alt="${producto.nombre}"></div>`).join('')}
                </div>
                <!-- Flechas de navegación -->
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
            <h2>${producto.nombre}</h2>
            <p class="precio">${producto.precio}€</p>
            <button onclick="agregarAlCarrito(${index})">Añadir al carrito</button>
        `;

        contenedor.appendChild(div);
    });

    // Inicializar Swiper
    new Swiper('.product-swiper', {
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
}

// 🚀 Agregar al carrito con cantidad
function agregarAlCarrito(index) {
    let producto = productos[index];

    fetch('/agregar-carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id: productos[index].id })
    })
    .then(response => response.json())
    .then(() => cargarCarrito());
}

document.addEventListener("DOMContentLoaded", function () {
    cargarCarrito();  // Cargar carrito automáticamente al cargar la página
});

function cargarCarrito() {
    fetch('/obtener-carrito')
        .then(response => response.json())
        .then(data => {
            carrito = {};  // Limpiar carrito local

            data.forEach(item => {
                carrito[item.nombre] = { 
                    id: item.id, 
                    nombre: item.nombre, 
                    precio: item.precio, 
                    cantidad: item.cantidad 
                };
            });

            actualizarCarrito();  // Mostrar carrito actualizado en la página
        });
}

// 🚀 Actualizar carrito y guardarlo en localStorage
function actualizarCarrito() {
    const lista = document.getElementById("lista-carrito");
    lista.innerHTML = "";

    Object.keys(carrito).forEach(nombre => {
        let item = carrito[nombre];
        let li = document.createElement("li");

        li.innerHTML = `
            ${item.nombre} - ${item.precio}€ x ${item.cantidad} 
            <button onclick="modificarCantidad('${item.nombre}', 1)">➕</button>
            <button onclick="modificarCantidad('${item.nombre}', -1)">➖</button>
            <button onclick="eliminarDelCarrito('${nombre}')">❌</button>
        `;

        lista.appendChild(li);
    });

    // Guardamos el carrito en localStorage para que la vista se actualice correctamente
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// 🚀 Modificar cantidad de productos en el carrito
function modificarCantidad(nombre, cambio) {
    let producto = carrito[nombre];

    fetch('/modificar-carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id: producto.id, cantidad: producto.cantidad + cambio })
    })
    .then(response => response.json())
    .then(() => cargarCarrito());
}

// 🚀 Eliminar un producto del carrito
function eliminarDelCarrito(nombre) {
    let producto = carrito[nombre];

    fetch('/eliminar-del-carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ producto_id: producto.id })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.mensaje); // Mensaje de confirmación en la consola

        // Eliminar el producto del objeto carrito en JavaScript
        delete carrito[nombre];

        // Actualizar la vista y el localStorage
        actualizarCarrito();
    })
    .catch(error => console.error("Error al eliminar producto:", error));
}

// 🚀 Eliminar producto de la tienda
function eliminarProducto(index) {
    productos.splice(index, 1);
    cargarProductos();
}

// 🚀 Enviar pedido con Formspree
function enviarPedido() {
    let nombre = document.getElementById("nombre").value.trim();
    let direccion = document.getElementById("direccion").value.trim();

    if (!nombre || !direccion) {
        alert("⚠️ Ingresa tu nombre y dirección.");
        return;
    }

    if (Object.keys(carrito).length === 0) {
        alert("⚠️ El carrito está vacío.");
        return;
    }

    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{ amount: { value: calcularTotalCarrito() } }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert("✅ Pago completado por " + details.payer.name.given_name);
                
                fetch('/vaciar-carrito', { method: 'POST' })
                    .then(response => response.json())
                    .then(() => cargarCarrito());

                window.location.href = "/tienda-online";
            });
        }
    }).render('#paypal-button-container');
}

// Función para inicializar PayPal Smart Buttons
function iniciarPaypal() {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: calcularTotalCarrito() // Calcula el total del carrito
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert("✅ Pago completado por " + details.payer.name.given_name);
                carrito = {}; // Vaciar carrito
                actualizarCarrito();
            });
        },
        onError: function(err) {
            console.error("❌ Error en el pago:", err);
        }
    }).render('#paypal-button-container');
}

// Función para calcular el total del carrito
function calcularTotalCarrito() {
    return Object.values(carrito).reduce((total, item) => total + (item.precio * item.cantidad), 0).toFixed(2);
}

function logout() {
    fetch('/logout')
        .then(() => {
            carrito = {};  // Vaciar carrito local
            localStorage.removeItem("carrito");  // Eliminar del almacenamiento local
            window.location.href = "/";  // Redirigir al inicio
        });
}

// 🚀 Cargar productos y carrito al iniciar
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarCarrito();
});