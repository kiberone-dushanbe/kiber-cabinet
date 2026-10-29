/* Достижения, награды и материалы с главной страницы kiber-one.tj.
   Картинки скачаны с сайта и лежат локально в src/assets/site (WebP), чтобы работали в PWA без сети. */
import statCountries from './assets/site/stat-countries.webp'
import statCities from './assets/site/stat-cities.webp'
import statTutors from './assets/site/stat-tutors.webp'
import statResidents from './assets/site/stat-residents.webp'
import certWsis from './assets/site/cert-wsis.webp'
import certSamsung from './assets/site/cert-samsung.webp'
import certRoblox from './assets/site/cert-roblox.webp'
import certMicrosoft from './assets/site/cert-microsoft.webp'
import certGolden from './assets/site/cert-golden-brand.webp'
import logoWsis from './assets/site/logo-wsis.webp'
import logoHistes from './assets/site/logo-histes.webp'
import logoMicrosoft from './assets/site/logo-microsoft.webp'
import reason1 from './assets/site/reason-1.webp'
import reason2 from './assets/site/reason-2.webp'
import reason3 from './assets/site/reason-3.webp'
import reason4 from './assets/site/reason-4.webp'
import reason5 from './assets/site/reason-5.webp'
export { default as mapImg } from './assets/site/map.webp'
export { default as kidImg } from './assets/site/kid.webp'
export { default as practiceImg } from './assets/site/practice.webp'

export const STATS = [
  { value: '36', label: 'стран', img: statCountries },
  { value: '470+', label: 'городов', img: statCities },
  { value: '1520', label: 'тьюторов', img: statTutors },
  { value: '80 тыс.', label: 'резидентов', img: statResidents },
]

export const PARENTS = 'Более 200 000 родителей доверяют KIBERone'

export const AWARDS = [
  { title: 'Признан ЮНЕСКО лучшим проектом в мире в сфере цифровых технологий для детей', note: 'WSIS Prizes 2020', img: certWsis },
  { title: 'Официальный партнёр компании Samsung', note: 'IT Школа Samsung', img: certSamsung },
  { title: 'Официальный партнёр и член Roblox Family Education', note: 'Roblox Educator', img: certRoblox },
  { title: 'Учебное заведение, квалифицированное корпорацией Майкрософт', note: 'Microsoft', img: certMicrosoft },
  { title: 'Номинант «Прорыв года» премии Golden Brand 2019', note: 'Golden Brand', img: certGolden },
]

export const AWARD_LOGOS = [
  { alt: 'WSIS Prizes 2020 — Winner', img: logoWsis },
  { alt: 'HiSTES — High School Teachers European Society', img: logoHistes },
  { alt: 'Microsoft', img: logoMicrosoft },
]

export const REASONS = [
  { title: 'Каждая профессия будущего связана с IT', img: reason1 },
  { title: 'Востребованность на рынке труда', img: reason2 },
  { title: 'Мир нуждается в большем количестве программистов', img: reason3 },
  { title: 'Навыки работы в команде и публичных выступлений', img: reason4 },
  { title: 'Новые инструменты для самовыражения', img: reason5 },
]

/* Иллюстрации модулей KIBERone: подбираем по словам в названии модуля */
const MOD = import.meta.glob('./assets/site/mod-*.webp', { eager: true, import: 'default' })
const mod = (name) => MOD[`./assets/site/mod-${name}.webp`]
const MODULE_IMAGES = [
  [/чат-?бот|chat-?bot/i, 'chat-bot'],
  [/python|питон/i, 'python'],
  [/scratch\s*jr|скретч\s*джуниор/i, 'scratch-jr'],
  [/scratch|скретч/i, 'scratch'],
  [/roblox|роблокс/i, 'roblox'],
  [/minecraft|майнкрафт/i, 'minecraft-education'],
  [/unity|юнити/i, 'unity'],
  [/blender|блендер/i, 'blender'],
  [/javascript|\bjs\b/i, 'javascript'],
  [/java|джава/i, 'java'],
  [/c#|си шарп/i, 'csharp'],
  [/html|css|сайт|web|веб/i, 'html'],
  [/нейросет|\bии\b|\bai\b/i, 'neyroseti'],
  [/безопасн/i, 'kiberbezopasnost'],
  [/figma|фигма|дизайн/i, 'figma'],
  [/photoshop|фотошоп/i, 'photoshop'],
  [/tinkercad|3d|3д/i, 'tinkercad'],
  [/kodu|коду/i, 'kodu'],
  [/construct|констракт/i, 'construct'],
  [/codemonkey|code monkey|кодмонки/i, 'code-monkey'],
  [/lua|луа/i, 'roblox'],
]
export function moduleImage(title = '') {
  const hit = MODULE_IMAGES.find(([re]) => re.test(title))
  return mod(hit ? hit[1] : 'intro')
}
