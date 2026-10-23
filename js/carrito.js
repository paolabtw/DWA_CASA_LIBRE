class Carrito {
  constructor() {
    this.items = [];
    
    this.badge = null;
    this.cartItems = document.querySelector('#cartItems');
    this.totalProducts = document.querySelector('#totalProducts');
    this.totalPrice = document.querySelector('#totalPrice');
    this.payBtn = document.querySelector('#payBtn');

    this.init();
  }

  // Inicializa la carga local y asigna oyentes de eventos
  init() {
    this.cargarLocal();
    this.asignarEventos();

    // Re-renderiza al cambiar el tamaño de pantalla para soporte responsive
    window.addEventListener('resize', () => this.render());
  }

  asignarEventos() {
    // Captura de clics en las tarjetas del menú mediante delegación en el contenedor principal <main>
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-agregar')) {
          const card = e.target.closest('.card');
          this.obtenerDatosTarjeta(card, e.target);
        }
      });
    }

    // Botón de pago
    if (this.payBtn) {
      this.payBtn.addEventListener('click', () => this.procesarPago());
    }
  }

  // Extrae la información de la tarjeta e incluye la cantidad inicial del selector de la card
  obtenerDatosTarjeta(card, btn) {
    const id = btn.dataset.id;
    const nombre = btn.dataset.nombre || card.querySelector('h3').childNodes[0].textContent.trim();
    const foto = card.querySelector('img').src;

    // Determinación del precio (Soporta selecciones dinámicas como las de las pizzas)
    let precio = 0;
    const select = card.querySelector('.size-select');
    if (select) {
      precio = parseFloat(select.value);
    } else if (btn.dataset.precio) {
      precio = parseFloat(btn.dataset.precio);
    } else {
      const spanPrecio = card.querySelector('.menu-item h3 span');
      precio = spanPrecio ? parseFloat(spanPrecio.textContent.replace('$', '')) : 0;
    }

    // Obtención de la cantidad elegida por el cliente antes de pulsar "Agregar"
    const inputCantidadCard = document.getElementById(`cant-${id}`);
    const cantidadSeleccionada = inputCantidadCard ? parseInt(inputCantidadCard.value) || 1 : 1;

    this.agregar({
      id: id,
      title: nombre,
      price: precio,
      img: foto,
      quantity: cantidadSeleccionada
    });
  }

  // Agrega o actualiza la cantidad de un producto dentro del carrito
  agregar(producto) {
    // Identificador único (Combina ID y Precio para manejar diferentes tamaños de pizza como productos distintos)
    const indexExistente = this.items.findIndex(
      item => item.id === producto.id && item.price === producto.price
    );

    if (indexExistente !== -1) {
      // Si el producto ya existía en el carrito, se incrementa con la nueva cantidad agregada
      this.items[indexExistente].quantity += producto.quantity;
      this.mostrarAlerta(`Cantidad actualizada en el carrito (+${producto.quantity}) ✓`, 'success');
    } else {
      // Producto nuevo
      this.items.push(producto);
      this.mostrarAlerta('Producto agregado al carrito ✓', 'success');
    }

    this.guardarLocal();
    this.render();
  }

  // Modifica la cantidad desde la tabla o lista dentro del modal
  modificarCantidad(index, nuevaCantidad) {
    let cant = parseInt(nuevaCantidad);
    if (isNaN(cant) || cant < 1) cant = 1;

    this.items[index].quantity = cant;
    this.guardarLocal();
    this.render();
  }

  // Elimina un registro del carrito
  eliminar(index) {
    this.items.splice(index, 1);
    this.mostrarAlerta('Producto eliminado', 'error');
    this.guardarLocal();
    this.render();
  }

  // Genera el HTML dentro del modal del carrito
  render() {
    if (!this.cartItems) return;

    const esMovil = window.innerWidth < 768;

    // Ocultar/Mostrar encabezados de la tabla en versión móvil
    const thead = this.cartItems.closest('table')?.querySelector('thead');
    if (thead) thead.style.display = esMovil ? 'none' : '';

    this.cartItems.innerHTML = '';

    this.items.forEach((prod, index) => {
      const inputId = `qty-input-${index}`;

      if (esMovil) {
        // Renderizado tipo Tarjeta para Dispositivos Móviles
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.style.padding = '8px 0';

        td.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px; background: #f8f9fa; border-radius: 12px; padding: 10px;">
            <img src="${prod.img}" alt="${prod.title}" style="width:65px; height:65px; object-fit:cover; border-radius:8px; flex-shrink:0;" />
            <div style="flex:1; min-width:0;">
              <p style="margin:0; font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${prod.title}</p>
              <p style="margin:4px 0 0; color:#555; font-size:13px;">$${prod.price.toFixed(2)}</p>
              <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                <label for="${inputId}" style="font-size:12px; margin:0;">Cant.</label>
                <input type="number" id="${inputId}" min="1" value="${prod.quantity}" style="width:60px;" class="form-control form-control-sm input-modal-cant" />
              </div>
            </div>
            <button type="button" class="btn btn-danger btn-sm btn-eliminar" style="flex-shrink:0; padding:6px 10px;" aria-label="Eliminar ${prod.title}">🗑</button>
          </div>
        `;

        // Eventos para móvil
        td.querySelector('.input-modal-cant').addEventListener('change', (e) => this.modificarCantidad(index, e.target.value));
        td.querySelector('.btn-eliminar').addEventListener('click', () => this.eliminar(index));

        tr.appendChild(td);
        this.cartItems.appendChild(tr);

      } else {
        // Renderizado tipo Fila de Tabla para Pantallas Grandes (Desktop)
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td><img src="${prod.img}" alt="${prod.title}" style="width:70px; height:70px; object-fit:cover; border-radius:10px;" /></td>
          <td style="font-weight: 500;">${prod.title}</td>
          <td>$${prod.price.toFixed(2)}</td>
          <td>
            <input type="number" id="${inputId}" min="1" value="${prod.quantity}" style="width:70px;" class="form-control form-control-sm input-modal-cant" />
          </td>
          <td>
            <button type="button" class="btn btn-danger btn-sm btn-eliminar" aria-label="Eliminar ${prod.title}">X</button>
          </td>
        `;

        // Eventos para desktop
        tr.querySelector('.input-modal-cant').addEventListener('change', (e) => this.modificarCantidad(index, e.target.value));
        tr.querySelector('.btn-eliminar').addEventListener('click', () => this.eliminar(index));

        this.cartItems.appendChild(tr);
      }
    });

    // Actualización de contadores y montos totales
    this.actualizarTotales();
  }

  actualizarTotales() {
    // Búsqueda dinámica del badge para asegurar su actualización aunque la barra de navegación se cargue de forma asíncrona
    const badgeActual = document.querySelector('.badge');
    if (badgeActual) badgeActual.textContent = this.items.length;

    let totalUnidades = 0;
    let totalDinero = 0;

    this.items.forEach(prod => {
      totalUnidades += prod.quantity;
      totalDinero += prod.price * prod.quantity;
    });

    if (this.totalProducts) this.totalProducts.textContent = totalUnidades;
    if (this.totalPrice) this.totalPrice.textContent = totalDinero.toFixed(2);
  }

  procesarPago() {
    if (this.items.length === 0) {
      this.mostrarAlerta('El carrito está vacío', 'error');
      return;
    }

    localStorage.setItem('checkoutProducts', JSON.stringify(this.items));
    window.location.href = 'pago.html';
  }

  mostrarAlerta(mensaje, tipo) {
    const div = document.createElement('div');
    div.classList.add('custom-alert', tipo);
    div.textContent = mensaje;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);
  }

  guardarLocal() {
    localStorage.setItem('cartProducts', JSON.stringify(this.items));
  }

  cargarLocal() {
    const guardados = localStorage.getItem('cartProducts');
    if (guardados) {
      try {
        this.items = JSON.parse(guardados);
      } catch (error) {
        console.error('Error al parsear el localStorage:', error);
        this.items = [];
      }
    }
  }
}

// Instanciación global de la clase Carrito cuando el DOM esté listo
let carritoApp;
document.addEventListener('DOMContentLoaded', () => {
  carritoApp = new Carrito();
});