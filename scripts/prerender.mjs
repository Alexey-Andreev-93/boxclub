import fs from 'fs';

const state = {};
const dir = 'public/content';

for (const file of fs.readdirSync(dir)) {
  if (file.endsWith('.json')) {
    const key = file.replace('.json', '');
    state[key] = JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf-8'));
  }
}

const htmlPath = 'docs/index.html';
let html = fs.readFileSync(htmlPath, 'utf-8');
const script = `<script>window.__INITIAL_STATE__=${JSON.stringify(state)}</script>`;
html = html.replace('</body>', script + '</body>');
fs.writeFileSync(htmlPath, html);

console.log('prerender: injected state for', Object.keys(state).join(', '));
