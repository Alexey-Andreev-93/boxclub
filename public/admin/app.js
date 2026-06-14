var API = 'https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net';
var content = {};
var password = '';

function login() {
  var pwd = document.getElementById('passwordInput').value;
  var err = document.getElementById('loginError');
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
  var files = ['training', 'gallery', 'reviews', 'achievements', 'site', 'contact'];
  var loaded = 0;
  files.forEach(function(name) {
    fetch('/content/' + name + '.json')
      .then(function(r) { return r.json(); })
      .then(function(data) { content[name] = data; loaded++; if (loaded === files.length) renderAll(); })
      .catch(function() { content[name] = {}; loaded++; if (loaded === files.length) renderAll(); });
  });
}

function renderAll() { renderTraining(); renderGallery(); renderReviews(); renderAchievements(); renderSite(); renderContact(); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'&#10;'); }

var ICONS = [
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

var _iconCallback = null;
var _icbId = 0;

function iconPreviewBtn(value, fn) {
  var v = value || 'fas fa-star';
  var id = 'icb' + (++_icbId);
  window[id] = fn;
  return '<button type="button" class="icon-preview-btn" onclick="openIconPicker(\'' + v + '\',window.' + id + ')"><span class="preview-icon"><i class="' + v + '"></i></span> Сменить</button>';
}

function openIconPicker(currentValue, callback) {
  _iconCallback = callback;
  var grid = document.getElementById('iconModalGrid');
  var h = '';
  ICONS.forEach(function(group) {
    h += '<div class="icon-group-label">' + esc(group.g) + '</div>';
    group.items.forEach(function(icon) {
      var sel = icon.v === currentValue ? ' selected' : '';
      h += '<div class="icon-opt' + sel + '" data-icon="' + icon.v + '" onclick="pickIconFromModal(this)" title="' + esc(icon.l) + '"><i class="' + icon.v + '"></i></div>';
    });
  });
  grid.innerHTML = h;
  document.getElementById('iconModal').classList.add('active');
}

function closeIconPicker() {
  document.getElementById('iconModal').classList.remove('active');
}

function pickIconFromModal(el) {
  var value = el.getAttribute('data-icon');
  closeIconPicker();
  if (_iconCallback) _iconCallback(value);
}

function renderTraining() {
  var el = document.getElementById('section-training');
  if (!content.training || !content.training.categories) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var html = '<div class="section-header"><h2>Стоимость тренировок</h2><p style="color:#888;font-size:0.85rem;">Исправь и нажми «Сохранить всё» внизу</p></div>';
  content.training.categories.forEach(function(cat, ci) {
    html += '<div class="card">';
    html += '<div class="cat-header"><h3>' + esc(cat.title) + '</h3><button class="remove-cat-btn" onclick="removeCategory(' + ci + ')" title="Удалить категорию"><i class="fas fa-trash"></i></button></div>';
    html += '<div class="field"><label>Название категории</label><input value="' + esc(cat.title) + '" onchange="setTraining(' + ci + ',\'title\',this.value)"></div>';
    html += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(cat.icon, function(v) { content.training.categories[ci].icon = v; renderTraining(); }) + '</div>';
    cat.plans.forEach(function(plan, pi) {
      html += '<div class="array-item">';
      html += '<div class="item-toolbar">';
      html += '<button class="move-btn" onclick="moveUp(content.training.categories[' + ci + '].plans,' + pi + ',renderTraining)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
      html += '<button class="move-btn" onclick="moveDown(content.training.categories[' + ci + '].plans,' + pi + ',renderTraining)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
      html += '<button class="remove-btn" onclick="removePlan(' + ci + ',' + pi + ')"><i class="fas fa-times"></i></button>';
      html += '</div>';
      html += '<div class="field"><label>Название тарифа</label><input value="' + esc(plan.title) + '" onchange="setPlan(' + ci + ',' + pi + ',\'title\',this.value)"></div>';
      html += '<div class="field"><label>Цена</label><input value="' + esc(plan.price) + '" onchange="setPlan(' + ci + ',' + pi + ',\'price\',this.value)"></div>';
      html += '<div class="field"><label>Цена за занятие</label><input value="' + esc(plan.perClass) + '" onchange="setPlan(' + ci + ',' + pi + ',\'perClass\',this.value)"></div>';
      html += '<div class="field"><label>Текст кнопки</label><input value="' + esc(plan.buttonText || '') + '" onchange="setPlan(' + ci + ',' + pi + ',\'buttonText\',this.value)"></div>';
      html += '<div class="field"><label>Текст бейджа</label><input value="' + esc(plan.badgeText || '') + '" onchange="setPlan(' + ci + ',' + pi + ',\'badgeText\',this.value)"></div>';
      html += '<div class="field"><div class="checkbox-wrap"><input type="checkbox" ' + (plan.popular ? 'checked' : '') + ' onchange="setPlan(' + ci + ',' + pi + ',\'popular\',this.checked)"><label>Популярный?</label></div></div>';
      html += '<div class="field"><label>Преимущества (каждое с новой строки)</label><textarea rows="3" onchange="setPlanFeatures(' + ci + ',' + pi + ',this.value)">' + esc((plan.features || []).join('\n')) + '</textarea></div>';
      html += '</div>';
    });
    html += '<button class="add-btn" onclick="addPlan(' + ci + ')"><i class="fas fa-plus"></i> Добавить тариф</button>';
    html += '</div>';
  });
  html += '<button class="add-btn" onclick="addCategory()" style="border-color:#999;color:#333;"><i class="fas fa-plus"></i> Добавить категорию</button>';
  el.innerHTML = html;
}

function renderGallery() {
  var el = document.getElementById('section-gallery');
  if (!content.gallery || !content.gallery.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var html = '<div class="section-header"><h2>Галерея</h2><p style="color:#888;font-size:0.85rem;">Для добавления фото выберите файл и оно загрузится автоматически</p></div>';
  content.gallery.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" onclick="moveUp(content.gallery.items,' + i + ',renderGallery)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" onclick="moveDown(content.gallery.items,' + i + ',renderGallery)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" onclick="removeGallery(' + i + ')"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Заголовок</label><input value="' + esc(item.title) + '" onchange="setGallery(' + i + ',\'title\',this.value)"></div>';
    html += '<div class="field"><label>Описание</label><textarea rows="2" onchange="setGallery(' + i + ',\'description\',this.value)">' + esc(item.description) + '</textarea></div>';
    html += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (item.image) html += '<img class="img-preview" src="' + esc(item.image) + '">';
    html += '<input type="file" accept="image/*" id="gallery-file-' + i + '" onchange="uploadImage(' + i + ',\'gallery\',this)">';
    html += '<label class="img-label" for="gallery-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.image || 'нет фото') + '</span></div></div>';
    html += '<div class="field"><label>Тип</label><select onchange="setGallery(' + i + ',\'type\',this.value)"><option value="training" ' + (item.type==='training'?'selected':'') + '>Тренировка</option><option value="competitions" ' + (item.type==='competitions'?'selected':'') + '>Соревнования</option><option value="team" ' + (item.type==='team'?'selected':'') + '>Команда</option></select></div>';
    html += '<div class="field"><label>Бейдж</label><input value="' + esc(item.badge) + '" onchange="setGallery(' + i + ',\'badge\',this.value)"></div>';
    html += '<div class="field"><label>Дата</label><input value="' + esc(item.date) + '" onchange="setGallery(' + i + ',\'date\',this.value)"></div>';
    html += '<div class="field"><div class="checkbox-wrap"><input type="checkbox" ' + (item.featured?'checked':'') + ' onchange="setGallery(' + i + ',\'featured\',this.checked)"><label>Избранное?</label></div></div>';
    html += '</div>';
  });
  html += '<button class="add-btn" onclick="addGallery()"><i class="fas fa-plus"></i> Добавить фото</button>';
  el.innerHTML = html;
}

function renderReviews() {
  var el = document.getElementById('section-reviews');
  if (!content.reviews || !content.reviews.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var html = '<div class="section-header"><h2>Отзывы</h2></div>';
  content.reviews.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" onclick="moveUp(content.reviews.items,' + i + ',renderReviews)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" onclick="moveDown(content.reviews.items,' + i + ',renderReviews)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" onclick="removeReview(' + i + ')"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Имя</label><input value="' + esc(item.name) + '" onchange="setReview(' + i + ',\'name\',this.value)"></div>';
    html += '<div class="field"><label>Опыт</label><input value="' + esc(item.experience) + '" onchange="setReview(' + i + ',\'experience\',this.value)"></div>';
    html += '<div class="field"><label>Аватар</label><div class="img-upload-wrap">';
    if (item.avatar) html += '<img class="img-preview" src="' + esc(item.avatar) + '">';
    html += '<input type="file" accept="image/*" id="review-file-' + i + '" onchange="uploadImage(' + i + ',\'reviews\',this,\'avatar\')">';
    html += '<label class="img-label" for="review-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.avatar || 'нет фото') + '</span></div></div>';
    html += '<div class="field"><label>Текст отзыва</label><textarea rows="3" onchange="setReview(' + i + ',\'text\',this.value)">' + esc(item.text) + '</textarea></div>';
    html += '<div class="field"><label>Рейтинг (1-5)</label><input type="number" min="1" max="5" value="' + item.rating + '" onchange="setReview(' + i + ',\'rating\',parseInt(this.value)||5)"></div>';
    html += '</div>';
  });
  html += '<button class="add-btn" onclick="addReview()"><i class="fas fa-plus"></i> Добавить отзыв</button>';
  el.innerHTML = html;
}

function renderAchievements() {
  var el = document.getElementById('section-achievements');
  if (!content.achievements || !content.achievements.items) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var html = '<div class="section-header"><h2>Достижения</h2></div>';
  content.achievements.items.forEach(function(item, i) {
    html += '<div class="card array-item">';
    html += '<div class="item-toolbar">';
    html += '<button class="move-btn" onclick="moveUp(content.achievements.items,' + i + ',renderAchievements)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    html += '<button class="move-btn" onclick="moveDown(content.achievements.items,' + i + ',renderAchievements)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    html += '<button class="remove-btn" onclick="removeAchievement(' + i + ')"><i class="fas fa-times"></i></button>';
    html += '</div>';
    html += '<div class="field"><label>Название</label><input value="' + esc(item.title) + '" onchange="setAchievement(' + i + ',\'title\',this.value)"></div>';
    html += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (item.image) html += '<img class="img-preview" src="' + esc(item.image) + '">';
    html += '<input type="file" accept="image/*" id="ach-file-' + i + '" onchange="uploadImage(' + i + ',\'hero\',this,\'image\')">';
    html += '<label class="img-label" for="ach-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    html += '<span class="img-path">' + esc(item.image || 'нет фото') + '</span></div></div>';
    html += '<div class="field"><label>CSS-класс</label><input value="' + esc(item.positionClass) + '" onchange="setAchievement(' + i + ',\'positionClass\',this.value)"></div>';
    html += '</div>';
  });
  html += '<button class="add-btn" onclick="addAchievement()"><i class="fas fa-plus"></i> Добавить достижение</button>';
  el.innerHTML = html;
}

function renderSite() {
  var el = document.getElementById('section-site');
  if (!content.site) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var h = '<div class="section-header"><h2>О школе</h2><p style="color:#888;font-size:0.85rem;">Тренеры, текст и преимущества секции «О школе»</p></div>';

  // === TRAINERS ===
  h += '<div class="card"><h3>Тренеры</h3>';
  var trainers = getSite('about.trainers', []);
  trainers.forEach(function(t, i) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" onclick="moveUp(content.site.about.trainers,' + i + ',renderSite)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" onclick="moveDown(content.site.about.trainers,' + i + ',renderSite)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" onclick="removeTrainer(' + i + ')"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Имя</label><input value="' + esc(t.name) + '" onchange="setSite(\'about.trainers.' + i + '.name\',this.value)"></div>';
    h += '<div class="field"><label>Должность</label><input value="' + esc(t.title) + '" onchange="setSite(\'about.trainers.' + i + '.title\',this.value)"></div>';
    h += '<div class="field"><label>Фото</label><div class="img-upload-wrap">';
    if (t.image) h += '<img class="img-preview" src="' + esc(t.image) + '">';
    h += '<input type="file" accept="image/*" id="trainer-file-' + i + '" onchange="uploadImage(' + i + ',\'trainer\',this,\'image\')">';
    h += '<label class="img-label" for="trainer-file-' + i + '"><i class="fas fa-upload"></i> Выбрать файл</label>';
    h += '<span class="img-path">' + esc(t.image || 'нет фото') + '</span></div></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" onclick="addTrainer()"><i class="fas fa-plus"></i> Добавить тренера</button>';
  h += '</div>';

  // === ABOUT TEXT ===
  h += '<div class="card"><h3>Текст о школе</h3>';
  h += '<div class="field"><label>Заголовок секции</label><input value="' + esc(getSite('about.title','')) + '" onchange="setSite(\'about.title\',this.value)"></div>';
  h += '<div class="field"><label>Описание (каждый абзац с новой строки)</label><textarea rows="4" onchange="setSite(\'about.description\',this.value.split(\'\\n\').filter(Boolean))">' + esc((getSite('about.description',[])||[]).join('\n')) + '</textarea></div>';
  h += '</div>';

  // === FEATURES ===
  h += '<div class="card"><h3>Преимущества</h3>';
  var afeats = getSite('about.features', []);
  afeats.forEach(function(f, i) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" onclick="moveUp(content.site.about.features,' + i + ',renderSite)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" onclick="moveDown(content.site.about.features,' + i + ',renderSite)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" onclick="removeAboutFeature(' + i + ')"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(f.icon, function(v) { content.site.about.features[i].icon = v; renderSite(); }) + '</div>';
    h += '<div class="field"><label>Заголовок</label><input value="' + esc(f.title) + '" onchange="setSite(\'about.features.' + i + '.title\',this.value)"></div>';
    h += '<div class="field"><label>Текст</label><input value="' + esc(f.text) + '" onchange="setSite(\'about.features.' + i + '.text\',this.value)"></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" onclick="addAboutFeature()"><i class="fas fa-plus"></i> Добавить преимущество</button>';
  h += '</div>';

  // === CTA ===
  h += '<div class="card"><h3>Кнопка CTA</h3>';
  h += '<div class="field"><label>Текст</label><input value="' + esc(getSite('about.cta.text','')) + '" onchange="setSite(\'about.cta.text\',this.value)"></div>';
  h += '<div class="field"><label>Иконка кнопки</label>' + iconPreviewBtn(getSite('about.cta.icon',''), function(v) { content.site.about.cta.icon = v; renderSite(); }) + '</div>';
  h += '<div class="field"><label>Ссылка</label><input value="' + esc(getSite('about.cta.link','')) + '" onchange="setSite(\'about.cta.link\',this.value)"></div>';
  h += '</div>';

  el.innerHTML = h;
}

function renderContact() {
  var el = document.getElementById('section-contact');
  if (!content.contact) { el.innerHTML = '<div class="loading">Нет данных</div>'; return; }
  var h = '<div class="section-header"><h2>Контакты</h2><p style="color:#888;font-size:0.85rem;">Телефон, соцсети, адрес, расписание, футер</p></div>';

  h += '<div class="card"><h3>Телефон и соцсети</h3>';
  h += '<div class="field"><label>Телефон (отображаемый)</label><input value="' + esc(getContact('phone','')) + '" onchange="setContact(\'phone\',this.value)"></div>';
  h += '<div class="field"><label>Телефон (raw, для ссылки)</label><input value="' + esc(getContact('phoneRaw','')) + '" onchange="setContact(\'phoneRaw\',this.value)"></div>';
  h += '<div class="field"><label>WhatsApp URL</label><input value="' + esc(getContact('whatsapp.url','')) + '" onchange="setContact(\'whatsapp.url\',this.value)"></div>';
  h += '<div class="field"><label>Telegram</label><input value="' + esc(getContact('telegram','')) + '" onchange="setContact(\'telegram\',this.value)"></div>';
  h += '<div class="field"><label>VK</label><input value="' + esc(getContact('vk','')) + '" onchange="setContact(\'vk\',this.value)"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Адрес и время работы</h3>';
  h += '<div class="field"><label>Регион</label><input value="' + esc(getContact('address.region','')) + '" onchange="setContact(\'address.region\',this.value)"></div>';
  h += '<div class="field"><label>Улица</label><input value="' + esc(getContact('address.street','')) + '" onchange="setContact(\'address.street\',this.value)"></div>';
  h += '<div class="field"><label>Полный адрес</label><input value="' + esc(getContact('address.full','')) + '" onchange="setContact(\'address.full\',this.value)"></div>';
  h += '<div class="field"><label>Будни</label><input value="' + esc(getContact('hours.weekdays','')) + '" onchange="setContact(\'hours.weekdays\',this.value)"></div>';
  h += '<div class="field"><label>Выходные</label><input value="' + esc(getContact('hours.weekends','')) + '" onchange="setContact(\'hours.weekends\',this.value)"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Расписание</h3>';
  var sched = getContact('schedule', []);
  sched.forEach(function(g, gi) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" onclick="moveUp(content.contact.schedule,' + gi + ',renderContact)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" onclick="moveDown(content.contact.schedule,' + gi + ',renderContact)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" onclick="removeScheduleGroup(' + gi + ')"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Группа</label><input value="' + esc(g.group) + '" onchange="setContact(\'schedule.' + gi + '.group\',this.value)"></div>';
    (g.days || []).forEach(function(d, di) {
      h += '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">';
      h += '<input style="flex:1" value="' + esc(d.days) + '" placeholder="Дни" onchange="setContact(\'schedule.' + gi + '.days.' + di + '.days\',this.value)">';
      h += '<input style="flex:1" value="' + esc(d.time) + '" placeholder="Время" onchange="setContact(\'schedule.' + gi + '.days.' + di + '.time\',this.value)">';
      h += '<button style="background:none;border:none;color:#e74c3c" onclick="removeScheduleDay(' + gi + ',' + di + ')"><i class="fas fa-times"></i></button>';
      h += '</div>';
    });
    h += '<button class="add-btn" onclick="addScheduleDay(' + gi + ')"><i class="fas fa-plus"></i> Добавить день</button>';
    h += '</div>';
  });
  h += '<button class="add-btn" onclick="addScheduleGroup()"><i class="fas fa-plus"></i> Добавить группу</button>';
  h += '</div>';

  h += '<div class="card"><h3>Транспортная доступность</h3>';
  var transp = getContact('transport', []);
  transp.forEach(function(t, ti) {
    h += '<div class="array-item">';
    h += '<div class="item-toolbar">';
    h += '<button class="move-btn" onclick="moveUp(content.contact.transport,' + ti + ',renderContact)" title="Вверх"><i class="fas fa-chevron-up"></i></button>';
    h += '<button class="move-btn" onclick="moveDown(content.contact.transport,' + ti + ',renderContact)" title="Вниз"><i class="fas fa-chevron-down"></i></button>';
    h += '<button class="remove-btn" onclick="removeTransport(' + ti + ')"><i class="fas fa-times"></i></button>';
    h += '</div>';
    h += '<div class="field"><label>Иконка</label>' + iconPreviewBtn(t.icon || 'fa-solid fa-train', function(v) { content.contact.transport[ti].icon = v; renderContact(); }) + '</div>';
    h += '<div class="field"><label>Название</label><input value="' + esc(t.title) + '" onchange="setContact(\'transport.' + ti + '.title\',this.value)"></div>';
    h += '<div class="field"><label>Описание</label><input value="' + esc(t.text) + '" onchange="setContact(\'transport.' + ti + '.text\',this.value)"></div>';
    h += '</div>';
  });
  h += '<button class="add-btn" onclick="addTransport()"><i class="fas fa-plus"></i> Добавить вариант</button>';
  h += '</div>';

  h += '<div class="card"><h3>Преимущества мессенджеров</h3>';
  h += '<div class="field"><label>Заголовок</label><input value="' + esc(getContact('benefitsTitle','')) + '" onchange="setContact(\'benefitsTitle\',this.value)"></div>';
  h += '<div class="field"><label>Пункты (каждый с новой строки)</label><textarea rows="4" onchange="setContact(\'benefits\',this.value.split(\'\\n\').filter(Boolean))">' + esc((getContact('benefits',[])||[]).join('\n')) + '</textarea></div>';
  h += '<div class="field"><label>Примечание</label><input value="' + esc(getContact('benefitsNote','')) + '" onchange="setContact(\'benefitsNote\',this.value)"></div>';
  h += '</div>';

  h += '<div class="card"><h3>Футер</h3>';
  h += '<div class="field"><label>Логотип — заголовок</label><input value="' + esc(getContact('footer.logoTitle','')) + '" onchange="setContact(\'footer.logoTitle\',this.value)"></div>';
  h += '<div class="field"><label>Логотип — подзаголовок</label><input value="' + esc(getContact('footer.logoSubtitle','')) + '" onchange="setContact(\'footer.logoSubtitle\',this.value)"></div>';
  h += '<div class="field"><label>Описание</label><textarea rows="2" onchange="setContact(\'footer.description\',this.value)">' + esc(getContact('footer.description','')) + '</textarea></div>';
  h += '<div class="field"><label>CTA — заголовок</label><input value="' + esc(getContact('footer.cta.text','')) + '" onchange="setContact(\'footer.cta.text\',this.value)"></div>';
  h += '<div class="field"><label>CTA — подтекст</label><input value="' + esc(getContact('footer.cta.subtext','')) + '" onchange="setContact(\'footer.cta.subtext\',this.value)"></div>';
  h += '<div class="field"><label>CTA — текст кнопки</label><input value="' + esc(getContact('footer.cta.buttonText','')) + '" onchange="setContact(\'footer.cta.buttonText\',this.value)"></div>';
  h += '<div class="field"><label>CTA — ссылка кнопки</label><input value="' + esc(getContact('footer.cta.buttonLink','')) + '" onchange="setContact(\'footer.cta.buttonLink\',this.value)"></div>';
  h += '</div>';

  el.innerHTML = h;
}

function addScheduleGroup() {
  if (!content.contact.schedule) content.contact.schedule = [];
  content.contact.schedule.push({group: 'Новая группа', days: [{days: 'Пн, Ср, Пт', time: '00:00–00:00'}]});
  renderContact();
}
function removeScheduleGroup(i) { if (confirm('Удалить группу расписания?')) { content.contact.schedule.splice(i, 1); renderContact(); } }
function addScheduleDay(gi) {
  content.contact.schedule[gi].days.push({days: '', time: ''});
  renderContact();
}
function removeScheduleDay(gi, di) {
  content.contact.schedule[gi].days.splice(di, 1);
  renderContact();
}
function addTransport() {
  if (!content.contact.transport) content.contact.transport = [];
  content.contact.transport.push({icon: 'fa-solid fa-train', title: 'Новый вариант', text: ''});
  renderContact();
}
function removeTransport(i) { if (confirm('Удалить вариант транспорта?')) { content.contact.transport.splice(i, 1); renderContact(); } }

function setTraining(ci,k,v) { content.training.categories[ci][k]=v; }
function setPlan(ci,pi,k,v) { content.training.categories[ci].plans[pi][k]=v; }
function setPlanFeatures(ci,pi,v) { content.training.categories[ci].plans[pi].features=v.split('\n').filter(Boolean); }
function setGallery(i,k,v) { content.gallery.items[i][k]=v; }
function setReview(i,k,v) { content.reviews.items[i][k]=v; }
function setAchievement(i,k,v) { content.achievements.items[i][k]=v; }

function deepSet(obj, path, v) {
  var parts = path.split('.');
  for (var p = 0; p < parts.length - 1; p++) {
    if (!obj[parts[p]]) obj[parts[p]] = {};
    obj = obj[parts[p]];
  }
  obj[parts[parts.length - 1]] = v;
}
function deepGet(obj, path, def) {
  var parts = path.split('.');
  for (var p = 0; p < parts.length; p++) {
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
  renderSite();
}
function removeTrainer(i) { if (confirm('Удалить тренера?')) { content.site.about.trainers.splice(i, 1); renderSite(); } }

function addAboutFeature() {
  if (!content.site.about.features) content.site.about.features = [];
  content.site.about.features.push({icon: 'fas fa-check', title: '', text: ''});
  renderSite();
}
function removeAboutFeature(i) { if (confirm('Удалить преимущество?')) { content.site.about.features.splice(i, 1); renderSite(); } }

function addPlan(ci) { content.training.categories[ci].plans.push({id:'new-'+Date.now(),title:'',price:'',perClass:'',popular:false,features:[]}); renderTraining(); }
function removePlan(ci,pi) { if (confirm('Удалить тариф?')) { content.training.categories[ci].plans.splice(pi,1); renderTraining(); } }
function addCategory() { content.training.categories.push({id:'cat-'+Date.now(),title:'Новая категория',icon:'fas fa-user',plans:[]}); renderTraining(); }
function removeCategory(ci) { if (confirm('Удалить категорию?')) { content.training.categories.splice(ci,1); renderTraining(); } }
function addGallery() { content.gallery.items.push({id:Date.now(),image:'',title:'',description:'',type:'training',badge:'',date:'',featured:false}); renderGallery(); }
function removeGallery(i) { if (confirm('Удалить фото?')) { content.gallery.items.splice(i,1); renderGallery(); } }
function addReview() { content.reviews.items.push({id:Date.now(),name:'',experience:'',text:'',avatar:'',rating:5}); renderReviews(); }
function removeReview(i) { if (confirm('Удалить отзыв?')) { content.reviews.items.splice(i,1); renderReviews(); } }
function addAchievement() { content.achievements.items.push({image:'',title:'',positionClass:'hero__achievement--new'}); renderAchievements(); }
function removeAchievement(i) { if (confirm('Удалить достижение?')) { content.achievements.items.splice(i,1); renderAchievements(); } }

function uploadImage(index, folder, input, field, renderFn) {
  field = field || 'image';
  if (!renderFn) {
    if (folder === 'gallery') renderFn = renderGallery;
    else if (folder === 'reviews') renderFn = renderReviews;
    else if (folder === 'hero') renderFn = renderAchievements;
    else if (folder === 'trainer') renderFn = renderSite;
  }
  var file = input.files[0];
  if (!file) return;
  var label = input.nextElementSibling;
  var pathSpan = label.nextElementSibling;
  label.textContent = 'Загрузка...';

  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    var filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
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

function swap(arr, a, b) { var t = arr[a]; arr[a] = arr[b]; arr[b] = t; }
function moveUp(arr, i, renderFn) { if (i > 0) { swap(arr, i, i - 1); renderFn(); } }
function moveDown(arr, i, renderFn) { if (i < arr.length - 1) { swap(arr, i, i + 1); renderFn(); } }

function switchTab(name) {
  document.querySelectorAll('.section, .sidebar a').forEach(function(el){el.classList.remove('active');});
  document.getElementById('section-'+name).classList.add('active');
  document.querySelector('.sidebar a[onclick*="'+name+'"]').classList.add('active');
}

function saveAll() {
  var btn = document.getElementById('saveBtn');
  var status = document.getElementById('saveStatus');
  btn.disabled = true;
  status.className = 'save-status';
  status.textContent = 'Сохранение...';
  if (!password) { status.className = 'save-status error'; status.textContent = 'Сессия истекла, перезагрузите страницу'; btn.disabled = false; return; }
  var files = [
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
