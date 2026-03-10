
import React, { useState } from 'react';
import { AppStatus, FileData, SearchResult, Chunk } from './types.ts';
import { extractTextFromPDFManual, manualChunker, performManualSimilaritySearch } from './services/ragEngine.ts';
import { generateGroundedResponse } from './services/inference_service.ts';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [files, setFiles] = useState<FileData[]>([]);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalChunks = files.reduce((acc, f) => acc + (f.chunks?.length || 0), 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded) return;
    setStatus(AppStatus.PROCESSING_FILES);
    const newFiles: FileData[] = [];
    for (const file of Array.from(uploaded)) {
      try {
        if (file.type === 'application/pdf') {
          const pages = await extractTextFromPDFManual(file);
          const chunks = pages.flatMap(p => manualChunker(p.text, file.name, p.page));
          newFiles.push({ name: file.name, type: 'pdf', chunks, stats: { chunkCount: chunks.length, wordCount: chunks.reduce((a,c) => a+c.text.split(' ').length, 0) } });
        } else if (file.type.startsWith('image/')) {
          const preview = await new Promise<string>((res) => {
            const r = new FileReader(); r.onload = (ev) => res(ev.target?.result as string); r.readAsDataURL(file);
          });
          newFiles.push({ name: file.name, type: 'image', preview });
        }
      } catch (err) { setErrorMessage("Failed to index: " + file.name); }
    }
    setFiles([...files, ...newFiles]);
    setStatus(AppStatus.IDLE);
  };

  const runSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setStatus(AppStatus.SEARCHING);
    try {
      const all = files.flatMap(f => f.chunks || []);
      const matches = performManualSimilaritySearch(query, all, 3);
      const res = await generateGroundedResponse(query, matches, files.find(f => f.type === 'image')?.preview || null);
      setResult(res);
    } catch (err: any) { setErrorMessage(err.message); }
    setStatus(AppStatus.IDLE);
  };

  // Helper to highlight words in text
  const highlightText = (text: string, q: string) => {
    const words = q.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    if (words.length === 0) return text;
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    return text.split(regex).map((part, i) => 
      words.includes(part.toLowerCase()) ? <span key={i} className="bg-yellow-100 text-yellow-800 font-bold">{part}</span> : part
    );
  };

  return (
    <div className="flex h-screen bg-white text-[#262730] overflow-hidden">
      {/* Sidebar - st.sidebar */}
      <aside className="w-[320px] bg-[#f0f2f6] border-r border-[#e6e9ef] p-6 flex flex-col shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <span className="bg-[#ff4b4b] text-white p-1 rounded shadow-sm">VR</span> VisionRAG
          </h1>
          <p className="text-[10px] mt-2 font-mono text-slate-500 bg-white/50 inline-block px-2 rounded">LOGIC ENGINE v2.1</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          <section>
            <h3 className="text-xs font-bold uppercase text-[#555] mb-3">Settings</h3>
            <label className="block bg-white border border-[#d6d6d8] rounded cursor-pointer hover:border-[#ff4b4b] transition-all overflow-hidden group">
              <input type="file" multiple accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
              <div className="py-3 px-4 text-center text-xs font-bold group-hover:text-[#ff4b4b]">BROWSE SOURCE FILES</div>
            </label>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase text-[#555] mb-3">Knowledge Base Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded border border-[#e6e9ef]">
                <p className="text-[10px] text-slate-400 font-bold">TOTAL CHUNKS</p>
                <p className="text-xl font-bold">{totalChunks}</p>
              </div>
              <div className="bg-white p-3 rounded border border-[#e6e9ef]">
                <p className="text-[10px] text-slate-400 font-bold">FILES</p>
                <p className="text-xl font-bold">{files.length}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase text-[#555] mb-3">Active Documents</h3>
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="group relative bg-white border border-[#e6e9ef] p-2 rounded text-[11px] flex items-center gap-2 transition-all hover:shadow-md">
                  <span className="text-lg">{f.type === 'pdf' ? '📄' : '🖼️'}</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold truncate">{f.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase">{f.chunks?.length || 0} Chunks</p>
                  </div>
                  <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 text-red-400 p-1 hover:bg-red-50 rounded">✕</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <button onClick={() => {setFiles([]); setResult(null);}} className="mt-4 w-full py-2 border-2 border-[#ff4b4b] text-[#ff4b4b] hover:bg-[#ff4b4b] hover:text-white rounded text-xs font-bold transition-all uppercase tracking-widest">Reset Database</button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-white">
        <div className="max-w-[800px] mx-auto pt-16 pb-32 px-10">
          
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">DeepGround Multimodal Analysis</h2>
            <p className="text-[#555] text-lg leading-relaxed">
              Consolidated intelligence engine. Upload documents to the sidebar to begin.
            </p>
          </div>

          <form onSubmit={runSearch} className="mb-12 sticky top-0 bg-white/80 backdrop-blur-md z-20 pt-4 pb-8">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a research question..."
                className="flex-1 bg-[#f0f2f6] border-none rounded py-4 px-6 text-base font-medium focus:ring-2 focus:ring-[#ff4b4b] outline-none"
                disabled={status === AppStatus.SEARCHING}
              />
              <button 
                type="submit" 
                disabled={status === AppStatus.SEARCHING || files.length === 0}
                className="bg-[#ff4b4b] hover:bg-[#e04242] text-white px-10 rounded font-bold transition-all disabled:opacity-30 disabled:grayscale"
              >
                {status === AppStatus.SEARCHING ? '...' : 'RUN'}
              </button>
            </div>
          </form>

          {status === AppStatus.PROCESSING_FILES && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg animate-pulse text-blue-700 flex items-center gap-3 mb-10">
              <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold uppercase tracking-widest">Manual Text Indexing Active...</p>
            </div>
          )}

          {errorMessage && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-10 border border-red-200 text-sm font-bold">{errorMessage}</div>}

          {result && (
            <div className="space-y-16 animate-in fade-in duration-700">
              {/* Answer Column */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#e6e9ef] pb-4">
                  <h3 className="text-2xl font-bold">Analysis</h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.confidence === 'High' ? 'bg-green-100 text-green-700' : result.confidence === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    Confidence: {result.confidence}
                  </div>
                </div>
                <div className="text-xl leading-relaxed text-[#262730] font-normal whitespace-pre-wrap">
                  {result.answer}
                </div>
              </div>

              {/* Verified Facts - st.dataframe style */}
              {result.verifiedFacts.length > 0 && (
                <div className="bg-[#f0f2f6] p-8 rounded-2xl">
                  <h4 className="text-xs font-black text-[#555] uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#ff4b4b] rounded-full"></span>
                    Verified Evidence Points
                  </h4>
                  <div className="space-y-4">
                    {result.verifiedFacts.map((fact, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-[#e6e9ef] shadow-sm items-center">
                        <span className="bg-[#f0f2f6] w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold text-slate-400 shrink-0">{i+1}</span>
                        <p className="text-sm font-medium">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Inspection Area */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-[#555] uppercase tracking-widest mb-4">Supporting Documentation</h4>
                <div className="grid gap-4">
                  {result.sources.map((s, idx) => (
                    <div key={idx} className="bg-white border border-[#e6e9ef] p-6 rounded-xl hover:shadow-lg transition-all border-l-4 border-l-[#ff4b4b]">
                      <div className="flex justify-between items-center mb-4 opacity-70">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">MATCH SCORE: {s.score}</span>
                          <span className="text-[11px] font-bold uppercase">{s.fileName}</span>
                        </div>
                        <span className="font-mono text-[10px]">PAGE_{s.pageNumber}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-4 rounded-lg italic">
                        "{highlightText(s.text, query)}"
                      </p>
                    </div>
                  ))}
                  {result.sources.length === 0 && <p className="text-center text-slate-400 py-10 border-2 border-dashed rounded-xl italic">No matching text records found in search.</p>}
                </div>
              </div>
            </div>
          )}

          {!result && status === AppStatus.IDLE && (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
              <div className="text-8xl mb-6 grayscale opacity-20">📊</div>
              <p className="text-sm font-medium">Ready for deep document processing</p>
              <p className="text-[11px] mt-2 bg-slate-100 px-3 py-1 rounded text-slate-400 font-mono">STANDBY FOR INPUT</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
