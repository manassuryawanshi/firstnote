import { KNOWLEDGE_BASE } from "./knowledge-base";
import courseData from "./course-knowledge.json";
import { Chord, Note } from "@tonaljs/tonal";

import { parseChordToRootAndQuality } from "./chords";

export interface TheorySearchResult {
  type: "tool" | "theory" | "course" | "chord";
  title: string;
  subtitle: string;
  category: string;
  href: string;
  pianoHref?: string;
  guitarHref?: string;
  parsedRoot?: string;
  parsedQuality?: string;
  icon: "piano" | "guitar" | "book" | "music" | "sparkles" | "search";
  color: string;
  snippetHtml?: string;
}

function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

function extractSnippet(text: string, query: string, radius = 50): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) {
    return text.slice(0, radius * 2) + "...";
  }

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  let snippet = text.slice(start, end);

  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return snippet.replace(regex, `<span class="bg-cyan-500/30 text-cyan-200 font-bold px-1 rounded">$1</span>`);
}

export function searchTheoryAndConcepts(rawQuery: string): TheorySearchResult[] {
  const query = rawQuery.trim();
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  const results: { item: TheorySearchResult; score: number }[] = [];

  // 1. DIRECT CHORD DETECTION VIA TONAL
  const cleanChordName = query.replace(/\b(chord|chords)\b/gi, "").trim();
  const parsedChord = Chord.get(cleanChordName || query);
  if (!parsedChord.empty && parsedChord.name) {
    const parsedInfo = parseChordToRootAndQuality(parsedChord.symbol || cleanChordName || query);
    const pianoHref = `/piano?root=${encodeURIComponent(parsedInfo.root)}&quality=${encodeURIComponent(parsedInfo.pianoQuality)}#dictionary`;
    const guitarHref = `/guitar?root=${encodeURIComponent(parsedInfo.root)}&quality=${encodeURIComponent(parsedInfo.guitarQuality)}#fretboard`;

    results.push({
      item: {
        type: "chord",
        title: `${parsedChord.symbol || parsedChord.name} Chord`,
        subtitle: `${parsedChord.name} • Notes: ${parsedChord.notes.join(" - ")}`,
        category: "Chord Theory",
        href: pianoHref,
        pianoHref,
        guitarHref,
        parsedRoot: parsedInfo.root,
        parsedQuality: parsedInfo.pianoQuality,
        icon: "music",
        color: "bg-amber-500/10",
        snippetHtml: `Notes: <strong>${parsedChord.notes.join(" · ")}</strong> | Intervals: ${parsedChord.intervals.join(" · ")}`
      },
      score: 100 // Highest priority if exact chord match
    });
  }

  // 2. TOOLS
  for (const tool of (courseData.tools || [])) {
    const titleMatch = tool.title.toLowerCase().includes(lowerQuery);
    const kwMatch = tool.keywords?.some((k: string) => k.toLowerCase().includes(lowerQuery));
    const subMatch = tool.subtitle?.toLowerCase().includes(lowerQuery);

    if (titleMatch || kwMatch || subMatch) {
      let score = 50;
      if (titleMatch) score += 30;
      if (kwMatch) score += 20;

      results.push({
        item: {
          type: "tool",
          title: tool.title,
          subtitle: tool.subtitle || "Interactive Tool",
          category: "Chordyn Tools",
          href: tool.href,
          icon: tool.icon as any,
          color: tool.color || "bg-emerald-500/10"
        },
        score
      });
    }
  }

  // 3. KNOWLEDGE BASE ARTICLES (Theory Encyclopedia)
  for (const entry of KNOWLEDGE_BASE) {
    const titleMatch = entry.title.toLowerCase().includes(lowerQuery);
    const kwMatch = entry.keywords.some(k => k.toLowerCase().includes(lowerQuery));
    const contentMatch = entry.content.toLowerCase().includes(lowerQuery);

    if (titleMatch || kwMatch || contentMatch) {
      let score = 30;
      if (titleMatch) score += 40;
      if (kwMatch) score += 20;

      results.push({
        item: {
          type: "theory",
          title: entry.title,
          subtitle: entry.action?.label || "Music Theory Concept",
          category: "Theory Encyclopedia",
          href: entry.action?.href || "/library",
          icon: "book",
          color: "bg-cyan-500/10",
          snippetHtml: extractSnippet(entry.content, query)
        },
        score
      });
    }
  }

  // 4. COURSE MODULE CHAPTERS
  for (const mod of (courseData.course || [])) {
    for (const chapter of (mod.chapters || [])) {
      const titleMatch = chapter.title.toLowerCase().includes(lowerQuery);
      const topicMatch = chapter.topics?.some((t: string) => t.toLowerCase().includes(lowerQuery));
      const cleanContent = cleanHtml(chapter.content || "");
      const contentMatch = cleanContent.toLowerCase().includes(lowerQuery);

      if (titleMatch || topicMatch || contentMatch) {
        let score = 20;
        if (titleMatch) score += 30;
        if (topicMatch) score += 15;

        results.push({
          item: {
            type: "course",
            title: chapter.title,
            subtitle: mod.title,
            category: "Curriculum Chapter",
            href: `/library?module=${mod.id}&chapter=${chapter.id}`,
            icon: "book",
            color: "bg-blue-500/10",
            snippetHtml: extractSnippet(cleanContent, query)
          },
          score
        });
      }
    }
  }

  // Sort by score descending and deduplicate by title
  const seen = new Set<string>();
  const deduped: TheorySearchResult[] = [];

  results.sort((a, b) => b.score - a.score);
  for (const r of results) {
    const key = r.item.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r.item);
    }
  }

  return deduped.slice(0, 8);
}
