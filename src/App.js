import React, { useState, useCallback, useMemo } from 'react';

/**
 * 3D FIGUR AI - Profesyonel Yapılandırma
 * Model: gemini-2.0-flash (Güncel ve Kararlı Sürüm)
 */

const PROMPTS = [
  {
    id: 1,
    title: 'Chibi Stili',
    prompt: "Create a high-quality 3D render of a cute 'chibi' style character based on the person in the photo. Large oversized head, small body, glossy eyes. Solid white studio background."
  },
  {
    id: 2,
    title: 'Funko Stili',
    prompt: "A Funko Pop style vinyl figurine of the person in the photo. Oversized head, large black circular eyes, small nose. Solid white studio background."
  },
  {
    id: 3,
    title: 'Pixar Stili',
    prompt: "A full-body 3D character rendering of the person in the photo in Pixar animation style. Expressive features, soft lighting. Solid white studio background."
  },
  {
    id: 4,
    title: 'Action Figür',
    prompt: "An action figure of the person in the photo, styled like a Hasbro/Mattel toy. Articulated joints, plastic texture. Solid white studio background."
  },
  {
    id: 5,
    title: 'Roma Büstü',
    prompt: "A photorealistic Roman-style marble bust of the person in the photo. Aged Carrara marble texture. Solid white studio background."
  },
  {
    id: 6,
    title: 'Modern Oyuncak',
    prompt: "A 3D render of a stylized, cartoonish action figure resembling the person in the photo. Smooth plastic finish. Solid white studio background."
  }
];

// UI Bileşenleri (İkonlar)
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = useCallback((event) => {
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
  }, []);

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

        if (!apiKey) {
            throw new Error("API Anahtarı bulunamadı! Vercel'de REACT_APP_GEMINI_API_KEY değişkenini kontrol edin.");
        }

        // --- MODEL ADINI GÜNCELLEDİK ---
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: selectedPrompt.prompt },
                    { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
                ]
            }],
            generationConfig: {
                // Görsel çıktısı almak için multimodal modları kullanıyoruz
                responseModalities: ["IMAGE"]
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const msg = result.error?.message || `Sunucu hatası: ${response.status}`;
            throw new Error(msg);
        }

        const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            setGeneratedImage(`data:image/png;base64,${base64Data}`);
        } else {
            throw new Error("Görsel oluşturulamadı. Model görsel yanıtı dönmedi.");
        }

    } catch (err) {
        console.error("Uygulama Hatası:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "3dfigur-ai-tasarim.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#31006e] text-white min-h-screen font-sans flex flex-col items-center">
      <div className="bg-[#f7ba0c] text-black w-full text-center py-2 text-xs font-black uppercase tracking-widest z-50">
        🚀 SİPARİŞLERİNİZ 3 İŞ GÜNÜ İÇİNDE ÜRETİLİP KARGOYA VERİLİR!
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <header className="text-center mb-12">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase">
                3D FİGÜR <span className="text-[#f7ba0c]">AI</span>
            </h1>
            <p className="text-gray-300 mt-4 text-lg max-w-xl mx-auto font-medium italic">
                Anılarınızı saniyeler içinde fiziksel dünyaya taşıyın.
            </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase">
                <span className="bg-[#f7ba0c] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">1</span>
                Fotoğraf Yükle
              </h2>
              <label className="relative flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/20 rounded-3xl cursor-pointer hover:border-[#f7ba0c] transition-all bg-black/20 group overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} alt="Önizleme" className="h-full w-full object-contain p-4" />
                ) : (
                  <div className="text-center">
                    <UploadIcon />
                    <p className="text-gray-400 mt-3 text-sm font-medium">Net bir portre fotoğrafı seçin</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase">
                <span className="bg-[#f7ba0c] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">2</span>
                Stil Belirle
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPromptId(p.id)}
                    className={`text-[10px] font-black uppercase py-4 px-2 rounded-xl border-2 transition-all ${
                      selectedPromptId === p.id 
                      ? 'bg-[#d61545] border-[#d61545] shadow-lg scale-105' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isLoading || !selectedImage || !selectedPromptId}
              className="w-full bg-[#d61545] hover:bg-[#b5123a] disabled:opacity-20 py-5 rounded-2xl text-xl font-black italic tracking-widest transition-all shadow-xl"
            >
              {isLoading ? 'TASARLANIYOR...' : 'FİGÜRÜMÜ OLUŞTUR'}
            </button>
          </div>

          <div className="bg-black/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f7ba0c]"></div>
                  <p className="text-[#f7ba0c] mt-6 font-bold text-lg animate-pulse">Figürünüz Tasarlanıyor...</p>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-sm">
                <p className="text-red-400 font-bold mb-2 uppercase italic">Hata Algılandı</p>
                <p className="text-xs text-gray-400">{error}</p>
                <button onClick={() => setError(null)} className="mt-4 text-[10px] underline uppercase text-white hover:text-[#f7ba0c]">Tekrar Dene</button>
              </div>
            ) : generatedImage ? (
              <div className="w-full space-y-6 animate-in fade-in zoom-in duration-700">
                <img src={generatedImage} alt="Sonuç" className="w-full rounded-3xl shadow-2xl border-4 border-white/5" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={downloadImage} className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10">
                    <DownloadIcon /> İNDİR
                  </button>
                  <a 
                    href="https://3dfigur.com/kisiye-ozel-figurler" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-[2] bg-[#f7ba0c] text-black hover:bg-[#ffc117] py-4 rounded-xl font-black italic text-center shadow-lg"
                  >
                    SİPARİŞ VER (3 GÜN)
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-20 select-none">
                <div className="w-24 h-24 mx-auto border-4 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-5xl">✨</span>
                </div>
                <p className="text-xl font-black italic uppercase tracking-wider">Tasarımınız Burada Görünecek</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
