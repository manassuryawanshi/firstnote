import json
import os
import re
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load Knowledge Base
KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), 'knowledge.json')

documents = []
document_metadata = []

try:
    with open(KNOWLEDGE_FILE, 'r') as f:
        data = json.load(f)
        
        # Ingest Tools
        for tool in data.get('tools', []):
            text_content = f"{tool.get('title', '')} {tool.get('subtitle', '')} {' '.join(tool.get('keywords', []))}"
            documents.append(text_content)
            document_metadata.append({
                "type": "tool",
                "title": tool.get('title', ''),
                "subtitle": tool.get('subtitle', ''),
                "category": tool.get('category', 'Projects'),
                "href": tool.get('href', ''),
                "icon": tool.get('icon', 'sparkles'),
                "color": tool.get('color', 'bg-emerald-500/10'),
                "raw_text": text_content
            })
            
        # Ingest Course Chapters
        for mod in data.get('course', []):
            for chapter in mod.get('chapters', []):
                # Clean HTML tags for vectorization
                raw_html = chapter.get('content', '')
                clean_text = re.sub(r'<[^>]*>?', ' ', raw_html)
                
                text_content = f"{mod.get('title', '')} {chapter.get('title', '')} {' '.join(chapter.get('topics', []))} {clean_text}"
                documents.append(text_content)
                document_metadata.append({
                    "type": "course",
                    "title": chapter.get('title', ''),
                    "subtitle": mod.get('title', ''),
                    "category": "Theory Library",
                    "href": f"/library?module={mod.get('id')}&chapter={chapter.get('id')}",
                    "icon": "book",
                    "color": "bg-cyan-500/10",
                    "raw_text": clean_text
                })
                
    # Initialize and fit TF-IDF Vectorizer with character n-grams for predictive partial matching
    vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 6))
    tfidf_matrix = vectorizer.fit_transform(documents)
    print("Successfully built TF-IDF index for knowledge base.")
except Exception as e:
    print(f"Warning: Failed to load or vectorize knowledge base: {e}")
    vectorizer = None
    tfidf_matrix = None

def get_snippet(text: str, query: str, radius: int = 40) -> str:
    """Extract a snippet of text surrounding the first match of the query."""
    query_lower = query.lower()
    text_lower = text.lower()
    idx = text_lower.find(query_lower)
    if idx == -1:
        # If exact match not found, just return the first characters
        snippet = text[:radius*2] + "..." if len(text) > radius*2 else text
        return snippet
        
    start = max(0, idx - radius)
    end = min(len(text), idx + len(query) + radius)
    
    snippet = text[start:end]
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."
        
    # Add strong tags around the matched word for UI highlighting
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    highlighted = pattern.sub(r'<span class="bg-blue-500/40 text-blue-100 font-bold px-1 rounded-md">\g<0></span>', snippet)
    
    return highlighted

def analyze_query(query: str) -> List[Dict[str, Any]]:
    """
    Intelligently match the query against the knowledge base using Cosine Similarity.
    """
    query_lower = query.lower().strip()
    if not query_lower or vectorizer is None or tfidf_matrix is None:
        return []

    # Vectorize the query
    query_vec = vectorizer.transform([query_lower])
    
    # Calculate cosine similarity against all documents
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    # Get top 5 matches
    top_indices = np.argsort(similarities)[::-1][:5]
    
    results = []
    
    # Check for direct chord queries (Regex fallback for instant tools)
    chord_regex = r'^([a-g][b#]?(maj|min|m|dim|aug)?\d*)$'
    if re.search(chord_regex, query_lower):
        chord_match = re.search(chord_regex, query_lower).group(0).capitalize()
        
        results.append({
            "title": f"Piano Chord Dictionary: {chord_match}",
            "subtitle": "View piano voicings and fingerings",
            "category": "Piano",
            "href": f"/piano?chord={chord_match.lower()}#dictionary",
            "icon": "piano",
            "color": "bg-emerald-500/10"
        })
        
        results.append({
            "title": f"Guitar Fretboard: {chord_match}",
            "subtitle": "View guitar chord shapes and scales",
            "category": "Guitar",
            "href": f"/guitar?chord={chord_match.lower()}#fretboard",
            "icon": "guitar",
            "color": "bg-fuchsia-500/10"
        })
    
    # Append vector results
    for idx in top_indices:
        score = similarities[idx]
        if score > 0.05: # Minimum confidence threshold
            meta = document_metadata[idx]
            
            # Format snippet if it's a course content
            snippet = ""
            if meta["type"] == "course":
                snippet = get_snippet(meta["raw_text"], query_lower)
            
            results.append({
                "title": meta["title"],
                "subtitle": meta["subtitle"],
                "category": meta["category"],
                "href": meta["href"],
                "icon": meta["icon"],
                "color": meta["color"],
                "snippetHtml": snippet
            })
            
    # Return results or empty list
    return results
