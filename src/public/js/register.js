const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);
    fetch('/api/sessions/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.error('Error en el registro');
            }
        })
        .then(data => {
            if (data.status === "success") {
                // Muestra un mensaje de confirmación de registro
                alert("Usuario registrado correctamente");
                // Redirigir al login
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });


})