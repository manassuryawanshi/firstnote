export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  title: string;
  content: string;
  action?: { label: string; href: string };
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // --- GENERAL THEORY ---
  {
    id: "circle_of_fifths",
    keywords: ["circle", "fifths", "key", "signature", "relative", "minor", "sharp", "flat", "theory", "transpose"],
    title: "The Circle of Fifths",
    content: "The Circle of Fifths is a visual representation of all 12 major and minor keys, arranged by perfect fifths. As you move clockwise from C major, you add one sharp to the key signature (G, D, A, E, B, F#). Moving counter-clockwise adds flats (F, Bb, Eb, Ab, Db, Gb). It is the ultimate tool for understanding relative minors, modulating between keys, and finding diatonic chords.",
    action: { label: "Explore the Circle", href: "/library" }
  },
  {
    id: "modes_overview",
    keywords: ["modes", "ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "scale"],
    title: "Understanding Modes",
    content: "Modes are simply scales derived from the Major scale by starting on a different degree. For example, playing the C Major scale but starting and ending on D gives you D Dorian. The 7 modes are Ionian (1st), Dorian (2nd), Phrygian (3rd), Lydian (4th), Mixolydian (5th), Aeolian (6th, Natural Minor), and Locrian (7th). Each mode has a distinct 'mood' or 'vibe'.",
    action: { label: "Open Modes Guide", href: "/library" }
  },
  {
    id: "lydian_mode",
    keywords: ["lydian", "mode", "4th", "dreamy", "floating", "scale", "cinematic", "sharp 4"],
    title: "The Lydian Mode",
    content: "The Lydian mode is the 4th mode of the major scale. Its formula is W-W-W-H-W-W-H. It is identical to the major scale but features a raised 4th (sharp 4). This single alteration removes the strong resolution pull of the perfect 4th, giving Lydian a dreamy, floating, and highly cinematic quality used constantly in film scoring.",
    action: { label: "View Lydian Details", href: "/library" }
  },
  {
    id: "dorian_mode",
    keywords: ["dorian", "mode", "minor", "jazz", "funky", "scale", "raised 6th"],
    title: "The Dorian Mode",
    content: "Dorian is the 2nd mode of the major scale. It is a minor-type scale but with a raised 6th. This natural 6th removes the dark, tragic sound of the natural minor scale, replacing it with a smooth, slightly melancholy but funky and jazzy vibe. It is heavily used in funk, jazz, and soul music.",
    action: { label: "View Dorian Details", href: "/library" }
  },
  {
    id: "chord_extensions",
    keywords: ["extensions", "7th", "9th", "11th", "13th", "jazz", "chords", "voicings"],
    title: "Chord Extensions (7ths, 9ths, 11ths, 13ths)",
    content: "Standard chords are built using triads (1, 3, 5). By stacking thirds beyond the octave, you create extensions. A 7th chord adds the 7th degree (1, 3, 5, 7). Adding the 9th degree creates a 9th chord, which inherently implies the 7th is also present. These extensions add deep color, tension, and 'jazziness' to your harmony.",
    action: { label: "Learn Chord Construction", href: "/library" }
  },
  {
    id: "secondary_dominants",
    keywords: ["secondary", "dominant", "jazz", "progression", "v of v", "borrowed", "tension"],
    title: "Secondary Dominants",
    content: "A secondary dominant is an altered chord used to temporarily tonicize (make sound like the home chord) a chord other than the true tonic. Usually, it is a major-minor seventh chord (V7) resolving down a perfect fifth to a diatonic chord. For example, in C major, playing an A7 to resolve to Dm. It creates immense pull and forward momentum in progressions.",
  },
  {
    id: "tritone_substitution",
    keywords: ["tritone", "substitution", "sub", "jazz", "dominant", "b5", "flat 5", "harmony"],
    title: "Tritone Substitution",
    content: "A staple of jazz harmony, tritone substitution replaces a dominant 7th chord with another dominant 7th chord located a tritone away. Since they share the same tritone interval (the 3rd and 7th swap roles), they pull to the same resolution point. For example, replacing a G7 (resolving to C) with a Db7. It creates chromatic, sliding basslines (Dm7 - Db7 - Cmaj7).",
  },
  {
    id: "borrowed_chords",
    keywords: ["borrowed", "chords", "modal", "mixture", "interchange", "minor", "major"],
    title: "Modal Interchange (Borrowed Chords)",
    content: "Modal mixture involves borrowing chords from a parallel mode. For instance, if you are in C Major, you can borrow the minor iv chord (Fm) from C Minor. This creates a bittersweet, emotional pull right before returning to the I chord. Other common borrowed chords include the flat-VI and flat-VII.",
  },
  {
    id: "neapolitan_chord",
    keywords: ["neapolitan", "chord", "classical", "flat ii", "bII", "major"],
    title: "The Neapolitan Chord",
    content: "The Neapolitan chord is a major triad built on the lowered second degree of the scale (bII). It is most commonly used in first inversion (Neapolitan 6th) and functions as a predominant, strongly pulling toward the V chord. For example, in C minor, the Neapolitan chord is Db major.",
  },
  {
    id: "time_signatures",
    keywords: ["time", "signatures", "meter", "4/4", "3/4", "7/8", "5/4", "rhythm", "odd"],
    title: "Odd Time Signatures",
    content: "While Western pop is dominated by 4/4 time (four quarter notes per bar), odd meters create complex, driving, or unsettling grooves. 5/4 (famously used in the Mission Impossible theme or Take Five) groups beats in 3+2 or 2+3. 7/8 removes half a beat from 4/4, creating an aggressive, rushing sensation.",
  },
  {
    id: "polyrhythms",
    keywords: ["polyrhythm", "rhythm", "3 over 2", "4 over 3", "cross-rhythm", "drums"],
    title: "Polyrhythms",
    content: "A polyrhythm is the simultaneous use of two or more conflicting rhythms. The most common is 3 over 2 (playing 3 evenly spaced notes in the time of 2). This creates a 'Not difficult, Not difficult' phrase feel. Advanced polyrhythms like 5 over 4 or 4 over 3 add immense texture to percussion and arpeggios.",
  },

  // --- PIANO ---
  {
    id: "piano_voicings",
    keywords: ["piano", "voicings", "drop 2", "inversions", "keyboard", "chords", "hands"],
    title: "Piano Voicings & Inversions",
    content: "On a piano, you rarely play chords simply stacked as 1-3-5-7 in one hand. 'Voicing' refers to how you distribute those notes across both hands. Common techniques include 'Drop 2' voicings (dropping the second highest note down an octave) or playing root-fifth in the left hand and the 3rd, 7th, and extensions in the right hand to prevent muddiness.",
    action: { label: "Open Piano Dictionary", href: "/piano" }
  },
  {
    id: "progression_generation",
    keywords: ["progression", "generate", "ai", "mood", "sad", "happy", "epic", "compose", "piano"],
    title: "AI Progression Generation",
    content: "Stuck staring at a blank canvas? You can use AI to generate chord progressions based on specific emotional targets. An 'Epic' progression might rely heavily on vi-IV-I-V movements, while a 'Dreamy' progression might utilize maj7 and add9 chords with Lydian interchange.",
    action: { label: "Try the Quick Generator", href: "/piano" }
  },
  {
    id: "stride_piano",
    keywords: ["stride", "piano", "jazz", "ragtime", "left hand", "technique"],
    title: "Stride Piano Technique",
    content: "Stride piano is a highly rhythmic jazz style where the left hand rapidly alternates between a low bass note (or octave) on beats 1 and 3, and a mid-range chord on beats 2 and 4. It requires high precision and turns a solo piano into a full rhythm section.",
  },

  // --- GUITAR ---
  {
    id: "alternate_tunings",
    keywords: ["guitar", "tuning", "alternate", "drop d", "dadgad", "open g", "fretboard"],
    title: "Alternate Guitar Tunings",
    content: "Standard tuning (EADGBE) is mathematically optimized for playing full barre chords across 6 strings. Alternate tunings, like Drop D (DADGBE) or DADGAD, change the interval relationships. This breaks your standard muscle memory but allows for rich, droning open strings and close voicings that are physically impossible in Standard.",
    action: { label: "Explore Guitar Tunings", href: "/guitar" }
  },
  {
    id: "signal_chain",
    keywords: ["guitar", "pedals", "signal chain", "effects", "reverb", "delay", "distortion", "pedalboard"],
    title: "Pedalboard Signal Chains",
    content: "The order of effects in a guitar signal chain drastically changes the tone. The standard rule of thumb is: Dynamics (Compressors) -> Pitch (Whammy) -> Drive (Overdrive/Fuzz) -> Modulation (Chorus/Phaser) -> Time (Delay) -> Space (Reverb) -> Amp. Placing reverb before distortion creates a massive, chaotic 'shoegaze' wall of sound.",
    action: { label: "Build a Pedalboard", href: "/guitar" }
  },
  {
    id: "cowboy_chords",
    keywords: ["guitar", "cowboy chords", "open chords", "rut", "inspiration", "fretboard"],
    title: "Breaking the Cowboy Chord Rut",
    content: "'Cowboy chords' are the standard open-position chords at the bottom of the guitar neck (C, A, G, E, D). While foundational, relying solely on them can make your playing sound generic. Using shell voicings (Root, 3rd, 7th) higher up the neck, or utilizing our AI Inspiration tool, can instantly unlock new textures.",
    action: { label: "Get Guitar Inspiration", href: "/guitar" }
  },
  {
    id: "web_audio_tuner",
    keywords: ["tune", "tuner", "guitar", "pitch", "webaudio", "microphone"],
    title: "High-Fidelity Tuning",
    content: "Tuning is the foundation of a good performance. A chromatic tuner detects the exact pitch (frequency in Hz) of your string using autocorrelation algorithms. For example, standard A is 440Hz. The MusicianSuite tuner uses zero-latency WebAudio to give you pinpoint accuracy directly in the browser.",
    action: { label: "Tune Your Guitar", href: "/guitar" }
  },
  {
    id: "caged_system",
    keywords: ["caged", "system", "guitar", "neck", "fretboard", "mapping", "chords"],
    title: "The CAGED System",
    content: "The CAGED system is a method for visualizing and mapping the guitar fretboard. It relies on the five foundational open chord shapes (C, A, G, E, and D). By using barre chords to move these shapes up the neck, you can play any chord, in any key, in five different positions across the entire fretboard.",
  },

  // --- PRODUCTION & DAW ---
  {
    id: "compression",
    keywords: ["compression", "compressor", "daw", "mix", "threshold", "ratio", "dynamics"],
    title: "Audio Compression",
    content: "A compressor reduces the dynamic range of an audio signal. When the volume exceeds a set 'Threshold', the compressor reduces the gain by a specific 'Ratio'. It makes loud parts quieter, allowing you to turn up the overall makeup gain. It's essential for gluing mixes together and making vocals sit firmly in a track.",
  },
  {
    id: "eq_techniques",
    keywords: ["eq", "equalization", "frequencies", "mix", "high pass", "low pass", "mud"],
    title: "EQ (Equalization) Techniques",
    content: "EQ is the tool used to balance frequencies. The most important technique is 'Subtractive EQ': cutting out bad frequencies rather than boosting good ones. For example, putting a High-Pass Filter (HPF) on non-bass instruments below 100Hz removes low-end 'mud' and leaves room for the kick drum and bass guitar.",
  },
  {
    id: "synthesis_subtractive",
    keywords: ["synth", "synthesis", "subtractive", "oscillator", "filter", "lfo", "envelope"],
    title: "Subtractive Synthesis",
    content: "The most common form of synthesis (like a Moog). You start with a harmonically rich waveform (like a Sawtooth or Square wave) generated by an Oscillator. Then, you 'subtract' harmonics using a Filter. Modulating the filter cutoff with an Envelope or LFO creates the dynamic 'wobbles' or 'plucks' associated with analog synths.",
  },
  {
    id: "synthesis_fm",
    keywords: ["synth", "synthesis", "fm", "frequency modulation", "dx7", "bell", "metallic"],
    title: "FM (Frequency Modulation) Synthesis",
    content: "Made famous by the Yamaha DX7, FM synthesis uses one oscillator (the Modulator) to modulate the frequency of another oscillator (the Carrier) at audio rates. This creates complex, metallic, and bell-like harmonics that are impossible to achieve with standard subtractive synthesis.",
  }
];
