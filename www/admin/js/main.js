(async function ($) {
    "use strict";

    // Spinner
    //spinner(1);
    await buscaBase(1);
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    $(".nmuser").html(localStorage.getItem('STDAusuLogin'));
    //$("#idlogin").html(localStorage.getItem('STDAusuLogin'));

    await iniHome();

    //spinner(0);
})(jQuery);
