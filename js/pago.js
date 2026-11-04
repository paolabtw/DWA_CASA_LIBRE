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
const paymentError = document.querySelector('#paymentError');

let products = [];

function showPaymentError(message, error) {
    console.error(message, error);
    paymentError.textContent = message;
    paymentError.classList.remove('d-none');
}

function clearPaymentError() {
    paymentError.textContent = '';
    paymentError.classList.add('d-none');
}

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

// MANEJO DE ERRORES: captura problemas al leer o mostrar el resumen guardado.
try {
    const storedProducts = localStorage.getItem('checkoutProducts');
    products = storedProducts ? JSON.parse(storedProducts) : [];
    if (!Array.isArray(products)) {
        throw new Error('El resumen de compra guardado no tiene un formato válido.');
    }
    loadProducts();
} catch (error) {
    showPaymentError('No se pudo cargar el resumen de la compra. Actualiza la página e inténtalo de nuevo.', error);
}

function validateTextOnly(value) {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(value.trim());
}

function validatePhone(value) {
    return /^\d{4}-\d{4}$/.test(value.trim());
}

function validateCardNumber(value) {
    const digits = value.replace(/\D/g, '');
    return /^\d{16}$/.test(digits);
}

function validateCardExpiry(value) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value.trim());
}

function validateCardCvv(value) {
    return /^\d{3}$/.test(value.trim());
}

// FORMATO DE VALIDACIONES: agrupa teléfono y tarjeta, y limita la entrada del CVV.
function formatGroupedDigits(field, maxDigits, groupSize, separator) {
    const cursor = field.selectionStart;
    const digitsBeforeCursor = field.value.slice(0, cursor).replace(/\D/g, '').length;
    const digits = field.value.replace(/\D/g, '').slice(0, maxDigits);
    const formattedValue = digits.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(separator) || '';

    field.value = formattedValue;

    let newCursor = 0;
    let digitsCounted = 0;
    while (newCursor < formattedValue.length && digitsCounted < digitsBeforeCursor) {
        if (/\d/.test(formattedValue[newCursor])) digitsCounted += 1;
        newCursor += 1;
    }
    field.setSelectionRange(newCursor, newCursor);
}

function limitToDigits(field, maxDigits) {
    field.value = field.value.replace(/\D/g, '').slice(0, maxDigits);
}

// FORMATO DE VENCIMIENTO: inserta automáticamente la barra después de los dos dígitos del mes.
function formatCardExpiry(field) {
    const cursor = field.selectionStart;
    const digitsBeforeCursor = field.value.slice(0, cursor).replace(/\D/g, '').length;
    const digits = field.value.replace(/\D/g, '').slice(0, 4);
    const formattedValue = digits.length >= 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;

    field.value = formattedValue;
    const newCursor = digitsBeforeCursor < 2
        ? digitsBeforeCursor
        : Math.min(3 + digitsBeforeCursor - 2, formattedValue.length);
    field.setSelectionRange(newCursor, newCursor);
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
    [clientNameField, clientPhoneField, clientAddressField, paymentMethod, cardNumberField, cardExpiryField, cardCvvField].forEach(clearFieldState);
}

// VALIDACIONES DE DATOS DEL CLIENTE: formato obligatorio del teléfono y entradas de tarjeta.
clientPhoneField.addEventListener('input', () => {
    formatGroupedDigits(clientPhoneField, 8, 4, '-');
    clearFieldState(clientPhoneField);
});

cardNumberField.addEventListener('input', () => {
    formatGroupedDigits(cardNumberField, 16, 4, ' ');
    clearFieldState(cardNumberField);
});

cardExpiryField.addEventListener('input', () => {
    formatCardExpiry(cardExpiryField);
    clearFieldState(cardExpiryField);
});

cardCvvField.addEventListener('input', () => {
    limitToDigits(cardCvvField, 3);
    clearFieldState(cardCvvField);
});

paymentMethod.addEventListener('change', () => {

    const value = paymentMethod.value;

    cardFields.style.display = 'none';
    transferFields.style.display = 'none';
    clearFieldState(paymentMethod);

    if (value === 'Tarjeta') {

        cardFields.style.display = 'block';

    }

    if (value === 'Transferencia') {

        transferFields.style.display = 'block';

    }

});

// VALIDACIÓN AL PAGAR: verifica datos obligatorios del cliente y los campos de tarjeta seleccionados.
paymentForm.addEventListener('submit', function(e) {

    e.preventDefault();
    clearPaymentError();

    clearAllFieldStates();

    const clientName = clientNameField.value.trim();
    const clientPhone = clientPhoneField.value.trim();
    const clientAddress = clientAddressField.value.trim();

    let isValid = true;

    if (!clientName || !validateTextOnly(clientName)) {
        setInvalidField(clientNameField, 'Por favor ingresa un nombre completo válido (sin números).');
        isValid = false;
    }

    if (!validatePhone(clientPhone)) {
        setInvalidField(clientPhoneField, 'Por favor ingresa un teléfono válido en formato 0000-0000.');
        isValid = false;
    }

    if (!clientAddress) {
        setInvalidField(clientAddressField, 'Por favor ingresa una dirección válida.');
        isValid = false;
    }

    if (!paymentMethod.value) {
        setInvalidField(paymentMethod, 'Por favor selecciona un método de pago.');
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
            setInvalidField(cardCvvField, 'Por favor ingresa un CVV de 3 dígitos.');
            isValid = false;
        }
    }

    if (!isValid) {
        return;
    }

    // MANEJO DE ERRORES: captura fallos al generar la factura o procesar el cierre de compra.
    try {
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
    } catch (error) {
        showPaymentError('No se pudo generar la factura ni completar la compra. Inténtalo de nuevo.', error);
    }

});