const API = 'https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net';
const content = {};
let password = '';
let dirty = false;

function login() {
  const pwd = document.getElementById('passwordInput').value;
  const err = document.getElementById('loginError');
  fetch(API + '/admin/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({password: pwd})
  })
  .then(function(r) {
    if (!r.ok) { err.textContent = 'Неверный пароль'; throw new Error('auth'); }
    return r.json();
  })
  .then(function() {
    password = pwd;
    sessionStorage.setItem('boxclub_pass', pwd);
    loadContent();
  })
  .catch(function(e) { if (e.message !== 'auth') err.textContent = 'Ошибка соединения'; });
}

function loadContent() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminScreen').classList.add('active');
  password = sessionStorage.getItem('boxclub_pass');
  if (!password) return location.reload();
  const files = ['training', 'gallery', 'reviews', 'achievements', 'site', 'contact'];
  let loaded = 0;
  files.forEach(function(name) {
    fetch('/content/' + name + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { content[name] = data; loaded++; if (loaded === files.length) renderAll(); })
      .catch(function() { content[name] = {}; loaded++; if (loaded === files.length) renderAll(); });
  });
}

function renderAll() { renderTraining(); renderGallery(); renderReviews(); renderAchievements(); renderSite(); renderContact(); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'&#10;'); }

const ICONS = [
  {g:'Бокс / Спорт', items:[
    {l:'Кулак',v:'fas fa-fist-raised'},{l:'Гантель',v:'fas fa-dumbbell'},{l:'Бег',v:'fas fa-running'},
    {l:'Рука',v:'fas fa-hand-rock'},{l:'Секундомер',v:'fas fa-stopwatch'},{l:'Огонь',v:'fas fa-fire'},
  ]},
  {g:'Люди', items:[
    {l:'Дети',v:'fas fa-child'},{l:'Выпускник',v:'fas fa-user-graduate'},{l:'Пользователь',v:'fas fa-user'},
    {l:'Друзья',v:'fas fa-user-friends'},{l:'Команда',v:'fas fa-users'},
  ]},
  {g:'Цели и достижения', items:[
    {l:'Мишень',v:'fas fa-bullseye'},{l:'Звезда',v:'fas fa-star'},{l:'Трофей',v:'fas fa-trophy'},
    {l:'Медаль',v:'fas fa-medal'},{l:'Награда',v:'fas fa-award'},
  ]},
  {g:'Защита / Здоровье', items:[
    {l:'Щит',v:'fas fa-shield-alt'},{l:'Сердце',v:'fas fa-heart'},{l:'Пульс',v:'fas fa-heartbeat'},
    {l:'Молния',v:'fas fa-bolt'},
  ]},
  {g:'Прогресс', items:[
    {l:'График',v:'fas fa-chart-line'},{l:'Звонок',v:'fas fa-bell'},{l:'Часы',v:'fas fa-clock'},
  ]},
  {g:'Транспорт', items:[
    {l:'Поезд',v:'fa-solid fa-train'},{l:'Автобус',v:'fa-solid fa-bus'},{l:'Машина',v:'fa-solid fa-car'},
    {l:'Пешком',v:'fa-solid fa-walking'},{l:'Метро',v:'fa-solid fa-subway'},{l:'Велосипед',v:'fa-solid fa-bicycle'},
  ]},
];

let _iconCallback = null;
let _icbId = 0;

function iconPreviewBtn(value, fn) {
  let v = value || 'fas fa-star';
  let id = 'icb' + (++_icbId);
  window[id] = fn;
  return '<button type="button" class="icon-preview-btn" data-click="open-icon-picker" data-current-icon="' + v + '" data-cb="' + id + '"><span class="preview-icon"><i class="' + v + '"></i></span> Сменить</button>';
}

function openIconPicker(currentValue, callback) {
  _iconCallback = callback;
  let grid = document.getElementById('iconModalGrid');
  let h = '';
  ICONS.forEach(function(group) {
    h += '<div class="icon-group-label">' + esc(group.g) + '</div>';
    group.items.forEach(function(icon) {
      let sel = icon.v === currentValue ? ' selected' : '';
      h += '<div class="icon-opt' + sel + '" data-click="pick-icon" data-icon="' + icon.v + '" title="' + esc(icon.l) + '"><i class="' + icon.v + '"></i></div>';
    });
  });
  grid.innerHTML = h;
  document.getElementById('iconModal').classList.add('active');
}

function closeIconPicker() {
  document.getElementById('iconModal').classList.remove('active');
}

function pickIconFromModal(el) {
  let value = el.getAttribute('data-icon');
  closeIconPicker();
  if (_iconCallback) _iconCallback(value);
}

// Also allow clicking the modal backdrop to close
document.getElementById('iconModal').addEventListener('click', function(e) {
  if (e.target === this) closeIconPicker();
});

