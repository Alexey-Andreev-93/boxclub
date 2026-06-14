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

const defaults = {
  site: { hero: {}, about: {} },
  contact: {},
  achievements: { items: [] },
  training: { categories: [] },
  gallery: { items: [] },
  reviews: { items: [] },
};

Object.entries(defaults).forEach(([key, val]) => Alpine.store(key, val));

function fetchJson(url, fallback) {
  return fetch(url, { signal: AbortSignal.timeout(5000) })
    .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
    .catch(() => fallback);
}

Promise.all([
  fetchJson(`${BASE}content/site.json`, defaults.site).then(d => { Alpine.store('site', d); }),
  fetchJson(`${BASE}content/contact.json`, defaults.contact).then(d => { Alpine.store('contact', d); }),
  fetchJson(`${BASE}content/achievements.json`, defaults.achievements).then(d => { Alpine.store('achievements', d); }),
  fetchJson(`${BASE}content/training.json`, defaults.training).then(d => { Alpine.store('training', d); }),
  fetchJson(`${BASE}content/gallery.json`, defaults.gallery).then(d => { Alpine.store('gallery', d); }),
  fetchJson(`${BASE}content/reviews.json`, defaults.reviews).then(d => { Alpine.store('reviews', d); }),
]);

Alpine.start();