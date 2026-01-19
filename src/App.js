import React, { useState, useCallback, useMemo } from 'react';

/**
 * 3D FIGUR AI - Nano Banana (Imagen 4.0) Sürümü
 * Bu sürüm, Gemini 2.5 Flash ile analiz yapıp Imagen 4.0 ile görsel üretir.
 */

const PROMPTS = [
  { id: 1, title: 'Chibi Stili', style: 'cute Chibi / Funko style with a large head and small body' },
  { id: 2, title: 'Funko Stili', style: 'classic Funko Pop vinyl figure with button eyes and oversized head' },
  { id: 3, title: 'Pixar Stili', style: 'Pixar movie animation character style with expressive eyes and soft lighting' },
  { id: 4, title: 'Action Figür', style: 'Hasbro/Mattel action figure style with articulated joints and plastic texture' },
  { id: 5, title: 'Roma Büstü', style: 'classical Roman marble bust sculpture with Carrara marble texture' },
  { id: 6, title: 'Modern Oyuncak', style: 'modern designer toy figure with smooth features and minimalist design' }
];

// İkon Bileşenleri
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

  const selectedStyle = useMemo(() => PROMPTS.find(p => p.id === selectedPromptId), [selectedPromptId]);

  // Üst üste binmeyi önlemek ve güvenilirliği artırmak için bekleme fonksiyonu
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const apiCallWithRetry = async (url, options, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return await response.json();
        if (response.status !== 429 && response.status < 500) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Hatası: ${response.status}`);
        }
      } catch (err) {
        if (i === retries - 1) throw err;
      }
      await wait(Math.pow(2, i) * 1000);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedImage || !selectedStyle) {
      setError("Lütfen bir fotoğraf yükleyin ve stil seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const apiKey = ""; // API anahtarı çalışma ortamı tarafından sağlanır
        const base64ImageData = selectedImage.split(',')[1];

        // 1. ADIM: GEMINI 2.5 FLASH İLE FOTOĞRAF ANALİZİ
        // Bu adımda fotoğrafın detaylarını çıkarıp Imagen'e ne yapması gerektiğini söylüyoruz.
        const analyzerUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        
        const analyzerPayload = {
            contents: [{
                parts: [
                    { text: `Analyze the person in this photo. Describe their hair color/style, skin tone, clothing, and unique facial features. Based on this, write a professional prompt for an image generator to create a 3D figure in ${selectedStyle.style}. The character must look like this person. Specify high quality 3D render, studio lighting, and a solid white background. Return ONLY the final prompt text.` },
                    { inlineData: { mimeType: "image/png", data: base64ImageData } }
                ]
            }]
        };

        const analyzerResult = await apiCallWithRetry(analyzerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analyzerPayload)
        });

        const optimizedPrompt = analyzerResult.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!optimizedPrompt) throw new Error("Görsel analizi yapılamadı.");

        // 2. ADIM: IMAGEN 4.0 (NANO BANANA) İLE GÖRSEL ÜRETİMİ
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
        
        const imagenPayload = {
            instances: { prompt: optimizedPrompt },
            parameters: { sampleCount: 1 }
        };

        const imagenResult = await apiCallWithRetry(imagenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imagenPayload)
        });

        const base64Data = imagenResult.predictions?.[0]?.bytesBase64Encoded;

        if (base64Data) {
            setGeneratedImage(`data:image/png;base64,${base64Data}`);
        } else {
            throw new Error("Imagen görsel üretemedi.");
        }

    } catch (err) {
        console.error("Süreç Hatası:", err);
        setError(`İşlem sırasında bir hata oluştu: ${err.message}`);
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
                Nanobanana (Imagen 4.0) Teknolojisiyle Kusursuz Tasarımlar.
            </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase text-[#f7ba0c]">
                <span className="bg-[#f7ba0c] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">1</span>
                Fotoğraf Yükle
              </h2>
              <label className="relative flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/20 rounded-3xl cursor-pointer hover:border-[#f7ba0c] transition-all bg-black/20 group overflow-hidden">
                {selectedImage ? (
                  <img src={selectedImage} alt="Önizleme" className="h-full w-full object-contain p-4" />
                ) : (
                  <div className="text-center">
                    <UploadIcon />
                    <p className="text-gray-400 mt-3 text-sm font-medium">Yüzünüzün net olduğu bir fotoğraf seçin</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase text-[#f7ba0c]">
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
              <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f7ba0c]"></div>
                  <p className="text-[#f7ba0c] mt-6 font-bold text-lg animate-pulse uppercase italic tracking-tighter">Imagen 4.0 Hazırlanıyor...</p>
                  <p className="text-gray-500 text-xs mt-2 italic">Yapay zeka fotoğrafınızı analiz ediyor ve 3D modelinizi çiziyor.</p>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20 max-w-sm">
                <p className="text-red-400 font-bold mb-2 uppercase italic">Hata Algılandı</p>
                <p className="text-xs text-gray-400">{error}</p>
                <button onClick={() => setError(null)} className="mt-4 text-[10px] underline uppercase text-white hover:text-[#f7ba0c]">Tekrar Dene</button>
              </div>
            ) : generatedImage ? (
              <div className="w-full space-y-6 animate-in fade-in zoom-in duration-700">
                <div className="relative group">
                    <img src={generatedImage} alt="Sonuç" className="w-full rounded-3xl shadow-2xl border-4 border-white/5" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-end justify-center pb-6">
                        <p className="text-[#f7ba0c] font-black italic tracking-widest">TASARIM TAMAMLANDI</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={downloadImage} className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors">
                    <DownloadIcon /> İNDİR
                  </button>
                  <a 
                    href="https://3dfigur.com/kisiye-ozel-figurler" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-[2] bg-[#f7ba0c] text-black hover:bg-[#ffc117] py-4 rounded-xl font-black italic text-center shadow-lg transition-transform hover:scale-105"
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
