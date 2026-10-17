let productsArray = [];

//Selectores (se asignan después del DOMContentLoaded) 
let badge, cartItems, totalProducts, totalPrice, payBtn;

document.addEventListener('DOMContentLoaded', () => {

    badge         = document.querySelector('.badge');
    cartItems     = document.querySelector('#cartItems');
    totalProducts = document.querySelector('#totalProducts');
    totalPrice    = document.querySelector('#totalPrice');
    payBtn        = document.querySelector('#payBtn');

    loadLocal();
    eventListeners();

    //Re-renderiza si cambia el tamaño (ej: rotación móvil)
    window.addEventListener('resize', () => renderCart());

});

//Event Listeners
function eventListeners() {

    // Delegar click en todo el main (las cards están dentro de main)
    document.querySelector('main').addEventListener('click', getDataElements);

    if (payBtn) {
        payBtn.addEventListener('click', payProducts);
    }

}

//Captura click en "Agregar al Carrito" 
function getDataElements(e) {

    if (e.target.classList.contains('btn-agregar')) {

        //article.card es el ancestro directo de la card
        const productCard = e.target.closest('.card');
        selectData(productCard);

    }

}

//Extrae datos de la card y los agrega al carrito 
function selectData(card) {

    let precio = 0;

    //Pizzas tienen <select class="size-select">
    const select = card.querySelector('.size-select');

    if (select) {

        precio = parseFloat(select.value);

    } else {

        //Precio está en el <span> dentro del <h3>
        precio = parseFloat(
            card.querySelector('.menu-item h3 span').textContent.replace('$', '')
        );

    }

    const btn = card.querySelector('.btn-agregar');

    const productObj = {
        img:      card.querySelector('img').src,
        title:    card.querySelector('h3').childNodes[0].textContent.trim(),
        price:    precio,
        id:       btn.dataset.id,
        quantity: 1
    };

    //Evita duplicados (mismo id Y mismo precio — cubre pizzas con distinto tamaño)
    const exists = productsArray.some(
        p => p.id === productObj.id && p.price === productObj.price
    );

    if (exists) {
        showAlert('Este producto ya fue agregado', 'error');
        return;
    }

    productsArray.push(productObj);
    showAlert('Producto agregado al carrito ✓', 'success');
    saveLocal();
    renderCart();

}

//Renderiza el carrito (tabla en desktop, tarjetas en móvil) 
function renderCart() {

    if (!cartItems) return;

    const isMobile = window.innerWidth < 768;

    //En móvil se oculta el thead de la tabla
    const thead = cartItems.closest('table')?.querySelector('thead');
    if (thead) thead.style.display = isMobile ? 'none' : '';

    cartItems.innerHTML = '';

    productsArray.forEach((prod, index) => {

        const inputId   = `qty-input-${index}`;
        const inputName = `qty-${index}`;

        if (isMobile) {

            //TARJETA MÓVIL
            const tr  = document.createElement('tr');
            const td  = document.createElement('td');
            td.colSpan = 5;
            td.style.padding = '8px 0';

            td.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 10px;
                ">
                    <img
                        src="${prod.img}"
                        alt="${prod.title}"
                        style="width:65px;height:65px;object-fit:cover;border-radius:8px;flex-shrink:0;"
                    />
                    <div style="flex:1;min-width:0;">
                        <p style="margin:0;font-weight:600;font-size:14px;
                                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${prod.title}
                        </p>
                        <p style="margin:4px 0 0;color:#555;font-size:13px;">
                            $${prod.price.toFixed(2)}
                        </p>
                        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                            <label for="${inputId}" style="font-size:12px;margin:0;">Cant.</label>
                            <input
                                type="number"
                                id="${inputId}"
                                name="${inputName}"
                                min="1"
                                value="${prod.quantity}"
                                autocomplete="off"
                                style="width:60px;"
                                class="form-control form-control-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        class="btn btn-danger btn-sm cart-delete"
                        data-index="${index}"
                        style="flex-shrink:0;padding:6px 10px;"
                        aria-label="Eliminar ${prod.title}">
                        🗑
                    </button>
                </div>
            `;

            //Evento cantidad
            td.querySelector(`#${inputId}`).addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                productsArray[index].quantity = val;
                renderCart();
            });

            //Evento eliminar
            td.querySelector('.cart-delete').addEventListener('click', () => {
                productsArray.splice(index, 1);
                showAlert('Producto eliminado', 'error');
                renderCart();
            });

            tr.appendChild(td);
            cartItems.appendChild(tr);

        } else {

            //FILA DESKTOP 
            const tr = document.createElement('tr');

            //Imagen
            const tdImg = document.createElement('td');
            const img   = document.createElement('img');
            img.src    = prod.img;
            img.alt    = prod.title;
            img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:10px;';
            tdImg.appendChild(img);

            //Título
            const tdTitle = document.createElement('td');
            tdTitle.textContent = prod.title;

            //Precio
            const tdPrice = document.createElement('td');
            tdPrice.textContent = `$${prod.price.toFixed(2)}`;

            //Cantidad
            const tdQty = document.createElement('td');
            const input = document.createElement('input');
            input.type         = 'number';
            input.id           = inputId;
            input.name         = inputName;
            input.min          = '1';
            input.value        = prod.quantity;
            input.autocomplete = 'off';
            input.style.width  = '70px';
            input.classList.add('form-control', 'form-control-sm');

            input.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                productsArray[index].quantity = val;
                renderCart();
            });

            tdQty.appendChild(input);

            //Eliminar
            const tdDel = document.createElement('td');
            const btn   = document.createElement('button');
            btn.type        = 'button';
            btn.textContent = 'X';
            btn.setAttribute('aria-label', `Eliminar ${prod.title}`);
            btn.classList.add('btn', 'btn-danger', 'btn-sm');

            btn.addEventListener('click', () => {
                productsArray.splice(index, 1);
                showAlert('Producto eliminado', 'error');
                renderCart();
            });

            tdDel.appendChild(btn);
            tr.append(tdImg, tdTitle, tdPrice, tdQty, tdDel);
            cartItems.appendChild(tr);

        }

    });

    //Badge — se busca en cada render porque el navbar carga dinámicamente
    const badgeLive = document.querySelector('.badge');
    if (badgeLive) badgeLive.textContent = productsArray.length;

    let totalCant  = 0;
    let totalPagar = 0;

    productsArray.forEach(p => {
        totalCant  += p.quantity;
        totalPagar += p.price * p.quantity;
    });

    if (totalProducts) totalProducts.textContent = totalCant;
    if (totalPrice)    totalPrice.textContent     = totalPagar.toFixed(2);

    saveLocal();

}

//Ir a pago
function payProducts() {

    if (productsArray.length === 0) {
        showAlert('El carrito está vacío', 'error');
        return;
    }

    localStorage.setItem('checkoutProducts', JSON.stringify(productsArray));
    window.location.href = 'pago.html';

}

//Alerta flotante
function showAlert(message, type) {

    const div = document.createElement('div');
    div.classList.add('custom-alert', type);
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);

}

//LocalStorage 
function saveLocal() {

    localStorage.setItem('cartProducts', JSON.stringify(productsArray));

}

function loadLocal() {

    const saved = localStorage.getItem('cartProducts');

    if (saved) {
        productsArray = JSON.parse(saved);
        renderCart();
    }

}