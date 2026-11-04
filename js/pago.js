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

paymentForm.addEventListener('submit', async function(e) {
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

    try {
        const [logoResponse, headingFontResponse, bodyFontResponse] = await Promise.all([
            fetch('assets/images/iconos/LogoCasaLibre.jpg'),
            fetch('fonts/Anton-Regular.ttf'),
            fetch('fonts/JetBrainsMono-Regular.ttf')
        ]);

        [logoResponse, headingFontResponse, bodyFontResponse].forEach(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar un recurso de la factura: ${response.url}`);
            }
        });

        const [logoBlob, headingFontBuffer, bodyFontBuffer] = await Promise.all([
            logoResponse.blob(),
            headingFontResponse.arrayBuffer(),
            bodyFontResponse.arrayBuffer()
        ]);

        const toBase64 = buffer => {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let offset = 0; offset < bytes.length; offset += 0x8000) {
                binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
            }
            return window.btoa(binary);
        };

        const logoData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer el logo de Casa Libre.'));
            reader.readAsDataURL(logoBlob);
        });

        doc.addFileToVFS('Anton-Regular.ttf', toBase64(headingFontBuffer));
        doc.addFont('Anton-Regular.ttf', 'Anton', 'normal');
        doc.addFileToVFS('JetBrainsMono-Regular.ttf', toBase64(bodyFontBuffer));
        doc.addFont('JetBrainsMono-Regular.ttf', 'JetBrainsMono', 'normal');

        const method = paymentMethod.value;
        const fecha = new Date().toLocaleDateString();
        const factura = Math.floor(Math.random() * 100000);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Colores de la marca profesionales y armónicos
        const colors = {
            green: [29, 68, 67],       // Verde corporativo
            burgundy: [126, 2, 0],     // Burdeos / Rojo de acento
            beige: [240, 237, 230],    // Fondo sutil para tablas y tarjetas
            paper: [252, 250, 247],    // Fondo general de la página muy limpio
            brown: [50, 50, 50],       // Texto principal (gris oscuro para mayor legibilidad)
            white: [255, 255, 255]
        };

        // Fondo general
        doc.setFillColor(...colors.paper);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Franja superior institucional
        doc.setFillColor(...colors.green);
        doc.rect(0, 0, pageWidth, 45, 'F');
        doc.setFillColor(...colors.burgundy);
        doc.rect(0, 45, pageWidth, 2.5, 'F');

        // Logo y Títulos en el Header
        const logoProperties = doc.getImageProperties(logoData);
        const logoHeight = 26;
        const logoWidth = logoHeight * logoProperties.width / logoProperties.height;
        doc.addImage(logoData, 'PNG', 15, 9.5, logoWidth, logoHeight);
        
        doc.setTextColor(...colors.white);
        doc.setFont('Anton', 'normal');
        doc.setFontSize(24);
        doc.text('CASA LIBRE', 20 + logoWidth, 26);
        
        doc.setFontSize(13);
        doc.text('COMPROBANTE DE PAGO', pageWidth - 15, 26, { align: 'right' });

        // Tarjeta de información de Factura (Número y Fecha)
        doc.setFillColor(...colors.white);
        doc.setDrawColor(...colors.beige);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, 55, pageWidth - 30, 18, 2, 2, 'FD');

        doc.setFont('JetBrainsMono', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.brown);
        doc.text(`Factura N°: ${factura}`, 22, 66);
        doc.text(`Fecha de emisión: ${fecha}`, pageWidth - 22, 66, { align: 'right' });

        // Sección: Datos del Cliente
        doc.setFont('Anton', 'normal');
        doc.setTextColor(...colors.green);
        doc.setFontSize(14);
        doc.text('DATOS DEL CLIENTE', 15, 87);
        
        doc.setDrawColor(...colors.burgundy);
        doc.setLineWidth(0.5);
        doc.line(15, 91, pageWidth - 15, 91);

        doc.setFont('JetBrainsMono', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...colors.brown);
        
        let clientY = 100;
        doc.text(`Nombre:`, 15, clientY);
        doc.text(`${clientName}`, 38, clientY);
        
        clientY += 6;
        doc.text(`Teléfono:`, 15, clientY);
        doc.text(`${clientPhone}`, 38, clientY);
        
        clientY += 6;
        doc.text(`Dirección:`, 15, clientY);
        doc.text(`${clientAddress}`, 38, clientY);
        
        clientY += 6;
        doc.text(`Método:`, 15, clientY);
        doc.text(`${method}`, 38, clientY);

        // Tabla de Productos - Cabecera
        let y = 126;
        doc.setFillColor(...colors.green);
        doc.roundedRect(15, y - 5, pageWidth - 30, 10, 1.5, 1.5, 'F');
        
        doc.setFont('Anton', 'normal');
        doc.setTextColor(...colors.white);
        doc.setFontSize(9.5);
        doc.text('Descripción del Producto', 20, y + 1.5);
        doc.text('Cant.', 115, y + 1.5, { align: 'center' });
        doc.text('Precio U.', 145, y + 1.5, { align: 'right' });
        doc.text('Subtotal', pageWidth - 20, y + 1.5, { align: 'right' });

        y += 10;
        let total = 0;

        // Iteración de productos
        products.forEach((prod, index) => {
            const subtotal = prod.price * prod.quantity;
            total += subtotal;

            // Filas alternadas para mayor orden visual
            if (index % 2 === 0) {
                doc.setFillColor(...colors.beige);
                doc.rect(15, y - 4.5, pageWidth - 30, 9, 'F');
            }

            doc.setFont('JetBrainsMono', 'normal');
            doc.setTextColor(...colors.brown);
            doc.setFontSize(9);
            
            // Truncar texto largo de productos si sobrepasa el espacio
            const titleText = doc.splitTextToSize(prod.title, 85);
            doc.text(titleText, 20, y);
            
            doc.text(String(prod.quantity), 115, y, { align: 'center' });
            doc.text(`$${prod.price.toFixed(2)}`, 145, y, { align: 'right' });
            doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 20, y, { align: 'right' });
            
            y += 9;
        });

        // Línea divisoria antes del total
        y += 4;
        doc.setDrawColor(...colors.burgundy);
        doc.setLineWidth(0.6);
        doc.line(15, y, pageWidth - 15, y);
        y += 12;

        // Bloque del Total
        doc.setFillColor(...colors.beige);
        doc.roundedRect(pageWidth - 85, y - 7, 70, 14, 2, 2, 'F');
        
        doc.setFont('Anton', 'normal');
        doc.setTextColor(...colors.burgundy);
        doc.setFontSize(14);
        doc.text('TOTAL:', pageWidth - 78, y + 1);
        doc.text(`$${total.toFixed(2)}`, pageWidth - 20, y + 1, { align: 'right' });

        y += 25;

        // Pie de página de agradecimiento
        doc.setFont('JetBrainsMono', 'normal');
        doc.setTextColor(...colors.brown);
        doc.setFontSize(9);
        doc.text('¡Gracias por comprar en Casa Libre!', 15, y);
        y += 5;
        doc.text('Esperamos verte pronto nuevamente.', 15, y);

        doc.save(`Factura_${factura}.pdf`);
    } catch (error) {
        console.error('Error generando la factura:', error);
        alert('No se pudo generar la factura. Verifica tu conexión e inténtalo de nuevo.');
        return;
    }

    localStorage.removeItem('cartProducts');
    localStorage.removeItem('checkoutProducts');

    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 1000);
});