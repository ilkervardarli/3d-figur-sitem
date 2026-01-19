import React, { useState, useCallback, useMemo } from 'react';

/**
 * 3D FIGUR AI - Profesyonel Kullanıcı Deneyimi
 * Hata Düzeltmesi: 'lucide-react' bağımlılığı kaldırılarak ikonlar dahili SVG olarak tanımlandı.
 */

// --- İKON BİLEŞENLERİ (Bağımlılık gerektirmez) ---
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 text-gray-500 group-hover:text-[#f7ba0c] transition-colors">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-500 mx-auto group-hover:text-[#f7ba0c] transition-colors">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M5 3h4"/>
  </svg>
);

const ShoppingCartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const RefreshCwIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);

const AlertCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckCircle2Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const InfoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

const STYLES = [
  { id: 1, title: 'Chibi Stili', prompt: 'cute Chibi style, large head, small body, adorable facial features' },
  { id: 2, title: 'Funko Stili', prompt: 'iconic Funko Pop vinyl figure, large black circular eyes, oversized head' },
  { id: 3, title: 'Pixar Stili', prompt: 'Pixar movie animation style, expressive eyes, cinematic 3D lighting' },
  { id: 4, title: 'Action Figür', prompt: 'Hasbro style action figure, articulated joints, professional toy plastic texture' },
  { id: 5, title: 'Roma Büstü', prompt: 'classical Roman marble bust sculpture, realistic stone texture, white marble' },
  { id: 6, title: 'Anime Stili', prompt: 'high-quality 3D anime character design, vibrant colors, stylized features' }
];

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle'); // idle, analyzing, generating

  // --- GÜVENLİ API ANAHTARI YÖNETİMİ ---
  let apiKey = "";
  try {
    if (process.env.REACT_APP_GEMINI_API_KEY) {
      apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    }
  } catch (e) {
    console.log("Geliştirme ortamı: API Key manuel girilmelidir.");
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setGeneratedImage(null);
        setError(null);
        setStep('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedStyle = useMemo(() => STYLES.find(s => s.id === selectedStyleId), [selectedStyleId]);

  const fetchWithRetry = async (url, options, retries = 5) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return await response.json();
        
        if (response.status === 429 || response.status >= 500) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Hata: ${response.status}`);
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedStyleId) {
      setError("Lütfen bir fotoğraf yükleyin ve bir stil seçin.");
      return;
    }

    if (!apiKey) {
      setError("API Anahtarı bulunamadı. Lütfen Vercel ayarlarında 'REACT_APP_GEMINI_API_KEY' tanımlı olduğundan emin olun.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('analyzing');

    try {
      const base64Data = selectedImage.split(',')[1];

      // 1. ADIM: Fotoğraf Analizi (Gemini 2.5 Flash)
      const analyzerUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const analyzerPayload = {
        contents: [{
          parts: [
            { text: `Analyze the person in this photo. Based on their look, hair, skin, and clothes, write a detailed professional prompt to generate a 3D figure in ${selectedStyle.prompt} that looks exactly like them. Solid white background, high-end 3D render. Return ONLY the final prompt text.` },
            { inlineData: { mimeType: "image/png", data: base64Data } }
          ]
        }]
      };

      const analyzerResult = await fetchWithRetry(analyzerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyzerPayload)
      });

      const optimizedPrompt = analyzerResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!optimizedPrompt) throw new Error("Görsel analizi yapılamadı.");

      setStep('generating');

      // 2. ADIM: Görsel Üretimi (Yapay Zeka Motoru)
      const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const imagenPayload = {
        instances: { prompt: optimizedPrompt },
        parameters: { sampleCount: 1 }
      };

      const imagenResult = await fetchWithRetry(imagenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagenPayload)
      });

      const resultImage = imagenResult.predictions?.[0]?.bytesBase64Encoded;

      if (resultImage) {
        setGeneratedImage(`data:image/png;base64,${resultImage}`);
        setStep('done');
      } else {
        throw new Error("Tasarım oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "3d-figur-tasarimi.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#31006e] text-white font-sans selection:bg-[#f7ba0c] selection:text-black">
      {/* Kargo Şeridi */}
      <div className="bg-gradient-to-r from-[#f7ba0c] to-[#ff9d00] text-black py-3 px-4 text-center font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-xl relative z-50">
        🚀 KAMPANYA: SİPARİŞLERİNİZ 3-5 İŞ GÜNÜ İÇİNDE ÜRETİLİP KARGOYA VERİLİR!
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">
        <header className="text-center mb-16 lg:mb-24 animate-in fade-in slide-in-from-top duration-1000">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black italic tracking-tighter uppercase leading-none inline-block">
            3D FİGÜR <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#f7ba0c] to-[#ff9d00] drop-shadow-[0_10px_30px_rgba(247,186,12,0.3)]">AI</span>
          </h1>
          <p className="mt-8 text-gray-400 text-lg sm:text-2xl font-medium italic max-w-3xl mx-auto leading-relaxed">
            Yapay zeka ile fotoğraflarınızı ölümsüzleştirin. Saniyeler içinde kendi koleksiyon figürünüzü tasarlayın.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Giriş Paneli */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f7ba0c] to-[#ff9d00] text-black flex items-center justify-center font-black italic shadow-lg">1</div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">Fotoğraf Yükle</h2>
              </div>
              
              <label className="group relative flex flex-col items-center justify-center h-80 border-2 border-dashed border-white/20 rounded-[2.5rem] cursor-pointer hover:border-[#f7ba0c] hover:bg-white/5 transition-all overflow-hidden bg-black/40">
                {selectedImage ? (
                  <div className="relative w-full h-full p-4">
                    <img src={selectedImage} alt="Önizleme" className="h-full w-full object-contain rounded-2xl shadow-2xl transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <RefreshCwIcon className="w-12 h-12 text-white animate-spin-slow" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-5">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <CameraIcon />
                    </div>
                    <div>
                        <p className="text-gray-300 font-bold text-lg tracking-tight uppercase">Görsel Seç</p>
                        <p className="text-gray-500 text-sm mt-1">Yüzünüzün net olduğu bir fotoğraf</p>
                    </div>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f7ba0c] to-[#ff9d00] text-black flex items-center justify-center font-black italic shadow-lg">2</div>
                <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">Stilini Seç</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`text-[10px] font-black uppercase py-5 px-3 rounded-2xl border-2 transition-all duration-500 relative overflow-hidden group/btn ${
                      selectedStyleId === style.id 
                        ? 'bg-[#d61545] border-[#d61545] shadow-2xl shadow-[#d61545]/40 scale-105' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <span className="relative z-10 tracking-widest text-white">{style.title}</span>
                    {selectedStyleId === style.id && (
                        <SparklesIcon className="absolute top-1 right-1 w-3 h-3 text-white/50 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !selectedImage || !selectedStyleId}
              className="group w-full bg-[#d61545] hover:brightness-110 disabled:opacity-20 py-7 rounded-[2.5rem] text-2xl font-black italic tracking-widest transition-all shadow-2xl active:scale-95 overflow-hidden relative text-white"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                    <>
                        <RefreshCwIcon className="w-6 h-6 animate-spin" />
                        <span>TASARLANIYOR...</span>
                    </>
                ) : (
                    <>
                        <span>FİGÜRÜMÜ OLUŞTUR</span>
                        <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            </button>
          </div>

          {/* Çıktı Paneli */}
          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 sm:p-12 min-h-[600px] flex flex-col items-center justify-center shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {isLoading ? (
              <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-t-4 border-b-4 border-[#f7ba0c] animate-spin"></div>
                  <SparklesIcon className="w-12 h-12 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <p className="text-3xl font-black italic text-[#f7ba0c] uppercase tracking-tighter">
                    {step === 'analyzing' ? 'FOTOĞRAFIN ANALİZ EDİLİYOR...' : '3D TASARIMIN ÇİZİLİYOR...'}
                  </p>
                  <p className="text-gray-400 text-lg italic max-w-xs mx-auto">Yapay zeka hayallerini gerçeğe dönüştürmek üzere çalışıyor...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12 bg-red-500/10 rounded-[3rem] border border-red-500/20 max-w-md">
                <AlertCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <p className="text-2xl font-black uppercase italic tracking-tighter text-red-400">Tasarım Durduruldu</p>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="mt-8 px-10 py-4 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10"
                >
                  YENİDEN DENE
                </button>
              </div>
            ) : generatedImage ? (
              <div className="w-full space-y-10 animate-in fade-in zoom-in duration-1000">
                <div className="relative group overflow-hidden rounded-[3rem] border-8 border-white/5 shadow-2xl bg-white/5">
                  <img src={generatedImage} alt="Yapay Zeka Tasarımı" className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-12">
                    <div className="text-center">
                        <CheckCircle2Icon className="w-12 h-12 text-[#f7ba0c] mx-auto mb-2 animate-bounce" />
                        <p className="text-[#f7ba0c] font-black italic tracking-widest uppercase text-3xl">TASARIM HAZIR!</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <button 
                    onClick={downloadImage} 
                    className="flex-1 bg-white/5 hover:bg-white/10 py-6 rounded-2xl font-black italic flex items-center justify-center gap-3 border border-white/10 transition-all uppercase tracking-tight text-white"
                  >
                    <DownloadIcon className="w-6 h-6" /> İNDİR
                  </button>
                  <a 
                    href="https://3dfigur.com/kisiye-ozel-figurler" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex-[2] bg-gradient-to-r from-[#f7ba0c] to-[#ff9d00] text-black hover:brightness-110 py-6 rounded-2xl font-black italic text-center shadow-2xl transition-all hover:scale-[1.03] flex items-center justify-center gap-4 uppercase tracking-tight"
                  >
                    <ShoppingCartIcon className="w-6 h-6" /> SİPARİŞ VER (3-5 İŞ GÜNÜ)
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-20 select-none space-y-10 group">
                <div className="w-40 h-40 mx-auto border-4 border-dashed border-white/20 rounded-full flex items-center justify-center transition-all duration-700 group-hover:border-[#f7ba0c]/50 group-hover:rotate-45">
                  <SparklesIcon className="w-20 h-20 group-hover:scale-110 transition-transform duration-700 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black italic uppercase tracking-wider text-white">HAYALİN BURADA DOĞACAK</p>
                  <p className="text-gray-500 mt-3 text-lg italic">Adımları tamamlayarak yapay zekayı uyandır!</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bilgi Kartları & SEO Metni */}
        <section className="mt-40 space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { 
                        title: "Yapay Zeka Sanatı", 
                        text: "Gelişmiş görüntü işleme algoritmaları ile fotoğrafınızı analiz ederek size özel bir tasarım taslağı hazırlıyoruz.", 
                        icon: SparklesIcon 
                    },
                    { 
                        title: "Hızlı Üretim", 
                        text: "Tasarımınız onaylandıktan sonra sadece 3-5 iş günü içerisinde üretilip, titizlikle paketlenerek kargoya verilir.", 
                        icon: ShoppingCartIcon 
                    },
                    { 
                        title: "Premium Kalite", 
                        text: "Her figür, darbelere dayanıklı premium reçinelerden üretilir ve tamamen yenilikçi teknolojiler ile kusursuz bir şekilde üretilir.", 
                        icon: CheckCircle2Icon 
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 space-y-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 group">
                        <div className="w-16 h-16 rounded-2xl bg-[#f7ba0c]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-8 h-8 text-[#f7ba0c]" />
                        </div>
                        <h3 className="text-white font-black italic uppercase tracking-widest text-xl">{item.title}</h3>
                        <p className="text-gray-400 text-base leading-relaxed">{item.text}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 p-12 sm:p-20 rounded-[4rem] border border-white/5 space-y-10">
                <div className="flex items-center gap-6 text-[#f7ba0c]">
                    <InfoIcon className="w-10 h-10" />
                    <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter">Fotoğraflarınızı Hayata Geçirin</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-gray-400 text-lg leading-relaxed italic">
                    <p>
                        Sıradan fotoğraflarınızı unutun! 3DFigur.com'un devrim niteliğindeki yapay zeka aracı ile artık en sevdiğiniz anıları, elle tutulur hatıralara dönüştürebilirsiniz. Gelişmiş teknolojimiz, yüklediğiniz bir fotoğrafı analiz ederek saniyeler içinde size özel, yüksek kaliteli bir tasarım sunar. Kendiniz, sevdikleriniz veya evcil hayvanınız için eşi benzeri olmayan, tamamen kişiye özel bir biblo veya heykel yaratmak hiç bu kadar kolay olmamıştı.
                    </p>
                    <p>
                        Dijital tasarımınızı beğendiğinizde, uzman heykeltıraşlarımız ve 3D modelleme sanatçılarımız süreci devralır. En kaliteli malzemeler kullanılarak size özel üretim yapılır ve sadece 3-5 iş günü içerisinde özenle paketlenerek kargoya verilir. Her ürün, darbelere dayanıklı premium reçineden üretilir ve profesyonel sanatçılarımızın fırça darbeleriyle hayat bulur.
                    </p>
                </div>
                <div className="pt-10 border-t border-white/10">
                    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-[#f7ba0c] font-black italic uppercase text-xs tracking-widest">
                        <li>✓ 3-5 GÜNDE KARGO</li>
                        <li>✓ YENİLİKÇİ TEKNOLOJİ</li>
                        <li>✓ ÜCRETSİZ TASARIM</li>
                        <li>✓ %100 MEMNUNİYET</li>
                    </ul>
                </div>
            </div>
        </section>

        <footer className="mt-40 pt-16 border-t border-white/5 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.4em] space-y-8">
          <p>© 2026 3DFigur.com - YAPAY ZEKA TASARIM VE ÜRETİM ATÖLYESİ</p>
          <div className="flex justify-center gap-10 opacity-40">
            <span className="hover:text-white transition-colors cursor-pointer tracking-widest">KVKK</span>
            <span className="hover:text-white transition-colors cursor-pointer tracking-widest">SÖZLEŞMELER</span>
            <span className="hover:text-white transition-colors cursor-pointer tracking-widest">İLETİŞİM</span>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}} />
    </div>
  );
}
