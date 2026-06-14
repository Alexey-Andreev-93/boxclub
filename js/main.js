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

Alpine.store('site', { hero: {}, about: {} });
Alpine.store('contact', {});
Alpine.store('achievements', { items: [] });
Alpine.store('training', { categories: [] });
Alpine.store('gallery', { items: [] });
Alpine.store('reviews', { items: [] });

Promise.all([
  fetch(`${BASE}content/site.json`).then(r => r.json()),
  fetch(`${BASE}content/contact.json`).then(r => r.json()),
  fetch(`${BASE}content/achievements.json`).then(r => r.json()),
  fetch(`${BASE}content/training.json`).then(r => r.json()),
  fetch(`${BASE}content/gallery.json`).then(r => r.json()),
  fetch(`${BASE}content/reviews.json`).then(r => r.json()),
]).then(([siteData, contactData, achievementsData, trainingData, galleryData, reviewsData]) => {
  Alpine.store('site', siteData);
  Alpine.store('contact', contactData);
  Alpine.store('achievements', achievementsData);
  Alpine.store('training', trainingData);
  Alpine.store('gallery', galleryData);
  Alpine.store('reviews', reviewsData);
}).catch(e => console.error('Ошибка загрузки данных сайта:', e));

window.Alpine = Alpine;
Alpine.start();