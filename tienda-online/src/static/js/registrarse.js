document.getElementById("registroForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value,
        usuario: document.getElementById("usuario").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.mensaje);
        window.location.href = data.redirect;
    });    
});