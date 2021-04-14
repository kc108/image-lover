// mobile menu (nav bar images menu)
const menuIcon = document.querySelector('#menu-images');
const navbarMenu = document.querySelector(".navbar-menu");


burgerIcon.addEventListener('click', () => {
    console.log(menuIcon);
    navbarMenu.classList.toggle('is-active');
});
