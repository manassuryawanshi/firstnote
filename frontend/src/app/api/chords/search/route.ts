import { NextResponse } from "next/server";

function cleanSearchQuery(q: string): string {
  return q
    .replace(/\b(chords?|tabs?|lyrics?|guitar|piano|easy|acoustic|by|song)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchUGSearch(paramString: string): Promise<any[]> {
  try {
    const url = `https://www.ultimate-guitar.com/search.php?${paramString}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];

    const html = await response.text();
    const match = html.match(/class="js-store" data-content="([^"]+)"/);
    if (!match) return [];

    const rawJson = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    const parsedData = JSON.parse(rawJson);
    const rawResults = parsedData?.store?.page?.data?.results || [];

    return rawResults
      .filter((item: any) => item.type === "Chords" && item.tab_url)
      .map((item: any) => ({
        id: item.id,
        song_name: item.song_name,
        artist_name: item.artist_name,
        rating: Math.round((item.rating || 0) * 10) / 10,
        votes: item.votes || 0,
        difficulty: item.difficulty || "All Levels",
        tab_url: item.tab_url,
        tonality: item.tonality_name || null
      }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q")?.trim();

    if (!rawQuery) {
      return NextResponse.json({ success: false, results: [], message: "Missing search query" }, { status: 400 });
    }

    const cleaned = cleanSearchQuery(rawQuery) || rawQuery;

    // 1. First attempt: Title search with cleaned query
    let results = await fetchUGSearch(`search_type=title&value=${encodeURIComponent(cleaned)}`);

    // 2. Second attempt: If 0 results, try general query
    if (results.length === 0 && cleaned !== rawQuery) {
      results = await fetchUGSearch(`search_type=title&value=${encodeURIComponent(rawQuery)}`);
    }

    // 3. Third attempt: If user typed "Song Artist", try first key term
    if (results.length === 0 && cleaned.includes(" ")) {
      const firstWord = cleaned.split(" ")[0];
      if (firstWord.length >= 3) {
        results = await fetchUGSearch(`search_type=title&value=${encodeURIComponent(firstWord)}`);
      }
    }

    return NextResponse.json(
      { success: true, results: results.slice(0, 8) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
        }
      }
    );
  } catch (error: any) {
    console.error("Chord search error:", error);
    return NextResponse.json({ success: false, results: [], error: error.message }, { status: 500 });
  }
}
