document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const data = {
        usuario: document.getElementById("usuario").value,
        password: document.getElementById("password").value
    };

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje) {
            alert(data.mensaje);
            window.location.href = data.redirect;
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });    
});