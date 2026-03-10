
# RAG Retrieval Logic v2.0 - DeepGround
# Core reference logic for manual retrieval and ranking.

def manual_chunk_text(text, file_name, page_num, chunk_size=600):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            stop = text.rfind(". ", start, end)
            if stop > start + 150:
                end = stop + 1
        content = text[start:end].strip()
        if len(content) > 15:
            chunks.append({
                "id": f"{file_name}_{page_num}_{start}",
                "text": content,
                "fileName": file_name,
                "pageNumber": page_num,
                "score": 0
            })
        start = end - 120 # Overlap
    return chunks

def retrieve_best_matches(query, chunks, top_k=3):
    q_lower = query.lower()
    q_words = [w for w in q_lower.split() if len(w) > 3]
    results = []
    
    for c in chunks:
        score = 0
        txt = c['text'].lower()
        
        # Exact phrase bonus
        if q_lower in txt:
            score += 20
            
        # Keyword counts
        for w in q_words:
            count = txt.count(w)
            score += count
            if f" {w} " in txt:
                score += 2 # Density bonus
                
        if score > 0:
            c['score'] = score
            results.append(c)
            
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]
