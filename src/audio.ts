// 샤랄라 효과음 — Web Audio API 로 트윙클 차임 합성(에셋·라이선스 0)
// 밝은 고음 펜타토닉 + 한 옥타브 위 반짝임 배음 + 가끔 그레이스음으로 "샤랄라" 느낌
const SPARKLE_NOTES = [1046.5, 1318.5, 1568.0, 1760.0, 2093.0] // C6 E6 G6 A6 C7

export class SparkleAudio {
  private ctx: AudioContext | null = null
  muted = false
  private last = 0

  // 모바일 autoplay 정책: 첫 사용자 제스처(pointerdown)에서 호출
  resume(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  // 종소리 한 음 (사인파 + 빠른 어택 + 종 감쇠)
  private blip(freq: number, when: number, gain: number, dur: number): void {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.0001, when)
    g.gain.exponentialRampToValueAtTime(gain, when + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur)
    osc.connect(g).connect(this.ctx.destination)
    osc.start(when)
    osc.stop(when + dur + 0.02)
  }

  sparkle(): void {
    if (this.muted || !this.ctx) return
    const now = this.ctx.currentTime
    if (now - this.last < 0.06) return
    this.last = now
    const base = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)]
    this.blip(base, now, 0.1, 0.32)               // 메인 종소리
    this.blip(base * 2, now + 0.004, 0.045, 0.28) // 한 옥타브 위 반짝임
    if (Math.random() < 0.55) this.blip(base * 1.5, now + 0.07, 0.06, 0.22) // 또르륵 그레이스음
  }
}
