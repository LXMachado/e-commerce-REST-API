document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    document.getElementById('login-form').addEventListener('submit', loginUser);
    document.getElementById('register-form').addEventListener('submit', registerUser);
});

function fetchProducts() {
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('product-list');
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.textContent = `${product.name} - $${product.price}`;
                productList.appendChild(productElement);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Login failed');
    })
    .then(data => {
        console.log('Login successful:', data);
        // Storing accessToken in sessionStorage. In a real application, consider using HTTPOnly cookies for better security
        sessionStorage.setItem('accessToken', data.accessToken);
    })
    .catch(error => {
        console.error('Error logging in:', error);
    });
}

function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
        }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Registration successful');
            return response.json();
        }
        throw new Error('Registration failed');
    })
    .catch(error => {
        console.error('Error registering user:', error);
    });
}