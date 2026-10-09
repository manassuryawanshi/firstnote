import { Note, Interval, Chord } from "@tonaljs/tonal";

export interface GuitarChordShape {
  frets: (number | -1)[]; // -1 is muted (X), 0 is open (O), 1..24 is fret
  fingers?: (number | null)[]; // 1: Index, 2: Middle, 3: Ring, 4: Pinky
  baseFret?: number; // 1 means nut is at top. If > 1, first fret shown is baseFret.
  barres?: number[];
}

// Comprehensive dictionary of common open & standard guitar chord fingerings (6 strings: E2, A2, D3, G3, B3, E4)
const COMMON_GUITAR_SHAPES: Record<string, GuitarChordShape> = {
  // Majors
  "C": { frets: [-1, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
  "D": { frets: [-1, -1, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  "E": { frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
  "F": { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barres: [1] },
  "G": { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
  "A": { frets: [-1, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  "B": { frets: [-1, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], baseFret: 2, barres: [2] },

  // Minors
  "Cm": { frets: [-1, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], baseFret: 3, barres: [3] },
  "Dm": { frets: [-1, -1, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
  "Em": { frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  "Fm": { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1, barres: [1] },
  "Gm": { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barres: [3] },
  "Am": { frets: [-1, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
  "Bm": { frets: [-1, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], baseFret: 2, barres: [2] },

  // 7ths
  "C7": { frets: [-1, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], baseFret: 1 },
  "D7": { frets: [-1, -1, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
  "E7": { frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },
  "F7": { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1, barres: [1] },
  "G7": { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
  "A7": { frets: [-1, 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], baseFret: 1 },
  "B7": { frets: [-1, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], baseFret: 1 },

  // Minor 7ths
  "Am7": { frets: [-1, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], baseFret: 1 },
  "Dm7": { frets: [-1, -1, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], baseFret: 1, barres: [1] },
  "Em7": { frets: [0, 2, 0, 0, 0, 0], fingers: [null, 1, null, null, null, null], baseFret: 1 },
  "Bm7": { frets: [-1, 2, 4, 2, 3, 2], fingers: [null, 1, 3, 1, 2, 1], baseFret: 2, barres: [2] },
  "F#m7": { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], baseFret: 2, barres: [2] },

  // Major 7ths
  "Cmaj7": { frets: [-1, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], baseFret: 1 },
  "Dmaj7": { frets: [-1, -1, 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  "Fmaj7": { frets: [-1, -1, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], baseFret: 1 },
  "Gmaj7": { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
  "Amaj7": { frets: [-1, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], baseFret: 1 },

  // Suspended & Add
  "Dsus2": { frets: [-1, -1, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  "Dsus4": { frets: [-1, -1, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  "Asus2": { frets: [-1, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], baseFret: 1 },
  "Asus4": { frets: [-1, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  "Gsus4": { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, null, null, 1, 4], baseFret: 1 },
  "Cadd9": { frets: [-1, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], baseFret: 1 },
  "Aadd9": { frets: [-1, 0, 2, 4, 2, 0], fingers: [null, null, 1, 3, 2, null], baseFret: 1 },
  "Em9": { frets: [0, 2, 0, 0, 0, 2], fingers: [null, 1, null, null, null, 2], baseFret: 1 },
  "Esus4": { frets: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], baseFret: 1 },
  "F#": { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], baseFret: 2, barres: [2] },
  "F#m": { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], baseFret: 2, barres: [2] },
  "F#7": { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], baseFret: 2, barres: [2] },
  "C#": { frets: [-1, 4, 6, 6, 6, 4], fingers: [null, 1, 2, 3, 4, 1], baseFret: 4, barres: [4] },
  "Db": { frets: [-1, 4, 6, 6, 6, 4], fingers: [null, 1, 2, 3, 4, 1], baseFret: 4, barres: [4] },
  "C#m": { frets: [-1, 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], baseFret: 4, barres: [4] },
  "G#": { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barres: [4] },
  "G#m": { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, barres: [4] },
  "Ab": { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barres: [4] },
  "Abm": { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], baseFret: 4, barres: [4] },
  "Eb": { frets: [-1, 6, 8, 8, 8, 6], fingers: [null, 1, 2, 3, 4, 1], baseFret: 6, barres: [6] },
  "Ebm": { frets: [-1, 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], baseFret: 6, barres: [6] },
  "D#m": { frets: [-1, 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], baseFret: 6, barres: [6] },
  "Bb": { frets: [-1, 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], baseFret: 1, barres: [1] },
  "Bbm": { frets: [-1, 1, 3, 3, 2, 1], fingers: [null, 1, 3, 4, 2, 1], baseFret: 1, barres: [1] },
  // Common Slash Chords
  "D/F#": { frets: [2, 0, 0, 2, 3, 2], fingers: [1, null, null, 2, 4, 3], baseFret: 1 },
  "C/G": { frets: [3, 3, 2, 0, 1, 0], fingers: [3, 4, 2, null, 1, null], baseFret: 1 },
  "G/B": { frets: [-1, 2, 0, 0, 0, 3], fingers: [null, 1, null, null, null, 2], baseFret: 1 },
  "Am/G": { frets: [3, 0, 2, 2, 1, 0], fingers: [4, null, 2, 3, 1, null], baseFret: 1 },
  "F/A": { frets: [-1, 0, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], baseFret: 1 },
};

// Root semitone offsets from E (string 6) and A (string 5)
const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"
};

function normalizeRoot(note: string): string {
  return FLAT_TO_SHARP[note] || note;
}

/**
 * Procedurally generate a guitar shape for any chord using standard Barre (E-shape or A-shape)
 */
export function getGuitarChordShape(chordName: string): GuitarChordShape {
  // 1. Direct dictionary match
  const cleanName = chordName.replace(/maj$/, "").replace(/\s+/g, "");
  if (COMMON_GUITAR_SHAPES[cleanName]) {
    return COMMON_GUITAR_SHAPES[cleanName];
  }

  // Parse root and quality
  const match = cleanName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) {
    return { frets: [-1, -1, -1, -1, -1, -1], baseFret: 1 };
  }

  const root = normalizeRoot(match[1]);
  const quality = match[2].toLowerCase();

  // Find root on 6th string (E = 0)
  const eIndex = CHROMATIC_NOTES.indexOf("E");
  const targetIndex = CHROMATIC_NOTES.indexOf(root);
  const fret6 = (targetIndex - eIndex + 12) % 12;

  // Find root on 5th string (A = 0)
  const aIndex = CHROMATIC_NOTES.indexOf("A");
  const fret5 = (targetIndex - aIndex + 12) % 12;

  // Decide whether to use E-shape (string 6) or A-shape (string 5)
  const isMinor = quality.includes("m") && !quality.includes("maj");
  const is7th = quality.includes("7") && !quality.includes("maj7");
  const isMaj7 = quality.includes("maj7");

  if (fret6 > 0 && fret6 <= 7) {
    // E-shape barre chord on fret6
    const baseFret = fret6;
    if (isMinor) {
      return {
        frets: [baseFret, baseFret + 2, baseFret + 2, baseFret, baseFret, baseFret],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret,
        barres: [baseFret]
      };
    } else if (is7th) {
      return {
        frets: [baseFret, baseFret + 2, baseFret, baseFret + 1, baseFret, baseFret],
        fingers: [1, 3, 1, 2, 1, 1],
        baseFret,
        barres: [baseFret]
      };
    } else {
      return {
        frets: [baseFret, baseFret + 2, baseFret + 2, baseFret + 1, baseFret, baseFret],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret,
        barres: [baseFret]
      };
    }
  }

  // A-shape barre chord on fret5
  const baseFret = fret5 === 0 ? 12 : fret5;
  if (isMinor) {
    return {
      frets: [-1, baseFret, baseFret + 2, baseFret + 2, baseFret + 1, baseFret],
      fingers: [null, 1, 3, 4, 2, 1],
      baseFret,
      barres: [baseFret]
    };
  } else if (is7th) {
    return {
      frets: [-1, baseFret, baseFret + 2, baseFret, baseFret + 2, baseFret],
      fingers: [null, 1, 3, 1, 4, 1],
      baseFret,
      barres: [baseFret]
    };
  } else {
    return {
      frets: [-1, baseFret, baseFret + 2, baseFret + 2, baseFret + 2, baseFret],
      fingers: [null, 1, 2, 3, 4, 1],
      baseFret,
      barres: [baseFret]
    };
  }
}

/**
 * Transpose a chord by N semitones (positive or negative)
 */
export function transposeChord(chordName: string, semitones: number): string {
  if (semitones === 0) return chordName;

  // Handle slash chords like C/E or G/B
  const slashParts = chordName.split("/");
  const mainChord = slashParts[0];
  const bass = slashParts[1];

  const match = mainChord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordName;
  const root = match[1];
  const quality = match[2];

  const interval = Interval.fromSemitones(semitones);
  const newRoot = Note.simplify(Note.transpose(root, interval));

  let newBass = "";
  if (bass) {
    const bassMatch = bass.match(/^([A-G][#b]?)$/);
    if (bassMatch) {
      newBass = "/" + Note.simplify(Note.transpose(bassMatch[1], interval));
    } else {
      newBass = "/" + bass;
    }
  }

  return newRoot + quality + newBass;
}

/**
 * Transpose all [ch]...[/ch] tags inside an entire text block
 */
export function transposeChordSheet(content: string, semitones: number): string {
  if (semitones === 0) return content;
  return content.replace(/\[ch\](.*?)\[\/ch\]/g, (match, chord) => {
    return `[ch]${transposeChord(chord.trim(), semitones)}[/ch]`;
  });
}

/**
 * Extract notes for piano keyboard display and Tone.js playback
 */
export function getChordPianoNotes(chordName: string): string[] {
  // Clean slash chord base
  const main = chordName.split("/")[0].trim();
  const chordInfo = Chord.get(main);
  
  if (!chordInfo || !chordInfo.notes || chordInfo.notes.length === 0) {
    // Fallback: try root
    const root = main.match(/^([A-G][#b]?)/)?.[1] || "C";
    return [`${root}4`];
  }

  // Map notes into octave 4 (or 3/4 spread)
  return chordInfo.notes.map((n, idx) => {
    const simplified = Note.simplify(n);
    const octave = idx === 0 ? 3 : 4;
    return `${simplified}${octave}`;
  });
}

const GUITAR_STRING_TUNINGS = ["E2", "A2", "D3", "G3", "B3", "E4"];

/**
 * Extract realistic guitar voicing note pitches from the guitar chord shape
 */
export function getChordGuitarNotes(chordName: string): string[] {
  const shape = getGuitarChordShape(chordName);
  const notes: string[] = [];

  if (shape && shape.frets) {
    shape.frets.forEach((fret, stringIdx) => {
      if (fret >= 0 && stringIdx < GUITAR_STRING_TUNINGS.length) {
        const baseNote = GUITAR_STRING_TUNINGS[stringIdx];
        const pitchedNote = Note.simplify(Note.transpose(baseNote, Interval.fromSemitones(fret)));
        notes.push(pitchedNote);
      }
    });
  }

  // Fallback if frets couldn't be parsed
  if (notes.length === 0) {
    const pianoNotes = getChordPianoNotes(chordName);
    return pianoNotes.map(n => {
      const match = n.match(/^([A-G][#b]?)(\d)$/);
      if (match) {
        const oct = Math.max(2, parseInt(match[2]) - 1);
        return `${match[1]}${oct}`;
      }
      return n;
    });
  }

  return notes;
}

/**
 * Parse any raw chord string into normalized root and valid qualities for Piano & Guitar
 */
export function parseChordToRootAndQuality(chordName: string): {
  root: string;
  rawQuality: string;
  pianoQuality: string;
  guitarQuality: string;
} {
  const clean = chordName.split("/")[0].trim().replace(/\b(chord|chords)\b/gi, "").trim();
  const match = clean.match(/^([A-G][#b]?)(.*)$/);
  
  if (!match) {
    return { root: "C", rawQuality: "maj", pianoQuality: "maj", guitarQuality: "maj" };
  }

  let root = match[1];
  // Normalize to standard 12 roots: C, C#, D, Eb, E, F, F#, G, G#, A, Bb, B
  const rootMap: Record<string, string> = {
    "Db": "C#", "D#": "Eb", "Gb": "F#", "Ab": "G#", "A#": "Bb"
  };
  if (rootMap[root]) {
    root = rootMap[root];
  }

  const raw = match[2].trim().toLowerCase();
  let pianoQuality = "maj";
  let guitarQuality = "maj";

  if (raw === "m" || raw === "min" || raw === "minor" || raw === "-") {
    pianoQuality = "minor";
    guitarQuality = "minor";
  } else if (raw === "maj7" || raw === "m7+" || raw === "delta" || raw === "major7") {
    pianoQuality = "maj7";
    guitarQuality = "maj7";
  } else if (raw === "m7" || raw === "min7" || raw === "-7" || raw === "minor7") {
    pianoQuality = "m7";
    guitarQuality = "m7";
  } else if (raw === "7" || raw === "dom7" || raw === "dominant7") {
    pianoQuality = "7";
    guitarQuality = "7";
  } else if (raw === "dim" || raw === "dim7" || raw === "°") {
    pianoQuality = "dim";
    guitarQuality = "dim";
  } else if (raw === "aug" || raw === "+") {
    pianoQuality = "aug";
    guitarQuality = "maj";
  } else if (raw === "sus2") {
    pianoQuality = "sus2";
    guitarQuality = "maj";
  } else if (raw === "sus4" || raw === "sus") {
    pianoQuality = "sus4";
    guitarQuality = "maj";
  } else if (raw === "m7b5" || raw === "ø") {
    pianoQuality = "m7b5";
    guitarQuality = "minor";
  } else if (raw === "maj9") {
    pianoQuality = "maj9";
    guitarQuality = "maj7";
  } else if (raw === "m9") {
    pianoQuality = "m9";
    guitarQuality = "m7";
  } else if (raw === "9") {
    pianoQuality = "9";
    guitarQuality = "7";
  }

  return { root, rawQuality: raw || "maj", pianoQuality, guitarQuality };
}
