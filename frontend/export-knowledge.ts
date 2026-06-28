import { COURSE_DATA } from './src/lib/course-data';
import * as fs from 'fs';
import * as path from 'path';

const TOOLS_DATA = [
  {id: "piano_sandbox", title: "Piano Sandbox", subtitle: "Interactive progression builder", category: "Projects", href: "/piano#sandbox-tool", icon: "piano", color: "bg-emerald-500/10", keywords: ["piano", "keyboard", "sandbox", "progression", "chords"]},
  {id: "guitar_tuner", title: "Guitar Tuner", subtitle: "Live chromatic analyzer", category: "Projects", href: "/guitar#tuner-tool", icon: "guitar", color: "bg-fuchsia-500/10", keywords: ["guitar", "tune", "tuner", "pitch", "mic", "microphone"]},
  {id: "scale_dict", title: "Scale Dictionary", subtitle: "Explore modes and formulas", category: "Projects", href: "/theory#scale-dictionary", icon: "book", color: "bg-cyan-500/10", keywords: ["scale", "dictionary", "theory", "mode", "ionian", "dorian"]},
  {id: "chord_finder", title: "Chord Finder", subtitle: "Reverse search by notes", category: "Projects", href: "/piano#chord-finder", icon: "music", color: "bg-emerald-500/10", keywords: ["chord", "find", "reverse", "lookup", "identify"]}
];

const knowledge = {
  tools: TOOLS_DATA,
  course: COURSE_DATA
};

const outputPath = path.resolve(__dirname, '../backend/app/knowledge.json');
fs.writeFileSync(outputPath, JSON.stringify(knowledge, null, 2));
console.log(`Knowledge base exported to ${outputPath}`);