function renderTraining() {
  let el = document.getElementById('section-training');
  if (!content.training || !content.training.categories) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let html = '<div class="section-header"><h2>Стоимость тренировок</h2><p style="color:#888;font-size:0.85rem;">Исправь и нажми «Сохранить всё» внизу</p></div>';
  content.training.categories.forEach(function(cat, ci) {
    html += '<div class="card">';
    html += '<div class="cat-header"><h3>' + esc(cat.title) + '</h3><button class="remove-cat-btn" data-click="remove-category" data-ci="' + ci + '" title="Удалить категорию"><i class="fas fa-trash"></i></button></div>';
    html += '<div class="field"><label>Название категории</label><input value="' + esc(cat.title) + '" data-change="set-training" data-ci="' + ci + '" data-key="title"></div>';
    html += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(cat.icon, function(v) { content.training.categories[ci].icon = v; renderTraining(); }) + '</div>';
    cat.plans.forEach(function(plan, pi) {
      html += '<div class="array-item">';
      html += '<div class="item-toolbar">';
      html += '<button class="move-btn" data-click="move-up" data-collection="training.categories.' + ci + '.plans" data-idx="' + pi + '" data-render="renderTraining" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
      html += '<button class="move-btn" data-click="move-down" data-collection="training.categories.' + ci + '.plans" data-idx="' + pi + '" data-render="renderTraining" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
      html += '<button class="remove-btn" data-click="remove-plan" data-ci="' + ci + '" data-pi="' + pi + '"><i class="fas fa-times"></i></button>';
      html += '</div>';
      html += '<div class="field"><label>Название тарифа</label><input value="' + esc(plan.title) + '" data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="title"></div>';
      html += '<div class="field"><label>Цена</label><input value="' + esc(plan.price) + '" data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="price"></div>';
      html += '<div class="field"><label>Цена за занятие</label><input value="' + esc(plan.perClass) + '" data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="perClass"></div>';
      html += '<div class="field"><label>Текст кнопки</label><input value="' + esc(plan.buttonText || '') + '" data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="buttonText"></div>';
      html += '<div class="field"><label>Текст бейджа</label><input value="' + esc(plan.badgeText || '') + '" data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="badgeText"></div>';
      html += '<div class="field"><div class="checkbox-wrap"><input type="checkbox" ' + (plan.popular ? 'checked' : '') + ' data-change="set-plan" data-ci="' + ci + '" data-pi="' + pi + '" data-key="popular"><label>Популярный?</label></div></div>';
      html += '<div class="field"><label>Преимущества (каждое с новой строки)</label><textarea rows="3" data-change="set-plan-features" data-ci="' + ci + '" data-pi="' + pi + '">' + esc((plan.features || []).join('\n')) + '</textarea></div>';
      html += '</div>';
    });
    html += '<button class="add-btn" data-click="add-plan" data-ci="' + ci + '"><i class="fas fa-plus"></i> Добавить тариф</button>';
    html += '</div>';
  });
  html += '<button class="add-btn" data-click="add-category" style="border-color:#999;color:#333;"><i class="fas fa-plus"></i> Добавить категорию</button>';
  el.innerHTML = html;
}

function renderGallery() {
  let el = document.getElementById('section-gallery');
  if (!content.gallery || !content.gallery.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let html = '<div class="section-header"><h2>Галерея</h2><p style="color:#888;font-size:0.85rem;">Для добавления фото выберите файл и оно загрузится автоматически</p></div>';
  content.gallery.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" data-click="move-up" data-collection="gallery.items" data-idx="' + i + '" data-render="renderGallery" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" data-click="move-down" data-collection="gallery.items" data-idx="' + i + '" data-render="renderGallery" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" data-click="remove-gallery" data-i="' + i + '"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Заголовок</label><input value="' + esc(item.title) + '" data-change="set-gallery" data-i="' + i + '" data-key="title"></div>';
    html += '<div class="field"><label>Описание</label><textarea rows="2" data-change="set-gallery" data-i="' + i + '" data-key="description">' + esc(item.description) + '</textarea></div>';
    html += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (item.image) html += '<img class="img-preview" src="' + esc(item.image) + '">';
    html += '<input type="file" accept="image/*" id="gallery-file-' + i + '" data-change="upload-gallery" data-i="' + i + '">';
    html += '<label class="img-label" for="gallery-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.image || 'нет фото') + '</span></div></div>';
    html += '<div class="field"><label>Тип</label><select data-change="set-gallery" data-i="' + i + '" data-key="type"><option value="training" ' + (item.type==='training'?'selected':'') + '>Тренировка</option><option value="competitions" ' + (item.type==='competitions'?'selected':'') + '>Соревнования</option><option value="team" ' + (item.type==='team'?'selected':'') + '>Команда</option></select></div>';
    html += '<div class="field"><label>Бейдж</label><input value="' + esc(item.badge) + '" data-change="set-gallery" data-i="' + i + '" data-key="badge"></div>';
    html += '<div class="field"><label>Дата</label><input value="' + esc(item.date) + '" data-change="set-gallery" data-i="' + i + '" data-key="date"></div>';
    html += '<div class="field"><div class="checkbox-wrap"><input type="checkbox" ' + (item.featured?'checked':'') + ' data-change="set-gallery" data-i="' + i + '" data-key="featured"><label>Избранное?</label></div></div>';
    html += '</div>';
  });
  html += '<button class="add-btn" data-click="add-gallery"><i class="fas fa-plus"></i> Добавить фото</button>';
  el.innerHTML = html;
}

