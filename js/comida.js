class Comida {
  constructor({ id, nombre, precio, foto, descripcion, opciones = null, temperatura = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.foto = foto;
    this.descripcion = descripcion;
    this.opciones = opciones;
    this.temperatura = temperatura; 
  }

  renderHTML() {
    let opcionesHTML = '';

    if (this.opciones && this.opciones.length > 0) {
      const selectOptions = this.opciones
        .map(opt => `<option value="${opt.precio}">${opt.texto}</option>`)
        .join('');

      opcionesHTML = `
        <select class="form-select size-select mb-2" style="margin-bottom: 12px;">
          ${selectOptions}
        </select>
      `;
    }

    const precioHeader = (this.opciones && this.opciones.length > 0)
      ? `<h3>${this.nombre}</h3>`
      : `<h3>${this.nombre} <span>$${this.precio.toFixed(2)}</span></h3>`;

    const descripcionHTML = this.descripcion ? `<p style="margin-bottom: 12px;">${this.descripcion}</p>` : '';
    const dataPrecioAttr = (this.opciones && this.opciones.length > 0) ? '' : `data-precio="${this.precio.toFixed(2)}"`;

    //Convertimos el arreglo de temperaturas en texto
    const dataTemp = this.temperatura.join(' ');

    return `
      <article class="card" data-temperatura="${dataTemp}">
        <img src="${this.foto}" alt="${this.nombre}" />
        <div class="menu-item">
          ${precioHeader}
          ${descripcionHTML}
          ${opcionesHTML}
          
          <!-- Contenedor de Cantidad Minimalista con Estilos En Línea -->
          <div style="display: flex; align-items: center; justify-content: space-between; background-color: #f4f3f0; border-radius: 12px; padding: 4px 8px; margin-top: 15px; margin-bottom: 15px;">
            <button 
              type="button" 
              aria-label="Disminuir" 
              onclick="cambiarCantidad(${this.id}, -1)" 
              style="background: transparent; border: none; color: #000000; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: bold; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;"
            >−</button>
            
            <input 
              type="number" 
              id="cant-${this.id}" 
              value="1" 
              min="1" 
              max="10" 
              readonly 
              style="background: transparent; border: none; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: bold; color: #000000; width: 40px; outline: none; -moz-appearance: textfield;"
            />
            
            <button 
              type="button" 
              aria-label="Aumentar" 
              onclick="cambiarCantidad(${this.id}, 1)" 
              style="background: transparent; border: none; color: #000000; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: bold; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; outline: none;"
            >+</button>
          </div>

          <button class="btn-agregar" type="button" data-id="${this.id}" data-nombre="${this.nombre}" ${dataPrecioAttr}>
            Agregar al Carrito
          </button>
        </div>
      </article>
    `;
  }
}

// Función global encargada de incrementar/decrementar la cantidad dentro del rango [1, 10]
function cambiarCantidad(id, cambio) {
  const input = document.getElementById(`cant-${id}`);
  if (input) {
    let valorActual = parseInt(input.value) || 1;
    let nuevoValor = valorActual + cambio;

    if (nuevoValor >= 1 && nuevoValor <= 10) {
      input.value = nuevoValor;
    }
  }
}

// Función asíncrona para cargar y renderizar el menú desde el archivo JSON externo
async function cargarMenu() {
  try {
    const respuesta = await fetch('data/data.json');
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el archivo datos.json');
    }
    
    const menuData = await respuesta.json();

    // Recorre cada categoría del JSON y pinta los elementos usando la clase Comida
    for (const [sectionId, items] of Object.entries(menuData)) {
      const container = document.getElementById(`container-${sectionId}`);
      if (container) {
        container.innerHTML = items.map(itemData => {
          const comidaObj = new Comida(itemData);
          return comidaObj.renderHTML();
        }).join('');
      }
    }
  } catch (error) {
    console.error('Error al obtener los datos del menú:', error);
  }
}
document.addEventListener('DOMContentLoaded', cargarMenu);