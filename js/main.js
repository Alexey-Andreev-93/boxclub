import Alpine from 'alpinejs';
import { header } from './components/header.js';
import { hero } from './components/hero.js';
import { aboutGallery } from './components/about.js';
import { trainingPricing } from './components/training.js';
import { gallery } from './components/gallery.js';
import { reviews } from './components/reviews.js';
import { contactInfo } from './components/contact.js';

Alpine.data('header', header);
Alpine.data('hero', hero);
Alpine.data('aboutGallery', aboutGallery);
Alpine.data('trainingPricing', trainingPricing);
Alpine.data('gallery', gallery);
Alpine.data('reviews', reviews);
Alpine.data('contactInfo', contactInfo);

const BASE = import.meta.env.BASE_URL;

Alpine.store('site', { hero: {}, about: {}, seo: {} });
Alpine.store('contact', {});

Promise.all([
  fetch(`${BASE}content/site.json`).then(r => r.json()),
  fetch(`${BASE}content/contact.json`).then(r => r.json()),
]).then(([siteData, contactData]) => {
  Alpine.store('site', siteData);
  Alpine.store('contact', contactData);
}).catch(e => console.error('Ошибка загрузки данных сайта:', e));

window.Alpine = Alpine;
Alpine.start();