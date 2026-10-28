$(document).ready(function() {
    
    // ==========================================
    // 1. LÓGICA DEL BUSCADOR DE TEXTO
    // ==========================================
    $('#inputBuscador').on('keyup', function() {
        let textoBusqueda = $(this).val().toLowerCase().trim();
        
        if (textoBusqueda === '') {
            $('.card').show();
            $('section.mb-5').show();
            $('#btnAplicarFiltros').click();
            return; 
        }
        
        $('.card').each(function() {
            let contenidoPlatillo = $(this).text().toLowerCase();
            let categoriaPlatillo = $(this).closest('section').find('h2').text().toLowerCase();
            
            if (contenidoPlatillo.includes(textoBusqueda) || categoriaPlatillo.includes(textoBusqueda)) {
                $(this).show(); 
            } else {
                $(this).hide();
            }
        });

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
        
        // INNOVACIÓN: Mostrar/Ocultar temperatura al tocar "Bebidas"
        if ($(this).data('filtro') === 'bebidas') {
            if ($(this).hasClass('active')) {
                $('#seccion-temperatura').slideDown(300); // Aparece con animación
            } else {
                $('#seccion-temperatura').slideUp(300); // Desaparece con animación
                // Al ocultarlo, desmarcamos caliente/frío automáticamente
                $('[data-tag]').removeClass('active');
            }
        }
    });

    // ==========================================
    // 3. Botón "Restablecer"
    // ==========================================
    $('#btnRestablecer').on('click', function() {
        $('.btn-pill-filtro').removeClass('active');
        $('#inputBuscador').val(''); 
        $('section.mb-5').show(); 
        $('.card').show(); 
        $('#seccion-temperatura').slideUp(300); // Ocultamos temperatura
    });

    // ==========================================
    // 4. Botón "Aplicar"
    // ==========================================
    $('#btnAplicarFiltros').on('click', function() {
        let categoriasSeleccionadas = [];
        $('.btn-pill-filtro.active[data-filtro]').each(function() {
            categoriasSeleccionadas.push($(this).data('filtro'));
        });

        let temperaturasSeleccionadas = [];
        $('.btn-pill-filtro.active[data-tag]').each(function() {
            temperaturasSeleccionadas.push($(this).data('tag'));
        });

        // A) Aplicar Filtro de Secciones
        if (categoriasSeleccionadas.length === 0) {
            $('section.mb-5').fadeIn(300);
            $('.card').show(); 
        } else {
            $('section.mb-5').hide();
            categoriasSeleccionadas.forEach(function(categoria) {
                // SOLUCIÓN: Si la categoría es bebidas, mostramos Cold Drinks Y Café
                if (categoria === 'bebidas') {
                    $(`section:has(#container-bebidas)`).fadeIn(300);
                    $(`section:has(#container-cafe)`).fadeIn(300);
                } else {
                    $(`section:has(#container-${categoria})`).fadeIn(300);
                }
            });
            $('.card').show(); 
        }

        // B) Aplicar Filtro de Temperatura (Lógica Limpia y Data-Driven)
        if (categoriasSeleccionadas.includes('bebidas') && temperaturasSeleccionadas.length > 0) {
            
            $('#container-bebidas .card, #container-cafe .card').each(function() {
                // Leemos directamente la propiedad 'data-temperatura' del HTML
                let tempPlatillo = $(this).data('temperatura') || "";
                let mostrarPorTemp = false;

                // Verificamos si alguna de las temperaturas del filtro coincide con las del platillo
                temperaturasSeleccionadas.forEach(function(temp) {
                    if (tempPlatillo.includes(temp)) {
                        mostrarPorTemp = true;
                    }
                });

                if (mostrarPorTemp) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });

            // Limpieza de secciones vacías
            $('section.mb-5').each(function() {
                if ($(this).find('.card:visible').length === 0) {
                    $(this).hide();
                }
            });
        }
    });

});