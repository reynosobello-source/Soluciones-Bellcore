<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soluciones Bellcore SRL</title>
    <!-- Carga de Tailwind CSS para un diseño moderno y responsive -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Importación de la fuente Inter para una tipografía limpia */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #e2e8f0;
            color: #1a202c;
        }
        /* Clases de color personalizadas para el tema del usuario */
        .bg-custom-blue {
            background-color: #285577;
        }
        .text-custom-blue {
            color: #285577;
        }
        .hover\:bg-custom-blue-dark:hover {
            background-color: #1a3d53;
        }
        .header-title {
            color: #285577;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }
        .product-card {
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        .container-section {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: #ffffff;
            border-radius: 1.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        /* Oculta todas las secciones por defecto y muestra solo la activa */
        .main-section {
            display: none;
        }
        .main-section.active {
            display: block;
        }

        /* Estilo para el modal de mensajes */
        .message-modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            justify-content: center;
            align-items: center;
        }
        .message-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="p-4">

    <!-- Barra de Navegación -->
    <nav class="bg-custom-blue text-white p-4 rounded-xl shadow-md sticky top-4 z-50">
        <div class="container mx-auto flex justify-between items-center">
            <a href="#" onclick="showSection('home')" class="text-2xl font-bold">Soluciones Bellcore SRL</a>
            <div class="hidden md:flex space-x-6">
                <!-- Botones de navegación usando JavaScript para cambiar de sección -->
                <button onclick="showSection('home')" class="hover:underline font-semibold">Inicio</button>
                <button onclick="showSection('about')" class="hover:underline font-semibold">Nosotros</button>
                <button onclick="showSection('products')" class="hover:underline font-semibold">Productos</button>
                <button onclick="showSection('cart')" class="hover:underline font-semibold">Carrito (<span id="cart-count">0</span>)</button>
                <button onclick="showSection('contact')" class="hover:underline font-semibold">Contacto</button>
            </div>
            <!-- Botón de menú para dispositivos móviles -->
            <button id="menu-button" class="md:hidden text-white focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>
        <!-- Menú desplegable para móviles -->
        <div id="mobile-menu" class="hidden md:hidden mt-4 space-y-2">
            <button onclick="showSection('home')" class="block py-2 px-4 rounded-md text-sm hover:bg-custom-blue-dark">Inicio</button>
            <button onclick="showSection('about')" class="block py-2 px-4 rounded-md text-sm hover:bg-custom-blue-dark">Nosotros</button>
            <button onclick="showSection('products')" class="block py-2 px-4 rounded-md text-sm hover:bg-custom-blue-dark">Productos</button>
            <button onclick="showSection('cart')" class="block py-2 px-4 rounded-md text-sm hover:bg-custom-blue-dark">Carrito (<span id="cart-count-mobile">0</span>)</button>
            <button onclick="showSection('contact')" class="block py-2 px-4 rounded-md text-sm hover:bg-custom-blue-dark">Contacto</button>
        </div>
    </nav>
    
    <!-- Contenedor principal de secciones -->
    <main>
        <!-- Sección de Inicio (Hero) -->
        <section id="home-section" class="main-section container-section text-center active">
            <h1 class="text-5xl sm:text-6xl font-extrabold mb-4 header-title">
                Tu Socio Estratégico en Suministros
            </h1>
            <p class="text-xl text-gray-700 mb-8">Ofrecemos productos de oficina, limpieza y consumibles con los mejores precios y servicio de calidad.</p>
            <button onclick="showSection('products')" class="bg-custom-blue text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-custom-blue-dark transition duration-300">
                Explora Nuestros Productos
            </button>
        </section>

        <!-- Sección de Sobre Nosotros -->
        <section id="about-section" class="main-section container-section">
            <h2 class="text-4xl font-bold mb-6 text-custom-blue border-b-2 pb-2">Sobre Nosotros</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <p class="text-gray-700 leading-relaxed">
                    Somos Soluciones Bellcore SRL, tu proveedor de confianza para todas tus necesidades de oficina y limpieza. Con años de experiencia en el mercado de Santo Domingo, hemos expandido nuestra misión para llevar precios competitivos y un servicio excepcional a la vibrante región de Punta Cana y el Este. Nos enorgullece ofrecer productos de alta calidad, desde consumibles de impresión hasta artículos de limpieza esenciales para hoteles y negocios, garantizando una logística eficiente para que tu operación nunca se detenga.
                </p>
                <img src="https://placehold.co/600x400/dbeafe/1e3a8a?text=Nuestra+Tienda" alt="Imagen de nuestra tienda o equipo" class="rounded-xl shadow-lg">
            </div>
        </section>

        <!-- Sección de Productos (Catálogo Dinámico) -->
        <section id="products-section" class="main-section container-section">
            <h2 class="text-4xl font-bold mb-6 text-custom-blue border-b-2 pb-2">Nuestros Productos</h2>
            <div id="catalog-container" class="space-y-12">
                <!-- Los productos se cargarán dinámicamente desde Firestore -->
                <div id="loading-message" class="text-center text-gray-500 text-lg">
                    Cargando productos...
                </div>
            </div>
            <p class="mt-8 text-sm text-gray-600 text-center">
                <strong class="font-bold">ID de la aplicación:</strong> <span id="app-id-display"></span>
            </p>
        </section>

        <!-- Sección del Carrito de Compras -->
        <section id="cart-section" class="main-section container-section">
            <h2 class="text-4xl font-bold mb-6 text-custom-blue border-b-2 pb-2">Carrito de Compras</h2>
            <div id="cart-items" class="space-y-4">
                <!-- Los productos del carrito se renderizarán aquí -->
            </div>
            <div id="cart-empty-message" class="text-center text-gray-500 mt-4">
                Tu carrito está vacío.
            </div>
            <div id="cart-summary" class="mt-8 pt-4 border-t-2 border-gray-200">
                <p class="text-xl font-bold flex justify-between items-center">
                    Total: <span id="cart-total">RD$ 0.00</span>
                </p>
                <button onclick="showSection('payment')" id="checkout-btn" class="w-full mt-4 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400">
                    Proceder al Pago
                </button>
            </div>
        </section>

        <!-- Sección de Contacto -->
        <section id="contact-section" class="main-section container-section">
            <h2 class="text-4xl font-bold mb-6 text-custom-blue border-b-2 pb-2">Contáctanos</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p class="text-lg text-gray-700 mb-4">Estamos listos para ayudarte. Ponte en contacto con nosotros para cotizaciones, pedidos o cualquier consulta.</p>
                    <ul class="space-y-4 text-gray-700">
                        <li class="flex items-center">
                            <span class="font-semibold text-custom-blue mr-2">WhatsApp:</span> 809-281-9109
                        </li>
                        <li class="flex items-center">
                            <span class="font-semibold text-custom-blue mr-2">Email:</span> solucionesbellcore@gmail.com
                        </li>
                        <li class="flex items-center">
                            <span class="font-semibold text-custom-blue mr-2">Dirección:</span> Calle Esteban Suazo #7, Antillas el Cacique, Sto. Dom. D.N.
                        </li>
                    </ul>
                </div>
                <!-- Formulario de contacto (diseño básico) -->
                <div class="bg-gray-100 p-8 rounded-xl shadow-md">
                    <form id="contact-form" class="space-y-4">
                        <div class="mb-4">
                            <label for="name" class="block text-gray-700 font-bold mb-2">Nombre</label>
                            <input type="text" id="name" name="name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue" placeholder="Tu nombre" required>
                        </div>
                        <div class="mb-4">
                            <label for="email" class="block text-gray-700 font-bold mb-2">Correo Electrónico</label>
                            <input type="email" id="email" name="email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue" placeholder="tu-correo@ejemplo.com" required>
                        </div>
                        <div class="mb-4">
                            <label for="message" class="block text-gray-700 font-bold mb-2">Mensaje</label>
                            <textarea id="message" name="message" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue" placeholder="Escribe tu mensaje aquí..." required></textarea>
                        </div>
                        <button type="submit" class="w-full bg-custom-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-custom-blue-dark transition duration-300">
                            Enviar Mensaje
                        </button>
                    </form>
                </div>
            </div>
        </section>
        
        <!-- Sección de Pago -->
        <section id="payment-section" class="main-section container-section text-center">
            <h2 class="text-4xl font-bold mb-6 text-custom-blue border-b-2 pb-2">Detalles de Pago</h2>
            <p class="text-gray-700 mb-4">Esta es una sección de demostración. Aquí se integrarían los campos para el pago con tarjeta de crédito y débito.</p>
            <div class="flex items-center justify-center mb-6">
                <img src="https://placehold.co/100x60/808080/ffffff?text=Visa" alt="Tarjeta Visa" class="h-12 mr-4">
                <img src="https://placehold.co/100x60/808080/ffffff?text=Mastercard" alt="Tarjeta Mastercard" class="h-12">
            </div>
            <button onclick="showSection('cart')" class="py-2 px-6 bg-custom-blue text-white font-semibold rounded-full hover:bg-custom-blue-dark transition duration-300">Volver al Carrito</button>
        </section>

    </main>

    <!-- Pie de página (Footer) -->
    <footer class="text-center p-6 mt-12 bg-gray-200 rounded-xl shadow-inner">
        <p class="text-gray-600">© 2025 Soluciones Bellcore SRL. Todos los derechos reservados.</p>
    </footer>
    
    <!-- Modal para mensajes del sistema -->
    <div id="message-modal" class="message-modal">
        <div class="message-content">
            <p id="modal-text" class="text-lg"></p>
            <button onclick="hideModal()" class="mt-4 px-4 py-2 bg-custom-blue text-white rounded-full hover:bg-custom-blue-dark">OK</button>
        </div>
    </div>

    <!-- Firebase SDKs -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, collection, getDocs, setDoc, doc, query, onSnapshot, getCountFromServer } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Definición de los productos organizados por categoría y sus precios
        const productData = {
            "Papelería y Suministros Escolares": [
                "Cuadernos", "Tijera sin punta", "Resma de Papel Bond", "Lápiz de Carbon", "Lápiz de color",
                "Diccionario básico", "Borrador de leche", "Sacapuntas de metal", "Témpera", "Masilla",
                "Plastilina", "Papel de colores", "Foami de colores", "Foami brillo", "Cartulinas de colores",
                "Papel Crepe", "Gaza", "Hilos de lana", "Papel de construcción", "Cinta adhesiva",
                "Hojas de papel fieltro", "Crayones Jumbo", "Diamantina Adhesiva", "Vasos Paq No. 7",
                "Ega Grande", "Paq Hojas de colores", "Cinta adhesiva grande", "Juego educativo",
                "Libro de lectura", "Libro Apprendo con Titi"
            ],
            "Consumibles de Impresión": [
                "Tinta Epson BK 544", "Tinta Epson Cyan 544", "Tinta Epson Magenta 544", "Tinta Epson Yellow 544",
                "Bolígrafos Bic"
            ],
            "Productos de Limpieza": [
                "Cloro Blancox (Galón)", "Papel Toalla Fardo 6/1", "Papel Higiénico Paq 8", "Silicon líquido", "Toalla de manos"
            ]
        };

        const mockPrices = {
            "Cuadernos": 85.00,
            "Tijera sin punta": 110.00,
            "Resma de Papel Bond": 450.00,
            "Lápiz de Carbon": 250.00,
            "Lápiz de color": 414.00,
            "Diccionario básico": 700.00,
            "Borrador de leche": 20.00,
            "Sacapuntas de metal": 10.00,
            "Témpera": 180.00,
            "Masilla": 150.00,
            "Plastilina": 80.00,
            "Papel de colores": 300.00,
            "Foami de colores": 10.00,
            "Foami brillo": 10.00,
            "Cartulinas de colores": 15.00,
            "Papel Crepe": 10.00,
            "Gaza": 100.00,
            "Hilos de lana": 100.00,
            "Papel de construcción": 15.00,
            "Cinta adhesiva": 200.00,
            "Hojas de papel fieltro": 150.00,
            "Crayones Jumbo": 110.00,
            "Diamantina Adhesiva": 50.00,
            "Vasos Paq No. 7": 40.00,
            "Ega Grande": 120.00,
            "Paq Hojas de colores": 150.00,
            "Cinta adhesiva grande": 250.00,
            "Juego educativo": 750.00,
            "Libro de lectura": 600.00,
            "Libro Apprendo con Titi": 600.00,
            "Tinta Epson BK 544": 750.00,
            "Tinta Epson Cyan 544": 750.00,
            "Tinta Epson Magenta 544": 750.00,
            "Tinta Epson Yellow 544": 750.00,
            "Bolígrafos Bic": 200.00,
            "Cloro Blancox (Galón)": 190.00,
            "Papel Toalla Fardo 6/1": 950.00,
            "Papel Higiénico Paq 8": 250.00,
            "Silicon líquido": 150.00,
            "Toalla de manos": 90.00
        };

        const catalogContainer = document.getElementById('catalog-container');
        const loadingMessage = document.getElementById('loading-message');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        const cartCountSpan = document.getElementById('cart-count');
        const cartCountSpanMobile = document.getElementById('cart-count-mobile');
        const cartEmptyMessage = document.getElementById('cart-empty-message');
        const checkoutBtn = document.getElementById('checkout-btn');

        let cart = [];
        let db, auth, userId;

        // Función para mostrar una sección y ocultar las demás
        window.showSection = function(sectionId) {
            document.querySelectorAll('.main-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionId}-section`).classList.add('active');

            // Si la sección es el carrito, renderizar su contenido
            if (sectionId === 'cart') {
                renderCart();
            } else if (sectionId === 'products') {
                // El catálogo se renderiza con el listener de Firestore, solo aseguramos que el div esté vacío
                catalogContainer.innerHTML = '';
                loadingMessage.style.display = 'block';
            }
            
            // Cerrar el menú móvil si está abierto
            const mobileMenu = document.getElementById('mobile-menu');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }

        // Función para mostrar un modal de mensaje
        window.showModal = function(message) {
            const modal = document.getElementById('message-modal');
            document.getElementById('modal-text').textContent = message;
            modal.style.display = 'flex';
        }

        window.hideModal = function() {
            document.getElementById('message-modal').style.display = 'none';
        }
        
        // Lógica de generación de imágenes con retroceso exponencial
        async function generateImage(prompt) {
            const apiKey = ""; // API Key will be automatically provided by the Canvas environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const payload = {
                instances: {
                    prompt: `A high-quality photo of a new, modern product for an office catalog: a ${prompt}`
                },
                parameters: {
                    "sampleCount": 1
                }
            };
            
            let result;
            const maxRetries = 5;
            let currentRetry = 0;

            while (currentRetry < maxRetries) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    // Si la respuesta es 401 (no autorizado), no reintentar
                    if (response.status === 401) {
                         console.error("Authentication error (401). Skipping image generation.");
                         return `https://placehold.co/300x200/dbeafe/1e3a8a?text=${encodeURIComponent(prompt)}`;
                    }

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    result = await response.json();
                    
                    // Nota: Se ha modificado esta parte para no almacenar la imagen en la base de datos
                    // directamente. En su lugar, generaremos una URL de placeholder.
                    // Esto evita el error de "valor más largo que 1048487 bytes".
                    // La generación real de la imagen se ha desactivado para evitar errores.
                    
                    // if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                    //     return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                    // } else {
                    //     throw new Error('Unexpected API response structure.');
                    // }
                    return `https://placehold.co/300x200/dbeafe/1e3a8a?text=${encodeURIComponent(prompt)}`;

                } catch (error) {
                    console.error(`Error generating image for "${prompt}":`, error);
                    currentRetry++;
                    const delay = Math.pow(2, currentRetry) * 1000; // Exponential backoff
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            console.error(`Failed to generate image for "${prompt}" after ${maxRetries} retries.`);
            return `https://placehold.co/300x200/dbeafe/1e3a8a?text=${encodeURIComponent(prompt)}`; // Fallback placeholder
        }

        // Función para renderizar el catálogo a partir de los datos de Firestore
        function renderCatalog(products) {
            catalogContainer.innerHTML = ''; // Limpiar el contenedor actual
            loadingMessage.style.display = 'none';

            // Organizar productos por categoría
            const productsByCategory = products.reduce((acc, product) => {
                const category = product.category || 'Otros';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(product);
                return acc;
            }, {});

            for (const category in productsByCategory) {
                const categorySection = document.createElement('section');
                categorySection.className = "mb-10";

                const categoryTitle = document.createElement('h3');
                categoryTitle.className = "text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-400 pb-2";
                categoryTitle.textContent = category;
                categorySection.appendChild(categoryTitle);

                const productsGrid = document.createElement('div');
                productsGrid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6";
                categorySection.appendChild(productsGrid);
                
                catalogContainer.appendChild(categorySection);

                productsByCategory[category].forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = "product-card bg-gray-100 p-4 rounded-xl text-center shadow-md flex flex-col items-center";

                    const imageElement = document.createElement('img');
                    imageElement.src = product.imageUrl || `https://placehold.co/300x200/dbeafe/1e3a8a?text=${encodeURIComponent(product.name)}`;
                    imageElement.alt = product.name;
                    imageElement.className = "w-full h-32 object-cover rounded-lg";

                    const productName = document.createElement('p');
                    productName.className = "mt-4 text-base sm:text-lg font-semibold text-gray-700 text-center";
                    productName.textContent = product.name;

                    const productPrice = document.createElement('p');
                    productPrice.className = "text-sm text-gray-500 mt-1";
                    productPrice.textContent = `RD$ ${product.price.toFixed(2)}`;

                    const addToCartBtn = document.createElement('button');
                    addToCartBtn.className = "mt-2 px-4 py-2 text-xs bg-custom-blue text-white rounded-full hover:bg-custom-blue-dark transition duration-300";
                    addToCartBtn.textContent = "Agregar al Carrito";
                    addToCartBtn.onclick = () => addToCart(product.name, product.price);

                    productCard.appendChild(imageElement);
                    productCard.appendChild(productName);
                    productCard.appendChild(productPrice);
                    productCard.appendChild(addToCartBtn);
                    productsGrid.appendChild(productCard);
                });
            }
        }

        // Lógica del carrito de compras
        function addToCart(product, price) {
            const existingItem = cart.find(item => item.name === product);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name: product, price: price, quantity: 1 });
            }
            updateCartUI();
            showModal(`${product} ha sido agregado al carrito.`);
        }

        function removeFromCart(productName) {
            cart = cart.filter(item => item.name !== productName);
            updateCartUI();
        }

        function updateCartUI() {
            cartItemsContainer.innerHTML = '';
            let total = 0;
            if (cart.length > 0) {
                cartEmptyMessage.style.display = 'none';
                checkoutBtn.disabled = false;
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.className = "flex justify-between items-center bg-gray-50 p-4 rounded-lg";
                    cartItemDiv.innerHTML = `
                        <div>
                            <p class="font-semibold">${item.name} x ${item.quantity}</p>
                            <p class="text-sm text-gray-500">RD$ ${item.price.toFixed(2)} c/u</p>
                        </div>
                        <div class="flex items-center">
                            <p class="text-lg font-bold mr-4">RD$ ${itemTotal.toFixed(2)}</p>
                            <button onclick="removeFromCart('${item.name}')" class="text-red-500 hover:text-red-700 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm8 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItemDiv);
                });
            } else {
                cartEmptyMessage.style.display = 'block';
                checkoutBtn.disabled = true;
            }
            cartTotalSpan.textContent = `RD$ ${total.toFixed(2)}`;
            cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpanMobile.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }

        function renderCart() {
            updateCartUI();
        }

        // Lógica del formulario de contacto
        document.getElementById('contact-form').addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            console.log("Formulario de Contacto Enviado:", { name, email, message });
            showModal(`¡Gracias, ${name}! Tu mensaje ha sido enviado.`);
            this.reset();
        });
        
        // Script para el menú móvil
        document.getElementById('menu-button').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Lógica de inicialización de Firebase y carga de productos
        // Se cambió el nombre de la función para evitar conflictos con el 'import'
        async function initializeAppAndLoadData() {
            try {
                // Asignar el ID de la aplicación
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                document.getElementById('app-id-display').textContent = appId;

                // Inicializar Firebase
                const firebaseConfig = JSON.parse(__firebase_config);
                const app = initializeApp(firebaseConfig);
                db = getFirestore(app);
                auth = getAuth(app);

                // Autenticar al usuario
                if (typeof __initial_auth_token !== 'undefined') {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
                userId = auth.currentUser.uid;
                
                // Configurar la ruta de la colección de productos
                const productsCollectionPath = `/artifacts/${appId}/users/${userId}/products`;
                const productsCollection = collection(db, productsCollectionPath);
                
                // Verificar si la colección está vacía y rellenarla si es necesario
                const snapshot = await getCountFromServer(productsCollection);
                if (snapshot.data().count === 0) {
                    await setupInitialData(productsCollection);
                }

                // Configurar un listener en tiempo real para la colección de productos
                onSnapshot(productsCollection, (querySnapshot) => {
                    const products = [];
                    querySnapshot.forEach((doc) => {
                        products.push({ id: doc.id, ...doc.data() });
                    });
                    renderCatalog(products);
                });

            } catch (error) {
                console.error("Error al inicializar la aplicación:", error);
                loadingMessage.textContent = "Error al cargar los productos.";
            }
        }
        
        // Función para rellenar la base de datos con los datos iniciales
        async function setupInitialData(productsCollection) {
            loadingMessage.textContent = "Cargando productos iniciales y generando imágenes...";
            for (const category in productData) {
                for (const productName of productData[category]) {
                    const price = mockPrices[productName];
                    if (price) {
                        try {
                            const imageUrl = await generateImage(productName);
                            await setDoc(doc(productsCollection), {
                                name: productName,
                                price: price,
                                category: category,
                                imageUrl: imageUrl
                            });
                        } catch (error) {
                            console.error(`Error procesando producto ${productName}:`, error);
                            // Usar un placeholder si la generación de imagen falla
                            await setDoc(doc(productsCollection), {
                                name: productName,
                                price: price,
                                category: category,
                                imageUrl: `https://placehold.co/300x200/dbeafe/1e3a8a?text=${encodeURIComponent(productName)}`
                            });
                        }
                    }
                }
            }
            showModal("Los productos iniciales han sido agregados a tu base de datos. ¡Ahora son dinámicos!");
            loadingMessage.style.display = 'none';
        }

        // Inicializar la aplicación cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            initializeAppAndLoadData();
            showSection('home');
        });
    </script>
</body>
</html>
