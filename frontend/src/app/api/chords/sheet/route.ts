import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabUrl = searchParams.get("url")?.trim();

    if (!tabUrl) {
      return NextResponse.json({ success: false, message: "Missing tab url" }, { status: 400 });
    }

    // Security check: ensure URL is from tabs.ultimate-guitar.com
    if (!tabUrl.startsWith("https://tabs.ultimate-guitar.com/")) {
      return NextResponse.json({ success: false, message: "Invalid tab url domain" }, { status: 400 });
    }

    const response = await fetch(tabUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Failed to fetch chord sheet" }, { status: 502 });
    }

    const html = await response.text();
    const match = html.match(/class="js-store" data-content="([^"]+)"/);

    if (!match) {
      return NextResponse.json({ success: false, message: "Could not parse chord sheet content" }, { status: 500 });
    }

    const rawJson = match[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    const parsedData = JSON.parse(rawJson);
    const tab = parsedData?.store?.page?.data?.tab || {};
    const tabView = parsedData?.store?.page?.data?.tab_view || {};

    if (!tabView.wiki_tab) {
      return NextResponse.json({ success: false, message: "Tab content not found" }, { status: 404 });
    }

    const meta = tabView.meta || {};
    const wikiTab = tabView.wiki_tab || {};

    let content = wikiTab.content || "";
    // Clean outer [tab] tags while preserving chord tags [ch]...[/ch]
    content = content.replace(/\[\/?tab\]/g, "");

    // Extract unique chords from the sheet
    const chordMatches = content.match(/\[ch\](.*?)\[\/ch\]/g) || [];
    const uniqueChords = Array.from(new Set(chordMatches.map((m: string) => m.replace(/\[\/?ch\]/g, "").trim())));

    return NextResponse.json(
      {
        success: true,
        sheet: {
          song_name: tab.song_name || meta.song_name || "Unknown Song",
          artist_name: tab.artist_name || meta.artist_name || "Unknown Artist",
          tonality: meta.tonality || tab.tonality_name || uniqueChords[0] || "C",
          capo: meta.capo || 0,
          tuning: meta.tuning?.value || "Standard (E A D G B E)",
          difficulty: meta.difficulty || tab.difficulty || "All Levels",
          content,
          uniqueChords
        }
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200"
        }
      }
    );
  } catch (error: any) {
    console.error("Fetch sheet error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
