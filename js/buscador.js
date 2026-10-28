$(document).ready(function() {
    
    // ==========================================
    // 1. LÓGICA DEL BUSCADOR DE TEXTO
    // ==========================================
    $('#inputBuscador').on('keyup', function() {
        // Obtenemos el texto y usamos .trim() para ignorar espacios en blanco extra
        let textoBusqueda = $(this).val().toLowerCase().trim();
        
        // SOLUCIÓN AL ERROR: Si el buscador queda vacío, mostramos todo de inmediato
        if (textoBusqueda === '') {
            $('.card').show();
            $('section.mb-5').show();
            
            // Si el usuario tenía algún filtro del modal activo, lo respetamos y lo volvemos a aplicar
            $('#btnAplicarFiltros').click();
            return; // Detenemos la función aquí para que no siga ocultando cosas
        }
        
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
            let tarjetasVisibles = $(this).find('.card:visible').length;
            
            if (tarjetasVisibles === 0) {
                $(this).hide();
            } else {
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
        $('#inputBuscador').val(''); // También limpiamos la barra de texto
        $('section.mb-5').show(); 
        $('.card').show(); 
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