import Alpine from 'alpinejs';
import { header } from './components/header.js';
import { hero } from './components/hero.js';
import { aboutGallery } from './components/about.js';
import { trainingPricing } from './components/training.js';
import { gallery } from './components/gallery.js';
import { reviews } from './components/reviews.js';

// Регистрация компонентов
Alpine.data('header', header);
Alpine.data('hero', hero);
Alpine.data('aboutGallery', aboutGallery);
Alpine.data('trainingPricing', trainingPricing);
Alpine.data('gallery', gallery);
Alpine.data('reviews', reviews);

// Инициализация Alpine.js
window.Alpine = Alpine;
Alpine.start();