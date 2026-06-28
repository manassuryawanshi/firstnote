import { NextResponse } from 'next/server';
import { KNOWLEDGE_BASE } from '@/lib/knowledge-base';
import { Key, Chord } from '@tonaljs/tonal';

// Hybrid Agent: Combines procedural math generation with semantic search

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ 
        answer: "Please ask a question about music theory, chords, or instruments.",
        action: null 
      });
    }

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const lowercaseQuery = query.toLowerCase();

    // -------------------------------------------------------------
    // PROCEDURAL ENGINE: CHORD PROGRESSIONS
    // -------------------------------------------------------------
    const progressionMatch = lowercaseQuery.match(/\b([a-g][#b]?)\s*(major|minor|maj|min|m)\b.*(?:progression|chords)|(?:progression|chords|make|build|play).*(?:in|for)?\s+([a-g][#b]?)\s*(major|minor|maj|min|m)\b/);
    if (progressionMatch) {
       const root = (progressionMatch[1] || progressionMatch[3]).toUpperCase();
       const rawType = progressionMatch[2] || progressionMatch[4];
       const isMinor = ['minor', 'min', 'm'].includes(rawType);
       const type = isMinor ? 'minor' : 'major';
       
       let chords: readonly string[] = [];
       if (type === 'major') {
          chords = Key.majorKey(root).chords;
       } else {
          chords = Key.minorKey(root).natural.chords;
       }

       if (chords && chords.length > 0) {
          const isGuitar = lowercaseQuery.includes('guitar');
          const instrument = isGuitar ? 'Guitar' : 'Piano';
          const href = isGuitar ? '/guitar' : '/piano';
          
          const answer = `To make a ${root} ${type} chord progression, you can use its diatonic chords: ${chords.join(', ')}. Try a classic pop progression like I-V-vi-IV, which translates to ${chords[0]} - ${chords[4]} - ${chords[5]} - ${chords[3]}!`;
          return NextResponse.json({
             answer,
             action: { label: `Play these on ${instrument}`, href }
          });
       }
    }

    // -------------------------------------------------------------
    // PROCEDURAL ENGINE: CHORD SPELLING / "HOW TO PLAY"
    // -------------------------------------------------------------
    const chordRegex = /\b(?:play|notes in|what is|how to play)\s+([a-g][#b]?(?:m|maj|min|dim|aug|sus|7|9|11|13)*\d*)\b|\b([a-g][#b]?(?:m|maj|min|dim|aug|sus|7|9|11|13)*\d*)\s+chord\b/;
    const chordMatch = lowercaseQuery.match(chordRegex);
    
    if (chordMatch) {
       let rawChord = chordMatch[1] || chordMatch[2];
       // prevent matching english words 'a', 'am' unless they specifically say 'a chord'
       if (rawChord === 'a' || rawChord === 'am' || rawChord === 'be') {
          if (!lowercaseQuery.includes('chord')) {
             rawChord = '';
          }
       }

       if (rawChord) {
          const formattedChord = rawChord.charAt(0).toUpperCase() + rawChord.slice(1);
          const chordData = Chord.get(formattedChord);
          
          if (!chordData.empty) {
             const notes = chordData.notes;
             const isGuitar = lowercaseQuery.includes('guitar');
             const instrument = isGuitar ? 'Guitar' : 'Piano';
             const href = isGuitar ? '/guitar' : '/piano';

             const answer = `To play the ${formattedChord} chord, you need the notes: ${notes.join(', ')}. It is built using the intervals: ${chordData.intervals.join(', ')}.`;
             return NextResponse.json({
                answer,
                action: { label: `Learn ${formattedChord} on ${instrument}`, href }
             });
          }
       }
    }


    // -------------------------------------------------------------
    // STATIC ENGINE: SEMANTIC KNOWLEDGE BASE SEARCH
    // Fallback if no procedural match is triggered
    // -------------------------------------------------------------
    const queryTokens = lowercaseQuery.replace(/[^\w\s]/gi, '').split(' ').filter((t: string) => t.length > 2);

    const scoredEntries = KNOWLEDGE_BASE.map(entry => {
      let score = 0;
      
      if (entry.title.toLowerCase().includes(lowercaseQuery)) {
         score += 10;
      }

      entry.keywords.forEach(keyword => {
        if (queryTokens.includes(keyword.toLowerCase())) {
          score += 3;
        } else if (lowercaseQuery.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      return { ...entry, score };
    });

    scoredEntries.sort((a, b) => b.score - a.score);
    const topMatch = scoredEntries[0];

    if (topMatch && topMatch.score > 0) {
       const intros = [
          "I can help with that! ",
          "That's a great question. ",
          "Here's what you need to know about that: ",
          ""
       ];
       const randomIntro = intros[Math.floor(Math.random() * intros.length)];
       
       return NextResponse.json({
          answer: randomIntro + topMatch.content,
          action: topMatch.action
       });
    }

    // Ultimate Fallback
    return NextResponse.json({
      answer: "I don't have specific knowledge on that exact topic yet, but I can dynamically calculate progressions and chords! Try asking 'What notes are in a Cmaj9 chord?' or 'Give me a progression in D minor'.",
      action: { label: "Explore the Library", href: "/library" }
    });

  } catch (error) {
    return NextResponse.json(
      { answer: "My neural pathways got crossed. Try asking that again!" },
      { status: 500 }
    );
  }
}
