import './style.css'
import { registerSW } from 'virtual:pwa-register'
import { setupLayers, clearPaint, resize } from './canvas/layers'
import { createState } from './state'
import { attachPainter } from './canvas/painter'
import { showOutline } from './canvas/outline'
import { getTemplate } from './templates'
import { History } from './canvas/history'
import { saveImage } from './canvas/save'
import { buildPicker } from './ui/picker'
import { buildPalette } from './ui/palette'
import { buildToolbar } from './ui/toolbar'
import { SparkleAudio } from './audio'
import { initDocumentChrome } from './i18n'

const $ = (id: string): HTMLElement => {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} 없음`)
  return el
}

const layers = setupLayers()
const state = createState()
const audio = new SparkleAudio()
const history = new History(layers)

attachPainter(layers, state, {
  onStrokeStart: () => {
    audio.resume()
    history.push()
  },
  onPaintAt: () => audio.sparkle()
})

// 문서 chrome(탭 제목·html lang·팔레트 aria) 다국어 초기화
initDocumentChrome($('palette'))

buildPalette($('palette'), (color) => {
  state.color = color
})

const picker = buildPicker($('picker'), (id) => {
  const t = getTemplate(id)
  if (!t) return
  state.templateId = id
  showOutline(layers, t)
})

buildToolbar(
  $('toolbar'),
  $('palette'),
  state,
  {
    openPicker: picker.open,
    undo: () => history.undo(),
    clearAll: () => {
      history.push() // 전체 지우기도 되돌리기 가능
      clearPaint(layers)
    },
    save: () => saveImage(layers, state.templateId),
    onSymmetry: (on) => $('axis').classList.toggle('on', on)
  },
  audio
)

// 팔레트·툴바가 DOM 에 모두 들어간 뒤 캔버스를 최종 stage 크기에 재동기화 (초기 프레임 좌표 어긋남 방지)
resize(layers)

// 색칠 중 핀치 확대·롱프레스 메뉴 차단 (유아 오작동 방지). 스크롤은 CSS touch-action/overscroll 로 차단.
;(['gesturestart', 'gesturechange', 'gestureend'] as string[]).forEach((ev) =>
  document.addEventListener(ev, (e) => e.preventDefault())
)
document.addEventListener('contextmenu', (e) => e.preventDefault())

// PWA 서비스워커 등록 — 앱 셸·도안 precache로 오프라인 동작 + 자동 업데이트
registerSW({ immediate: true })
