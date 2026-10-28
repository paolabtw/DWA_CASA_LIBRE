$(document).ready(function() {
    
    // 1. Buscador de texto (Platillos y Categorías)
    $('#inputBuscador').on('keyup', function() {
        let textoBusqueda = $(this).val().toLowerCase();
        
        $('.card').each(function() {
            let contenidoPlatillo = $(this).text().toLowerCase();
            // Busca la etiqueta <section> padre y extrae el texto de su <h2>
            let categoriaPlatillo = $(this).closest('section').find('h2').text().toLowerCase();
            
            // Evalúa si el texto buscado coincide con el platillo o con el título de la categoría
            if (contenidoPlatillo.includes(textoBusqueda) || categoriaPlatillo.includes(textoBusqueda)) {
                $(this).show(); 
            } else {
                $(this).hide();
            }
        });
    });

    // 2. Botones de filtro por categoría
    $('.btn-filtro').on('click', function() {
        
        // Cambia el estilo del botón activo
        $('.btn-filtro').removeClass('btn-dark active').addClass('btn-outline-dark');
        $(this).removeClass('btn-outline-dark').addClass('btn-dark active');

        let filtro = $(this).data('filtro');

        if (filtro === 'todos') {
            $('section.mb-5').fadeIn(400);
        } else {
            $('section.mb-5').hide();
            // Muestra únicamente la sección que contiene el contenedor con el ID correspondiente
            $(`section:has(#container-${filtro})`).fadeIn(400);
        }
        
        // Limpia el buscador de texto al usar los botones
        $('#inputBuscador').val('');
        $('.card').show();
    });
});