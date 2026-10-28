$(document).ready(function() {
    
    // ==========================================
    // 1. LÓGICA DEL BUSCADOR DE TEXTO
    // ==========================================
    $('#inputBuscador').on('keyup', function() {
        let textoBusqueda = $(this).val().toLowerCase();
        
        // PASO A: Ocultar/Mostrar los platillos individuales
        $('.card').each(function() {
            let contenidoPlatillo = $(this).text().toLowerCase();
            let categoriaPlatillo = $(this).closest('section').find('h2').text().toLowerCase();
            
            if (contenidoPlatillo.includes(textoBusqueda) || categoriaPlatillo.includes(textoBusqueda)) {
                $(this).show(); 
            } else {
                $(this).hide();
            }
        });

        // PASO B: Ocultar/Mostrar las categorías completas (Títulos)
        $('section.mb-5').each(function() {
            // Contamos cuántas tarjetas quedaron visibles dentro de esta categoría específica
            let tarjetasVisibles = $(this).find('.card:visible').length;
            
            if (tarjetasVisibles === 0) {
                // Si no hay platillos visibles, ocultamos toda la sección (título incluido)
                $(this).hide();
            } else {
                // Si hay al menos un platillo, mostramos la sección
                $(this).show();
            }
        });
    });

    // ==========================================
    // 2. LÓGICA DE LOS BOTONES DEL MODAL (Filtros)
    // ==========================================
    $('.btn-pill-filtro').on('click', function() {
        $(this).toggleClass('active');
    });

    // Botón "Restablecer"
    $('#btnRestablecer').on('click', function() {
        $('.btn-pill-filtro').removeClass('active');
        $('section.mb-5').show(); // Mostramos todas las categorías
        $('.card').show(); // Mostramos todos los platillos
    });

    // Botón "Aplicar"
    $('#btnAplicarFiltros').on('click', function() {
        let categoriasSeleccionadas = [];
        $('.btn-pill-filtro.active[data-filtro]').each(function() {
            categoriasSeleccionadas.push($(this).data('filtro'));
        });

        if (categoriasSeleccionadas.length === 0) {
            $('section.mb-5').fadeIn(300);
        } else {
            $('section.mb-5').hide();
            categoriasSeleccionadas.forEach(function(categoria) {
                $(`section:has(#container-${categoria})`).fadeIn(300);
            });
        }
    });

});