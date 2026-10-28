// Asegura que el código se ejecute cuando el HTML ya cargó
$(document).ready(function() {
    
    // Detecta cada vez que el usuario teclea algo en el buscador
    $('#inputBuscador').on('keyup', function() {
        
        // Extrae el valor escrito en el input y lo pasa a minúsculas
        let textoBusqueda = $(this).val().toLowerCase();
        
        // Iteramos sobre todos los platillos
        $('.card').each(function() {
            
            // Obtiene todo el texto visible dentro del platillo
            let contenidoPlatillo = $(this).text().toLowerCase();
            
            // Si el texto del platillo incluye lo que el usuario escribió, lo mostramos; si no, lo ocultamos
            if (contenidoPlatillo.includes(textoBusqueda)) {
                // .fadeIn() y .fadeOut(): Manipulación del DOM con animaciones jQuery
                $(this).fadeIn(300);
            } else {
                $(this).fadeOut(300);
            }
        });
    });
});