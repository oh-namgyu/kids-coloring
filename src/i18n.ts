// 다국어 — UI chrome + 카테고리/도안 이름. 기본 언어는 브라우저 설정에서 추론(ko 외엔 en).
// 도안/카테고리 원본 이름(templates.ts)은 한국어로 유지하고, en 만 여기서 매핑한다(단일 SoT 보존).

export type Lang = 'en' | 'ko'

const MESSAGES: Record<Lang, Record<string, string>> = {
  ko: {
    title: '색칠 놀이 🎨',
    pickColor: '색깔 고르기',
    pick: '그림 고르기',
    eraser: '지우개',
    undo: '되돌리기',
    mirror: '데칼코마니(대칭)',
    size: '굵기',
    clearAll: '전체 지우기',
    clearConfirm: '그림을 모두 지울까요?',
    save: '저장',
    sound: '소리 켜기/끄기',
    close: '닫기',
    language: '언어',
    pen_pastel: '파스텔',
    pen_pearl: '펄',
    pen_rainbow: '무지개'
  },
  en: {
    title: 'Coloring 🎨',
    pickColor: 'Pick a color',
    pick: 'Pick a picture',
    eraser: 'Eraser',
    undo: 'Undo',
    mirror: 'Decalcomania (mirror)',
    size: 'Brush size',
    clearAll: 'Clear all',
    clearConfirm: 'Clear the whole picture?',
    save: 'Save',
    sound: 'Sound on/off',
    close: 'Close',
    language: 'Language',
    pen_pastel: 'Pastel',
    pen_pearl: 'Pearl',
    pen_rainbow: 'Rainbow'
  }
}

const CAT_EN: Record<string, string> = {
  animal: 'Animals',
  princess: 'Princess & Fairy',
  dress: 'Dresses',
  food: 'Food',
  plant: 'Plants & Nature',
  thing: 'Shapes & Vehicles'
}

const TPL_EN: Record<string, string> = {
  // animals
  cat: 'Cat', dog: 'Dog', bear: 'Bear', rabbit: 'Rabbit', duck: 'Duck', fish: 'Fish',
  butterfly: 'Butterfly', lion: 'Lion', elephant: 'Elephant', panda: 'Panda', penguin: 'Penguin',
  owl: 'Owl', frog: 'Frog', pig: 'Pig', giraffe: 'Giraffe', turtle: 'Turtle', monkey: 'Monkey',
  // princess & fairy
  princess_fairy: 'Fairy Princess', tiara: 'Tiara', princess_crown: 'Princess Crown', crown: 'Crown',
  wand: 'Magic Wand', slipper: 'Glass Slipper', heart_fairy: 'Heart Fairy', star_fairy: 'Star Fairy',
  flower_fairy: 'Flower Fairy', moon: 'Moon Fairy', ribbon: 'Ribbon', castle: 'Castle', gem: 'Gem',
  mirror: 'Hand Mirror', perfume: 'Perfume', unicorn: 'Unicorn', butterfly_fairy: 'Butterfly Fairy',
  rainbow_cloud: 'Rainbow',
  // dresses
  dress: 'Dress', ballgown: 'Ball Gown', aline_dress: 'A-line Dress', mermaid_dress: 'Mermaid Dress',
  tutu_dress: 'Tutu', polka_dress: 'Polka Dots', heart_dress: 'Heart Dress', star_dress: 'Star Dress',
  flower_dress: 'Flower Dress', bow_dress: 'Bow Dress', layered_dress: 'Layered Dress',
  // food
  grape: 'Grapes', strawberry: 'Strawberry', banana: 'Banana', watermelon: 'Watermelon',
  icecream: 'Ice Cream', cupcake: 'Cupcake', cake: 'Cake', pizza: 'Pizza', burger: 'Burger',
  donut: 'Donut', hotdog: 'Hot Dog', cookie: 'Cookie', lollipop: 'Lollipop', candy: 'Candy',
  pancake: 'Pancake', fried_egg: 'Fried Egg', cherry: 'Cherry',
  // plants & nature
  sun: 'Sun', cloud: 'Cloud', tree: 'Tree', flower: 'Flower', cactus: 'Cactus', mushroom: 'Mushroom',
  tulip: 'Tulip', rose: 'Rose', palm_tree: 'Palm Tree', pine_tree: 'Pine Tree',
  potted_plant: 'Potted Plant', clover: 'Clover', maple: 'Maple Leaf', sunflower: 'Sunflower',
  // shapes & vehicles
  heart: 'Heart', star: 'Star', house: 'House', car: 'Car', boat: 'Boat', rocket: 'Rocket',
  balloon: 'Balloon'
}

let lang: Lang = ((): Lang => {
  const saved = localStorage.getItem('lang')
  if (saved === 'en' || saved === 'ko') return saved
  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
})()

const listeners = new Set<() => void>()

export function getLang(): Lang {
  return lang
}

export function setLang(next: Lang): void {
  if (next === lang) return
  lang = next
  localStorage.setItem('lang', next)
  document.documentElement.lang = next
  listeners.forEach((fn) => fn())
}

export function toggleLang(): void {
  setLang(lang === 'ko' ? 'en' : 'ko')
}

export function onLangChange(fn: () => void): void {
  listeners.add(fn)
}

export function t(key: string): string {
  return MESSAGES[lang][key] ?? MESSAGES.en[key] ?? key
}

// 카테고리/도안 이름: ko 는 원본(한국어), en 은 매핑(없으면 원본 fallback).
export function tCat(id: string, ko: string): string {
  return lang === 'ko' ? ko : CAT_EN[id] ?? ko
}

export function tTpl(id: string, ko: string): string {
  return lang === 'ko' ? ko : TPL_EN[id] ?? ko
}

// 번역 바인딩 — 언어 변경 시 자동 갱신(공통 헬퍼로 중복 제거).
export function bindTitle(node: HTMLElement, key: string): void {
  const set = (): void => {
    node.title = t(key)
  }
  set()
  onLangChange(set)
}

export function bindText(node: HTMLElement, get: () => string): void {
  const set = (): void => {
    node.textContent = get()
  }
  set()
  onLangChange(set)
}

// 문서 chrome(탭 제목·html lang·팔레트 aria) 초기화 + 언어 변경 반영.
export function initDocumentChrome(palette: HTMLElement): void {
  const apply = (): void => {
    document.documentElement.lang = lang
    document.title = t('title')
    palette.setAttribute('aria-label', t('pickColor'))
  }
  apply()
  onLangChange(apply)
}