function renderReviews() {
  let el = document.getElementById('section-reviews');
  if (!content.reviews || !content.reviews.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let html = '<div class="section-header"><h2>Отзывы</h2></div>';
  content.reviews.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" data-click="move-up" data-collection="reviews.items" data-idx="' + i + '" data-render="renderReviews" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" data-click="move-down" data-collection="reviews.items" data-idx="' + i + '" data-render="renderReviews" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" data-click="remove-review" data-i="' + i + '"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Имя</label><input value="' + esc(item.name) + '" data-change="set-review" data-i="' + i + '" data-key="name"></div>';
    html += '<div class="field"><label>Опыт</label><input value="' + esc(item.experience) + '" data-change="set-review" data-i="' + i + '" data-key="experience"></div>';
    html += '<div class="field"><label>Аватар</label><div class="img-upload-wrap">';
    if (item.avatar) html += '<img class="img-preview" src="' + esc(item.avatar) + '">';
    html += '<input type="file" accept="image/*" id="review-file-' + i + '" data-change="upload-review" data-i="' + i + '">';
    html += '<label class="img-label" for="review-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.avatar || 'нет фото') + '</span></div></div>';
    html += '<div class="field"><label>Текст отзыва</label><textarea rows="3" data-change="set-review" data-i="' + i + '" data-key="text">' + esc(item.text) + '</textarea></div>';
    html += '<div class="field"><label>Рейтинг (1-5)</label><input type="number" min="1" max="5" value="' + item.rating + '" data-change="set-review" data-i="' + i + '" data-key="rating"></div>';
    html += '</div>';
  });
  html += '<button class="add-btn" data-click="add-review"><i class="fas fa-plus"></i> Добавить отзыв</button>';
  el.innerHTML = html;
}

