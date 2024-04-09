const navbarToggle = document.getElementById('navbar-toggle');
const mobileMenu = document.getElementById('mobile-menu');

navbarToggle.addEventListener('click', () => {
mobileMenu.classList.toggle('hidden');
});

document.addEventListener('click', (event) => {
const target = event.target;
if (!mobileMenu.contains(target) && !navbarToggle.contains(target)) {
mobileMenu.classList.add('hidden');
}
});

mobileMenu.addEventListener('mouseleave', () => {
mobileMenu.classList.add('hidden');
});