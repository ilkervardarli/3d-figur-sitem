import React, { useState, useMemo } from 'react';

// Sabit Prompt Tanımları
const PROMPTS = [
  { id: 1, title: 'Chibi Stili', prompt: "Create a 3D rendered full-body character in a Chibi style based on the person in the photo. Large head, small body, cute features. Solid white studio background." },
  { id: 2, title: 'Funko Stili', prompt: "Create a 3D rendered Funko Pop style vinyl figure based on the person in the photo. Oversized head, button eyes. Solid white studio background." },
  { id: 3, title: 'Pixar Stili', prompt: "Create a 3D rendered character in the style of a Pixar animated movie based on the person in the photo. Detailed textures, expressive eyes. Solid white studio background." },
  { id: 4, title: 'Action Figür', prompt: "A 3D render of a modern Hasbro-style action figure based on the person in the photo. Articulated joints, plastic texture. Solid white studio background." },
  { id: 5, title: 'Roma Büstü', prompt: "A classical Roman marble bust sculpture based on the person in the photo. Detailed marble texture, white studio background." },
  { id: 6, title: 'Modern Oyuncak', prompt: "A stylized 3D modern toy figure. Smooth plastic finish, clean anatomy. Solid white studio background." }
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedPrompt = useMemo(() => PROMPTS.find(p => p.id === selectedPromptId), [selectedPromptId]);

  const handleGenerateImage = async () => {
    if (!selectedImage || !selectedPrompt) {
      setError("Lütfen bir fotoğraf yükleyin ve stil seçin.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const base64ImageData = selectedImage.split(',')[1];
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Anahtarı eksik! Vercel ayarlarını kontrol edin.");

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text: selectedPrompt.prompt }, { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      };

      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Servis şu an meşgul.");

      const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (base64Data) setGeneratedImage(`data:image/png;base64,${base64Data}`);
      else throw new Error("Görsel oluşturulamadı.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#31006e] text-white min-h-screen p-4 flex flex-col items-center">
      <div className="bg-[#f7ba0c] text-black w-full text-center py-2 font-bold mb-8">🚀 3 İŞ GÜNÜNDE KARGO GARANTİSİ!</div>
      <h1 className="text-4xl font-black italic mb-8 uppercase tracking-tighter">3D FİGÜR <span className="text-[#f7ba0c]">AI</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-4">1. Fotoğraf Yükle</h2>
          <input type="file" onChange={handleImageUpload} className="mb-4 text-sm" accept="image/*" />
          {selectedImage && <img src={selectedImage} alt="Önizleme" className="h-40 object-contain mb-4 rounded-lg" />}
          
          <h2 className="text-xl font-bold mb-4">2. Stil Seç</h2>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {PROMPTS.map(p => (
              <button key={p.id} onClick={() => setSelectedPromptId(p.id)} className={`p-2 rounded-lg text-[10px] font-bold uppercase border ${selectedPromptId === p.id ? 'bg-[#d61545] border-[#d61545]' : 'bg-white/5 border-white/10'}`}>
                {p.title}
              </button>
            ))}
          </div>
          <button onClick={handleGenerateImage} disabled={isLoading} className="w-full bg-[#d61545] py-4 rounded-xl font-black italic uppercase tracking-widest">{isLoading ? 'Hazırlanıyor...' : 'FİGÜRÜMÜ OLUŞTUR'}</button>
        </div>

        <div className="bg-black/20 p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
          {isLoading ? <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7ba0c]"></div> : 
           error ? <p className="text-red-400 text-sm">{error}</p> :
           generatedImage ? (
             <div className="text-center">
               <img src={generatedImage} alt="Sonuç" className="rounded-xl shadow-2xl mb-4 max-h-80" />
               <a href="https://3dfigur.com/kisiye-ozel-figurler" target="_blank" rel="noreferrer" className="block bg-[#f7ba0c] text-black py-3 px-6 rounded-xl font-black italic">SİPARİŞ VER (3 GÜN)</a>
             </div>
           ) : <p className="text-gray-500 italic">Tasarımınız burada görünecek.</p>}
        </div>
      </div>
    </div>
  );
}
