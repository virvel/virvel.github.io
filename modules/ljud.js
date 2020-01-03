export class OscBank {
  constructor(audioCtx, frequency, offsets, diss = 250) {
    this.frequency = frequency;
    this.offsets = offsets;
    this.diss = diss;
    this.partials = this.offsets.map(() => audioCtx.createOscillator());
    this.gain = audioCtx.createGain();

    offsets.forEach((offset,i) => {
      this.partials[i].frequency.value = this.frequency*Math.pow(2,offset/this.diss);
      this.partials[i].connect(this.gain);
    });
    this.gain.value= 1/offsets.length;

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

  setDissAtTime(diss, time = 0.) {
    this.partials.forEach((o, i) => {
      o.frequency.setValueAtTime(this.frequency*Math.pow(2,this.offsets[i]/diss), time);
    });
  }

      exponentialRampToDissAtTime(diss, time = 0.) {
    this.partials.forEach((o,i) => {
      o.frequency.exponentialRampToValueAtTime(this.frequency*Math.pow(2,this.offsets[i]/diss), time);
    });
  }

  setFrequencyAtTime(frequency, time = 0.) {
    this.partials.forEach((o, i) => {
      o.frequency.setValueAtTime(frequency*Math.pow(2,this.offsets[i]/this.diss), time);
    });
  }
   linearRampToFrequencyAtTime(frequency, time = 0.) {
    this.partials.forEach((o,i) => {
      o.frequency.linearRampToValueAtTime(frequency*Math.pow(2,this.offsets[i]/this.diss), time);
    });
  }
    exponentialRampToFrequencyAtTime(frequency, time = 0.) {
    this.partials.forEach((o,i) => {
      o.frequency.exponentialRampToValueAtTime(frequency*Math.pow(2,this.offsets[i]/this.diss), time);
    });
  }

  printFreqs() {
    this.partials.forEach(x => console.log(x.frequency.value));
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