export class OscBank {
  constructor(audioCtx, frequency, offsets, diss) {
    this.audioCtx = audioCtx;
    this.frequency = frequency;
    this.offsets = offsets;
    this.diss = diss;
    this.partials = this.offsets.map(() => audioCtx.createOscillator());
    this.gain = audioCtx.createGain();

    offsets.forEach((offset,i) => {
      this.partials[i].frequency.value = this.frequency*Math.pow(2,offset/this.diss);
      this.partials[i].type = "triangle";
      this.partials[i].connect(this.gain);
    });
    this.gain.value= 1/(Math.pow(offsets.length,2));

  }

  connect(dest) {
    this.gain.connect(dest);
  }

  disconnect() {
    this.gain.disconnect();
  }

  start() {
    this.partials.forEach(o => o.start());
  }

  stop() {
    this.partials.forEach(o => o.stop());
  }

  linearRampToDissAtTime(diss, time = 0.) {
    this.diss = diss;
    this.partials.forEach((o,i) => {
      o.frequency.linearRampToValueAtTime(2* this.frequency * Math.exp(this.offsets[i]/diss), time);
    });
  }

   linearRampToFrequencyAtTime(frequency, time = 0.) {
    this.frequency = frequency;
    this.partials.forEach((o,i) => {
      o.frequency.linearRampToValueAtTime(2* frequency * Math.exp(this.offsets[i]/this.diss), time);
    });
  }

  env(gain, attack, decay) {
    var a = this.audioCtx.currentTime+attack;
    var d = a + decay;
    this.gain.gain.cancelScheduledValues(0);
    this.gain.gain.linearRampToValueAtTime(0., 0.001);
    this.gain.gain.linearRampToValueAtTime(gain, a);
    this.gain.gain.exponentialRampToValueAtTime(0.0001, d);
  }
}

export function unlockAudioContext(audioCtx) {
  if (audioCtx.state !== 'suspended') return;
  const b = document.body;
  const events = ['touchstart','touchend', 'mousedown','keydown'];
  events.forEach(e => b.addEventListener(e, unlock, false));
  function unlock() { audioCtx.resume().then(clean); }
  function clean() { events.forEach(e => b.removeEventListener(e, unlock)); }
}