function renderAchievements() {
  let el = document.getElementById('section-achievements');
  if (!content.achievements || !content.achievements.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let html = '<div class="section-header"><h2>Достижения</h2></div>';
  content.achievements.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" data-click="move-up" data-collection="achievements.items" data-idx="' + i + '" data-render="renderAchievements" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" data-click="move-down" data-collection="achievements.items" data-idx="' + i + '" data-render="renderAchievements" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" data-click="remove-achievement" data-i="' + i + '"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Название</label><input value="' + esc(item.title) + '" data-change="set-achievement" data-i="' + i + '" data-key="title"></div>';
    html += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (item.image) html += '<img class="img-preview" src="' + esc(item.image) + '">';
    html += '<input type="file" accept="image/*" id="ach-file-' + i + '" data-change="upload-hero" data-i="' + i + '">';
    html += '<label class="img-label" for="ach-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.image || 'нет фото') + '</span></div></div>';
    html += '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">';
    html += '<div class="field" style="flex:1;min-width:60px"><label>Top (%)</label><input type="number" value="' + (item.top !== undefined ? item.top : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="top"></div>';
    html += '<div class="field" style="flex:1;min-width:60px"><label>Left (%)</label><input type="number" value="' + (item.left !== undefined ? item.left : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="left"></div>';
    html += '<div class="field" style="flex:1;min-width:60px"><label>Right (%)</label><input type="number" value="' + (item.right !== undefined ? item.right : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="right"></div>';
    html += '<div class="field" style="flex:1;min-width:60px"><label>Bottom (%)</label><input type="number" value="' + (item.bottom !== undefined ? item.bottom : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="bottom"></div>';
    html += '</div>';
    html += '<div style="display:flex;gap:0.5rem">';
    html += '<div class="field" style="flex:1"><label>Rotate (deg)</label><input type="number" value="' + (item.rotate !== undefined ? item.rotate : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="rotate"></div>';
    html += '<div class="field" style="flex:1"><label>Duration (s)</label><input type="number" step="0.1" min="1" value="' + (item.duration !== undefined ? item.duration : '') + '" data-change="set-achievement" data-i="' + i + '" data-key="duration"></div>';
    html += '</div>';
    html += '</div>';
  });
  html += '<button class="add-btn" data-click="add-achievement"><i class="fas fa-plus"></i> Добавить достижение</button>';
  el.innerHTML = html;
}

function renderSite() {
  let el = document.getElementById('section-site');
  if (!content.site) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let h = '<div class="section-header"><h2>О школе</h2><p style="color:#888;font-size:0.85rem;">Тренеры, текст и преимущества секции «О школе»</p></div>';

  // === TRAINERS ===
  h += '<div class="card"><h3>Тренеры</h3>';
  let trainers = getSite('about.trainers', []);
  trainers.forEach(function(t, i) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" data-click="move-up" data-collection="site.about.trainers" data-idx="' + i + '" data-render="renderSite" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" data-click="move-down" data-collection="site.about.trainers" data-idx="' + i + '" data-render="renderSite" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" data-click="remove-trainer" data-i="' + i + '"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Имя</label><input value="' + esc(t.name) + '" data-change="set-site" data-path="about.trainers.' + i + '.name"></div>';
    h += '<div class="field"><label>Должность</label><input value="' + esc(t.title) + '" data-change="set-site" data-path="about.trainers.' + i + '.title"></div>';
    h += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (t.image) h += '<img class="img-preview" src="' + esc(t.image) + '">';
    h += '<input type="file" accept="image/*" id="trainer-file-' + i + '" data-change="upload-trainer" data-i="' + i + '">';
    h += '<label class="img-label" for="trainer-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    h += '<span class="img-path">' + esc(t.image || 'нет фото') + '</span></div></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" data-click="add-trainer"><i class="fas fa-plus"></i> Добавить тренера</button>';
  h += '</div>';

  // === ABOUT TEXT ===
  h += '<div class="card"><h3>Текст о школе</h3>';
  h += '<div class="field"><label>Заголовок секции</label><input value="' + esc(getSite('about.title','')) + '" data-change="set-site" data-path="about.title"></div>';
  h += '<div class="field"><label>Описание (каждый абзац с новой строки)</label><textarea rows="4" data-change="set-site" data-path="about.description" data-transform="split-lines">' + esc((getSite('about.description',[])||[]).join('\n')) + '</textarea></div>';
  h += '</div>';

  // === FEATURES ===
  h += '<div class="card"><h3>Преимущества</h3>';
  let afeats = getSite('about.features', []);
  afeats.forEach(function(f, i) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" data-click="move-up" data-collection="site.about.features" data-idx="' + i + '" data-render="renderSite" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" data-click="move-down" data-collection="site.about.features" data-idx="' + i + '" data-render="renderSite" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" data-click="remove-feature" data-i="' + i + '"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(f.icon, function(v) { content.site.about.features[i].icon = v; renderSite(); }) + '</div>';
    h += '<div class="field"><label>Заголовок</label><input value="' + esc(f.title) + '" data-change="set-site" data-path="about.features.' + i + '.title"></div>';
    h += '<div class="field"><label>Текст</label><input value="' + esc(f.text) + '" data-change="set-site" data-path="about.features.' + i + '.text"></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" data-click="add-feature"><i class="fas fa-plus"></i> Добавить преимущество</button>';
  h += '</div>';

  // === CTA ===
  h += '<div class="card"><h3>Кнопка CTA</h3>';
  h += '<div class="field"><label>Текст</label><input value="' + esc(getSite('about.cta.text','')) + '" data-change="set-site" data-path="about.cta.text"></div>';
  h += '<div class="field"><label>Иконка кнопки</label>' + iconPreviewBtn(getSite('about.cta.icon',''), function(v) { content.site.about.cta.icon = v; renderSite(); }) + '</div>';
  h += '<div class="field"><label>Ссылка</label><input value="' + esc(getSite('about.cta.link','')) + '" data-change="set-site" data-path="about.cta.link"></div>';
  h += '</div>';

  el.innerHTML = h;
}

function renderContact() {
  let el = document.getElementById('section-contact');
  if (!content.contact) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  let h = '<div class="section-header"><h2>Контакты</h2><p style="color:#888;font-size:0.85rem;">Телефон, соцсети, адрес, расписание, футер</p></div>';

  h += '<div class="card"><h3>Телефон и соцсети</h3>';
  h += '<div class="field"><label>Телефон (отображаемый)</label><input value="' + esc(getContact('phone','')) + '" data-change="set-contact" data-path="phone"></div>';
  h += '<div class="field"><label>Телефон (raw, для ссылки)</label><input value="' + esc(getContact('phoneRaw','')) + '" data-change="set-contact" data-path="phoneRaw"></div>';
  h += '<div class="field"><label>WhatsApp URL</label><input value="' + esc(getContact('whatsapp.url','')) + '" data-change="set-contact" data-path="whatsapp.url"></div>';
  h += '<div class="field"><label>Telegram</label><input value="' + esc(getContact('telegram','')) + '" data-change="set-contact" data-path="telegram"></div>';
  h += '<div class="field"><label>VK</label><input value="' + esc(getContact('vk','')) + '" data-change="set-contact" data-path="vk"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Адрес и время работы</h3>';
  h += '<div class="field"><label>Регион</label><input value="' + esc(getContact('address.region','')) + '" data-change="set-contact" data-path="address.region"></div>';
  h += '<div class="field"><label>Улица</label><input value="' + esc(getContact('address.street','')) + '" data-change="set-contact" data-path="address.street"></div>';
  h += '<div class="field"><label>Полный адрес</label><input value="' + esc(getContact('address.full','')) + '" data-change="set-contact" data-path="address.full"></div>';
  h += '<div class="field"><label>Будни</label><input value="' + esc(getContact('hours.weekdays','')) + '" data-change="set-contact" data-path="hours.weekdays"></div>';
  h += '<div class="field"><label>Выходные</label><input value="' + esc(getContact('hours.weekends','')) + '" data-change="set-contact" data-path="hours.weekends"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Расписание</h3>';
  let sched = getContact('schedule', []);
  sched.forEach(function(g, gi) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" data-click="move-up" data-collection="contact.schedule" data-idx="' + gi + '" data-render="renderContact" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" data-click="move-down" data-collection="contact.schedule" data-idx="' + gi + '" data-render="renderContact" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" data-click="remove-schedule-group" data-gi="' + gi + '"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Группа</label><input value="' + esc(g.group) + '" data-change="set-contact" data-path="schedule.' + gi + '.group"></div>';
    (g.days || []).forEach(function(d, di) {
      h += '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">';
      h += '<input style="flex:1" value="' + esc(d.days) + '" placeholder="Дни" data-change="set-contact" data-path="schedule.' + gi + '.days.' + di + '.days">';
      h += '<input style="flex:1" value="' + esc(d.time) + '" placeholder="Время" data-change="set-contact" data-path="schedule.' + gi + '.days.' + di + '.time">';
      h += '<button style="background:none;border:none;color:#e74c3c" data-click="remove-schedule-day" data-gi="' + gi + '" data-di="' + di + '"><i class="fas fa-times"></i></button>';
      h += '</div>';
    });
    h += '<button class="add-btn" data-click="add-schedule-day" data-gi="' + gi + '"><i class="fas fa-plus"></i> Добавить день</button>';
    h += '</div>';
  });
  h += '<button class="add-btn" data-click="add-schedule-group"><i class="fas fa-plus"></i> Добавить группу</button>';
  h += '</div>';

  h += '<div class="card"><h3>Транспортная доступность</h3>';
  let transp = getContact('transport', []);
  transp.forEach(function(t, ti) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" data-click="move-up" data-collection="contact.transport" data-idx="' + ti + '" data-render="renderContact" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" data-click="move-down" data-collection="contact.transport" data-idx="' + ti + '" data-render="renderContact" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" data-click="remove-transport" data-ti="' + ti + '"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(t.icon || 'fa-solid fa-train', function(v) { content.contact.transport[ti].icon = v; renderContact(); }) + '</div>';
    h += '<div class="field"><label>Название</label><input value="' + esc(t.title) + '" data-change="set-contact" data-path="transport.' + ti + '.title"></div>';
    h += '<div class="field"><label>Описание</label><input value="' + esc(t.text) + '" data-change="set-contact" data-path="transport.' + ti + '.text"></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" data-click="add-transport"><i class="fas fa-plus"></i> Добавить вариант</button>';
  h += '</div>';

  h += '<div class="card"><h3>Преимущества мессенджеров</h3>';
  h += '<div class="field"><label>Заголовок</label><input value="' + esc(getContact('benefitsTitle','')) + '" data-change="set-contact" data-path="benefitsTitle"></div>';
  h += '<div class="field"><label>Пункты (каждый с новой строки)</label><textarea rows="4" data-change="set-contact" data-path="benefits" data-transform="split-lines">' + esc((getContact('benefits',[])||[]).join('\n')) + '</textarea></div>';
  h += '<div class="field"><label>Примечание</label><input value="' + esc(getContact('benefitsNote','')) + '" data-change="set-contact" data-path="benefitsNote"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Футер</h3>';
  h += '<div class="field"><label>Логотип — заголовок</label><input value="' + esc(getContact('footer.logoTitle','')) + '" data-change="set-contact" data-path="footer.logoTitle"></div>';
  h += '<div class="field"><label>Логотип — подзаголовок</label><input value="' + esc(getContact('footer.logoSubtitle','')) + '" data-change="set-contact" data-path="footer.logoSubtitle"></div>';
  h += '<div class="field"><label>Описание</label><textarea rows="2" data-change="set-contact" data-path="footer.description">' + esc(getContact('footer.description','')) + '</textarea></div>';
  h += '<div class="field"><label>CTA — заголовок</label><input value="' + esc(getContact('footer.cta.text','')) + '" data-change="set-contact" data-path="footer.cta.text"></div>';
  h += '<div class="field"><label>CTA — подтекст</label><input value="' + esc(getContact('footer.cta.subtext','')) + '" data-change="set-contact" data-path="footer.cta.subtext"></div>';
  h += '<div class="field"><label>CTA — текст кнопки</label><input value="' + esc(getContact('footer.cta.buttonText','')) + '" data-change="set-contact" data-path="footer.cta.buttonText"></div>';
  h += '<div class="field"><label>CTA — ссылка кнопки</label><input value="' + esc(getContact('footer.cta.buttonLink','')) + '" data-change="set-contact" data-path="footer.cta.buttonLink"></div>';
  h += '</div>';

  el.innerHTML = h;
}

function addScheduleGroup() {
  if (!content.contact.schedule) content.contact.schedule = [];
  content.contact.schedule.push({group: 'Новая группа', days: [{days: 'Пн, Ср, Пт', time: '00:00–00:00'}]});
  dirty = true;
  renderContact();
}
function removeScheduleGroup(i) { if (confirm('Удалить группу расписания?')) { content.contact.schedule.splice(i, 1); dirty = true; renderContact(); } }
function addScheduleDay(gi) {
  content.contact.schedule[gi].days.push({days: '', time: ''});
  dirty = true;
  renderContact();
}
function removeScheduleDay(gi, di) {
  content.contact.schedule[gi].days.splice(di, 1);
  dirty = true;
  renderContact();
}
function addTransport() {
  if (!content.contact.transport) content.contact.transport = [];
  content.contact.transport.push({icon: 'fa-solid fa-train', title: 'Новый вариант', text: ''});
  dirty = true;
  renderContact();
}
function removeTransport(i) { if (confirm('Удалить вариант транспорта?')) { content.contact.transport.splice(i, 1); dirty = true; renderContact(); } }

function setTraining(ci,k,v) { content.training.categories[ci][k]=v; dirty=true; }
function setPlan(ci,pi,k,v) { content.training.categories[ci].plans[pi][k]=v; dirty=true; }
function setPlanFeatures(ci,pi,v) { content.training.categories[ci].plans[pi].features=v.split('\n').filter(Boolean); dirty=true; }
function setGallery(i,k,v) { content.gallery.items[i][k]=v; dirty=true; }
function setReview(i,k,v) { content.reviews.items[i][k]=v; dirty=true; }
function setAchievement(i,k,v) {
  if (['top','left','right','bottom','rotate','duration'].includes(k)) {
    v = v === '' ? undefined : parseFloat(v);
  }
  content.achievements.items[i][k]=v;
  dirty=true;
}

function deepSet(obj, path, v) {
  let parts = path.split('.');
  for (let p = 0; p < parts.length - 1; p++) {
    if (!obj[parts[p]]) obj[parts[p]] = {};
    obj = obj[parts[p]];
  }
  obj[parts[parts.length - 1]] = v;
  dirty = true;
}
function deepGet(obj, path, def) {
  let parts = path.split('.');
  for (let p = 0; p < parts.length; p++) {
    if (!obj || typeof obj !== 'object') return def;
    obj = obj[parts[p]];
  }
  return obj !== undefined ? obj : def;
}

function setSite(path, v) { deepSet(content.site, path, v); }
function getSite(path, def) { return deepGet(content.site, path, def); }
function setContact(path, v) { deepSet(content.contact, path, v); }
function getContact(path, def) { return deepGet(content.contact, path, def); }

function addTrainer() {
  if (!content.site.about.trainers) content.site.about.trainers = [];
  content.site.about.trainers.push({name: 'Новый тренер', title: 'Должность', image: ''});
  dirty = true;
  renderSite();
}
function removeTrainer(i) { if (confirm('Удалить тренера?')) { content.site.about.trainers.splice(i, 1); dirty = true; renderSite(); } }

function addAboutFeature() {
  if (!content.site.about.features) content.site.about.features = [];
  content.site.about.features.push({icon: 'fas fa-check', title: '', text: ''});
  dirty = true;
  renderSite();
}
function removeAboutFeature(i) { if (confirm('Удалить преимущество?')) { content.site.about.features.splice(i, 1); dirty = true; renderSite(); } }

function addPlan(ci) { content.training.categories[ci].plans.push({id:'new-'+Date.now(),title:'',price:'',perClass:'',popular:false,features:[]}); dirty = true; renderTraining(); }
function removePlan(ci,pi) { if (confirm('Удалить тариф?')) { content.training.categories[ci].plans.splice(pi,1); dirty = true; renderTraining(); } }
function addCategory() { content.training.categories.push({id:'cat-'+Date.now(),title:'Новая категория',icon:'fas fa-user',plans:[]}); dirty = true; renderTraining(); }
function removeCategory(ci) { if (confirm('Удалить категорию?')) { content.training.categories.splice(ci,1); dirty = true; renderTraining(); } }
function addGallery() { content.gallery.items.push({id:Date.now(),image:'',title:'',description:'',type:'training',badge:'',date:'',featured:false}); dirty = true; renderGallery(); }
function removeGallery(i) { if (confirm('Удалить фото?')) { content.gallery.items.splice(i,1); dirty = true; renderGallery(); } }
function addReview() { content.reviews.items.push({id:Date.now(),name:'',experience:'',text:'',avatar:'',rating:5}); dirty = true; renderReviews(); }
function removeReview(i) { if (confirm('Удалить отзыв?')) { content.reviews.items.splice(i,1); dirty = true; renderReviews(); } }
function addAchievement() { content.achievements.items.push({image:'',title:'',top:0,left:0,rotate:0,duration:8}); dirty = true; renderAchievements(); }
function removeAchievement(i) { if (confirm('Удалить достижение?')) { content.achievements.items.splice(i,1); dirty = true; renderAchievements(); } }

function uploadImage(index, folder, input, field, renderFn) {
  field = field || 'image';
  if (!renderFn) {
    if (folder === 'gallery') renderFn = renderGallery;
    else if (folder === 'reviews') renderFn = renderReviews;
    else if (folder === 'hero') renderFn = renderAchievements;
    else if (folder === 'trainer') renderFn = renderSite;
  }
  let file = input.files[0];
  if (!file) return;
  let label = input.nextElementSibling;
  let pathSpan = label.nextElementSibling;
  label.textContent = 'Загрузка...';

  let reader = new FileReader();
  reader.onload = function(e) {
    let dataUrl = e.target.result;
    let filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    fetch(API + '/admin/upload', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password: password, filename: filename, data: dataUrl, folder: folder})
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        if (folder === 'gallery') content.gallery.items[index][field] = data.url;
        else if (folder === 'reviews') content.reviews.items[index][field] = data.url;
        else if (folder === 'hero') content.achievements.items[index][field] = data.url;
        else if (folder === 'trainer') content.site.about.trainers[index][field] = data.url;
        dirty = true;
        label.innerHTML = '<i class="fas fa-upload"></i> Выбрать файл';
        pathSpan.textContent = data.url;
        if (renderFn) renderFn();
      } else {
        label.textContent = 'Ошибка, попробуйте снова';
      }
    })
    .catch(function() {
      label.textContent = 'Ошибка соединения';
    });
  };
  reader.readAsDataURL(file);
}

function logout() {
  sessionStorage.removeItem('boxclub_pass');
  password = '';
  document.getElementById('adminScreen').classList.remove('active');
  document.getElementById('loginScreen').style.display = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').textContent = '';
}

function swap(arr, a, b) { let t = arr[a]; arr[a] = arr[b]; arr[b] = t; }
function moveUp(arr, i, renderFn) { if (i > 0) { swap(arr, i, i - 1); renderFn(); } }
function moveDown(arr, i, renderFn) { if (i < arr.length - 1) { swap(arr, i, i + 1); renderFn(); } }

// --- Event delegation ---
function actionHandler(e) {
  const btn = e.target.closest('[data-click]');
  if (!btn) return;
  const action = btn.getAttribute('data-click');
  if (btn.tagName === 'A' || btn.tagName === 'BUTTON') e.preventDefault();

  switch (action) {
    case 'login-btn': login(); break;
    case 'logout': logout(); break;
    case 'save-all': saveAll(); break;
    case 'close-icon-picker-modal': closeIconPicker(); break;
    case 'switch-tab': switchTab(btn.getAttribute('data-tab')); break;
    case 'add-category': addCategory(); break;
    case 'remove-category': removeCategory(parseInt(btn.getAttribute('data-ci'))); break;
    case 'add-plan': addPlan(parseInt(btn.getAttribute('data-ci'))); break;
    case 'remove-plan': removePlan(parseInt(btn.getAttribute('data-ci')), parseInt(btn.getAttribute('data-pi'))); break;
    case 'add-gallery': addGallery(); break;
    case 'remove-gallery': removeGallery(parseInt(btn.getAttribute('data-i'))); break;
    case 'add-review': addReview(); break;
    case 'remove-review': removeReview(parseInt(btn.getAttribute('data-i'))); break;
    case 'add-achievement': addAchievement(); break;
    case 'remove-achievement': removeAchievement(parseInt(btn.getAttribute('data-i'))); break;
    case 'add-trainer': addTrainer(); break;
    case 'remove-trainer': removeTrainer(parseInt(btn.getAttribute('data-i'))); break;
    case 'add-feature': addAboutFeature(); break;
    case 'remove-feature': removeAboutFeature(parseInt(btn.getAttribute('data-i'))); break;
    case 'add-schedule-group': addScheduleGroup(); break;
    case 'remove-schedule-group': removeScheduleGroup(parseInt(btn.getAttribute('data-gi'))); break;
    case 'add-schedule-day': addScheduleDay(parseInt(btn.getAttribute('data-gi'))); break;
    case 'remove-schedule-day': removeScheduleDay(parseInt(btn.getAttribute('data-gi')), parseInt(btn.getAttribute('data-di'))); break;
    case 'add-transport': addTransport(); break;
    case 'remove-transport': removeTransport(parseInt(btn.getAttribute('data-ti'))); break;
    case 'close-icon-picker': closeIconPicker(); break;
    case 'pick-icon': pickIconFromModal(btn); break;
    case 'move-up':
    case 'move-down': {
      const collection = resolveCollection(btn.getAttribute('data-collection'));
      const idx = parseInt(btn.getAttribute('data-idx'));
      const render = window[btn.getAttribute('data-render')];
      if (action === 'move-up') moveUp(collection, idx, render);
      else moveDown(collection, idx, render);
      break;
    }
    case 'open-icon-picker': {
      const cb = window[btn.getAttribute('data-cb')];
      openIconPicker(btn.getAttribute('data-current-icon') || 'fas fa-star', cb);
      break;
    }
  }
}

function changeHandler(e) {
  const el = e.target;
  const action = el.getAttribute('data-change');
  if (!action) return;
  const value = el.type === 'checkbox' ? el.checked : el.value;

  switch (action) {
    case 'set-training': setTraining(parseInt(el.getAttribute('data-ci')), el.getAttribute('data-key'), value); break;
    case 'set-plan': setPlan(parseInt(el.getAttribute('data-ci')), parseInt(el.getAttribute('data-pi')), el.getAttribute('data-key'), value); break;
    case 'set-plan-features': setPlanFeatures(parseInt(el.getAttribute('data-ci')), parseInt(el.getAttribute('data-pi')), value); break;
    case 'set-gallery': setGallery(parseInt(el.getAttribute('data-i')), el.getAttribute('data-key'), value); break;
    case 'set-review': setReview(parseInt(el.getAttribute('data-i')), el.getAttribute('data-key'), value); break;
    case 'set-achievement': setAchievement(parseInt(el.getAttribute('data-i')), el.getAttribute('data-key'), value); break;
    case 'set-site': {
      const transform = el.getAttribute('data-transform');
      const finalValue = transform === 'split-lines' ? value.split('\n').filter(Boolean) : value;
      setSite(el.getAttribute('data-path'), finalValue);
      break;
    }
    case 'set-contact': {
      const transform = el.getAttribute('data-transform');
      const finalValue = transform === 'split-lines' ? value.split('\n').filter(Boolean) : value;
      setContact(el.getAttribute('data-path'), finalValue);
      break;
    }
    case 'upload-gallery': uploadImage(parseInt(el.getAttribute('data-i')), 'gallery', el); break;
    case 'upload-review': uploadImage(parseInt(el.getAttribute('data-i')), 'reviews', el, 'avatar'); break;
    case 'upload-hero': uploadImage(parseInt(el.getAttribute('data-i')), 'hero', el, 'image'); break;
    case 'upload-trainer': uploadImage(parseInt(el.getAttribute('data-i')), 'trainer', el, 'image'); break;
  }
}

function resolveCollection(path) {
  let parts = path.split('.');
  let obj = content;
  for (let p = 0; p < parts.length; p++) obj = obj[parts[p]];
  return obj;
}

document.addEventListener('click', actionHandler);
document.getElementById('adminScreen').addEventListener('change', changeHandler);

function switchTab(name) {
  document.querySelectorAll('.section, .sidebar a').forEach(function(el){el.classList.remove('active');});
  document.getElementById('section-'+name).classList.add('active');
  document.querySelector('.sidebar a[data-tab="'+name+'"]').classList.add('active');
}

function saveAll() {
  let btn = document.getElementById('saveBtn');
  let status = document.getElementById('saveStatus');
  btn.disabled = true;
  status.className = 'save-status';
  status.textContent = 'Сохранение...';
  if (!password) { status.className = 'save-status error'; status.textContent = 'Сессия истекла, перезагрузите страницу'; btn.disabled = false; return; }
  let files = [
    {path:'public/content/training.json', content: JSON.stringify(content.training, null, 2)},
    {path:'public/content/gallery.json', content: JSON.stringify(content.gallery, null, 2)},
    {path:'public/content/reviews.json', content: JSON.stringify(content.reviews, null, 2)},
    {path:'public/content/achievements.json', content: JSON.stringify(content.achievements, null, 2)},
    {path:'public/content/site.json', content: JSON.stringify(content.site, null, 2)},
    {path:'public/content/contact.json', content: JSON.stringify(content.contact, null, 2)},
  ];
  fetch(API + '/admin/save', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({password: password, files: files})
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.success) {
      dirty = false;
      status.className = 'save-status success';
      status.textContent = '✓ Сохранено! GitHub Actions деплоит (~1 мин)';
    } else {
      status.className = 'save-status error';
      status.textContent = 'Ошибка: ' + (data.error || 'неизвестная');
    }
  })
  .catch(function() {
    status.className = 'save-status error';
    status.textContent = 'Ошибка соединения';
  })
  .finally(function() { btn.disabled = false; });
}

document.getElementById('passwordInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') login();
});

password = sessionStorage.getItem('boxclub_pass');
if (password) loadContent();

window.addEventListener('beforeunload', function(e) {
  if (dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
