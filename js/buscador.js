$(document).ready(function() {
    
    // 1. Búsqueda por texto directo
    $('#inputBuscador').on('keyup', function() {
        let textoBusqueda = $(this).val().toLowerCase();
        
        $('.card').each(function() {
            let contenidoPlatillo = $(this).text().toLowerCase();
            let categoriaPlatillo = $(this).closest('section').find('h2').text().toLowerCase();
            
            if (contenidoPlatillo.includes(textoBusqueda) || categoriaPlatillo.includes(textoBusqueda)) {
                $(this).show(); 
            } else {
                $(this).hide();
            }
        });
    });

    // 2. Comportamiento visual de los botones del modal (Toggle activo/inactivo)
    $('.btn-pill-filtro').on('click', function() {
        // Al hacer clic, alternamos la clase 'active'
        $(this).toggleClass('active');
    });

    // 3. Botón "Restablecer"
    $('#btnRestablecer').on('click', function() {
        $('.btn-pill-filtro').removeClass('active');
        $('section.mb-5').show(); // Mostramos todas las secciones
        $('.card').show(); // Mostramos todos los platillos
    });

    // 4. Botón "Aplicar"
    $('#btnAplicarFiltros').on('click', function() {
        // Obtenemos las categorías seleccionadas
        let categoriasSeleccionadas = [];
        $('.btn-pill-filtro.active[data-filtro]').each(function() {
            categoriasSeleccionadas.push($(this).data('filtro'));
        });

        // Si no hay categorías seleccionadas, mostramos todo
        if (categoriasSeleccionadas.length === 0) {
            $('section.mb-5').fadeIn(300);
        } else {
            // Ocultamos todo y solo mostramos las secciones seleccionadas
            $('section.mb-5').hide();
            categoriasSeleccionadas.forEach(function(categoria) {
                $(`section:has(#container-${categoria})`).fadeIn(300);
            });
        }
    });

});