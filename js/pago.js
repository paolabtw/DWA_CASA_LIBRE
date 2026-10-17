const productsContainer = document.querySelector('#productsContainer');
const totalPay = document.querySelector('#totalPay');
const paymentForm = document.querySelector('#paymentForm');
const paymentMethod = document.querySelector('#paymentMethod');
const cardFields = document.querySelector('#cardFields');
const transferFields = document.querySelector('#transferFields');
const clientNameField = document.querySelector('#clientName');
const clientPhoneField = document.querySelector('#clientPhone');
const clientAddressField = document.querySelector('#clientAddress');
const cardNumberField = document.querySelector('#cardNumber');
const cardExpiryField = document.querySelector('#cardExpiry');
const cardCvvField = document.querySelector('#cardCvv');

let products =
    JSON.parse(localStorage.getItem('checkoutProducts')) || [];

function loadProducts() {

    let total = 0;

    products.forEach(prod => {

        total += prod.price * prod.quantity;

        const div = document.createElement('div');

        div.classList.add(
            'd-flex',
            'justify-content-between',
            'align-items-center',
            'mb-3',
            'border-bottom',
            'pb-2'
        );

        div.innerHTML = `
            <div>
                <h6 class="mb-1">${prod.title}</h6>
                <small>Cantidad: ${prod.quantity}</small>
            </div>

            <strong>
                $${(prod.price * prod.quantity).toFixed(2)}
            </strong>
        `;

        productsContainer.appendChild(div);

    });

    totalPay.textContent = total.toFixed(2);

}

loadProducts();

function validateTextOnly(value) {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(value.trim());
}

function validatePhoneOnly(value) {
    return /^\d+$/.test(value.trim());
}

function validateCardNumber(value) {
    const digits = value.replace(/\s+/g, '');
    return /^\d{16}$/.test(digits);
}

function validateCardExpiry(value) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim());
}

function validateCardCvv(value) {
    return /^\d{3,4}$/.test(value.trim());
}

function setInvalidField(field, message) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    const feedback = field.parentElement.querySelector('.invalid-feedback');
    if (feedback) feedback.textContent = message;
}

function clearFieldState(field) {
    field.classList.remove('is-invalid');
    field.classList.remove('is-valid');
}

function clearAllFieldStates() {
    [clientNameField, clientPhoneField, clientAddressField, cardNumberField, cardExpiryField, cardCvvField].forEach(clearFieldState);
}

paymentMethod.addEventListener('change', () => {

    const value = paymentMethod.value;

    cardFields.style.display = 'none';
    transferFields.style.display = 'none';

    if (value === 'Tarjeta') {

        cardFields.style.display = 'block';

    }

    if (value === 'Transferencia') {

        transferFields.style.display = 'block';

    }

});

paymentForm.addEventListener('submit', function(e) {

    e.preventDefault();

    clearAllFieldStates();

    const clientName = clientNameField.value;
    const clientPhone = clientPhoneField.value;
    const clientAddress = clientAddressField.value;

    let isValid = true;

    if (!validateTextOnly(clientName)) {
        setInvalidField(clientNameField, 'Por favor ingresa un nombre completo válido (sin números).');
        isValid = false;
    }

    if (!validatePhoneOnly(clientPhone)) {
        setInvalidField(clientPhoneField, 'Por favor ingresa un teléfono válido (solo números).');
        isValid = false;
    }

    if (paymentMethod.value === 'Tarjeta') {
        if (!validateCardNumber(cardNumberField.value)) {
            setInvalidField(cardNumberField, 'Por favor ingresa un número de tarjeta válido de 16 dígitos.');
            isValid = false;
        }

        if (!validateCardExpiry(cardExpiryField.value)) {
            setInvalidField(cardExpiryField, 'Por favor ingresa una fecha de vencimiento válida en formato MM/AA.');
            isValid = false;
        }

        if (!validateCardCvv(cardCvvField.value)) {
            setInvalidField(cardCvvField, 'Por favor ingresa un CVV válido de 3 o 4 dígitos.');
            isValid = false;
        }
    }

    if (!isValid) {
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    //datos
    const method = paymentMethod.value;
    const fecha = new Date().toLocaleDateString();
    const factura = Math.floor(Math.random() * 100000);


    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('CASA LIBRE', 20, 20);
    doc.setFontSize(12);
    doc.text('FACTURA DE COMPRA', 140, 20);
    doc.setTextColor(0, 0, 0);


    let y = 45;
    doc.setFontSize(13);
    doc.text(`Factura #: ${factura}`, 20, y);
    y += 10;
    doc.text(`Fecha: ${fecha}`, 20, y);
    y += 15;
    doc.setFontSize(14);
    doc.text('DATOS DEL CLIENTE', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Nombre: ${clientName}`, 20, y);
    y += 8;
    doc.text(`Telefono: ${clientPhone}`, 20, y);
    y += 8;
    doc.text(`Direccion: ${clientAddress}`, 20, y);
    y += 8;
    doc.text(`Metodo de pago: ${method}`, 20, y);
    y += 15;

    //LINEA
    doc.line(20, y, 190, y);

    y += 10;

    //TITULOS TABLA
    doc.setFillColor(230, 230, 230);
    doc.rect(20, y - 6, 170, 10, 'F');
    doc.text('Producto', 25, y);
    doc.text('Cant.', 110, y);
    doc.text('Precio', 140, y);
    doc.text('Subtotal', 170, y);

    y += 10;
    let total = 0;

    //PRODUCTOS
    products.forEach(prod => {

        const subtotal =
            prod.price * prod.quantity;

        total += subtotal;

        doc.text(prod.title, 25, y);

        doc.text(
            String(prod.quantity),
            112,
            y
        );

        doc.text(
            `$${prod.price.toFixed(2)}`,
            138,
            y
        );

        doc.text(
            `$${subtotal.toFixed(2)}`,
            170,
            y
        );

        y += 10;

    });

    y += 5;

    doc.line(20, y, 190, y);

    y += 15;

    doc.setFontSize(18);

    doc.text(
        `TOTAL: $${total.toFixed(2)}`,
        130,
        y
    );

    y += 20;


    doc.setFontSize(12);

    doc.text(
        'Gracias por comprar en Casa Libre',
        20,
        y
    );

    y += 8;

    doc.text(
        'Esperamos verte pronto nuevamente.',
        20,
        y
    );

    
    doc.save(`Factura_${factura}.pdf`);


    localStorage.removeItem('cartProducts');
    localStorage.removeItem('checkoutProducts');


    setTimeout(() => {

        window.location.href = 'menu.html';

    }, 1000);

});