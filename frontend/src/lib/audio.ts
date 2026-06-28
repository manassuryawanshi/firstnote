import * as Tone from "tone";

export const getGrandPianoSampler = (onLoad?: () => void) => {
  const SALAMANDER_BASE = "https://tonejs.github.io/audio/salamander/";
  const sampler = new Tone.Sampler({
    urls: {
      A0: SALAMANDER_BASE + "A0.mp3",
      C1: SALAMANDER_BASE + "C1.mp3",
      "D#1": SALAMANDER_BASE + "Ds1.mp3",
      "F#1": SALAMANDER_BASE + "Fs1.mp3",
      A1: SALAMANDER_BASE + "A1.mp3",
      C2: SALAMANDER_BASE + "C2.mp3",
      "D#2": SALAMANDER_BASE + "Ds2.mp3",
      "F#2": SALAMANDER_BASE + "Fs2.mp3",
      A2: SALAMANDER_BASE + "A2.mp3",
      C3: SALAMANDER_BASE + "C3.mp3",
      "D#3": SALAMANDER_BASE + "Ds3.mp3",
      "F#3": SALAMANDER_BASE + "Fs3.mp3",
      A3: SALAMANDER_BASE + "A3.mp3",
      C4: SALAMANDER_BASE + "C4.mp3",
      "D#4": SALAMANDER_BASE + "Ds4.mp3",
      "F#4": SALAMANDER_BASE + "Fs4.mp3",
      A4: SALAMANDER_BASE + "A4.mp3",
      C5: SALAMANDER_BASE + "C5.mp3",
      "D#5": SALAMANDER_BASE + "Ds5.mp3",
      "F#5": SALAMANDER_BASE + "Fs5.mp3",
      A5: SALAMANDER_BASE + "A5.mp3",
      C6: SALAMANDER_BASE + "C6.mp3",
      "D#6": SALAMANDER_BASE + "Ds6.mp3",
      "F#6": SALAMANDER_BASE + "Fs6.mp3",
      A6: SALAMANDER_BASE + "A6.mp3",
      C7: SALAMANDER_BASE + "C7.mp3",
      "D#7": SALAMANDER_BASE + "Ds7.mp3",
      "F#7": SALAMANDER_BASE + "Fs7.mp3",
      A7: SALAMANDER_BASE + "A7.mp3",
      C8: SALAMANDER_BASE + "C8.mp3"
    },
    onload: onLoad
  }).toDestination();
  
  sampler.volume.value = -2; // slightly louder piano
  return sampler;
};
