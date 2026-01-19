import React, { useState, useCallback, useMemo } from 'react';

// Uygulama içinde kullanılacak özel stil tanımları (Promptlar)
const PROMPTS = [
    {
        id: 1,
        title: 'Chibi Stili',
        prompt: "Create a high-quality 3D render of a cute 'chibi' style character based on the person in the uploaded photo. The character should have classic chibi proportions: a very large, oversized head and a small, short body. The face should be the main focus, with large, glossy, and highly expressive 'anime-style' eyes, a tiny nose, and a simple mouth. The hair and clothing should be stylized and simplified but still recognizable from the photo, with a smooth, clean, plastic toy-like texture. Solid white studio background."
    },
    {
        id: 2,
        title: 'Funko Stili',
        prompt: "A Funko Pop style vinyl figurine of the person in the photo. It has the classic Funko Pop characteristics: an oversized head, large black circular eyes, a small nose, and no mouth. The figure is placed against a simple, clean, solid white studio background with soft lighting."
    },
    {
        id: 3,
        title: 'Pixar Stili',
        prompt: "A full-body 3D character rendering of the person in the photo, in the style of a Pixar movie. The character has expressive eyes, soft features, and detailed hair, capturing their likeness in a charming, animated way. Solid white studio background."
    },
    {
        id: 4,
        title: 'Action Figür',
        prompt: "An action figure of the person in the photo, styled like a classic Hasbro or Mattel toy. The figure features visible articulated joints and a polished plastic texture. It stands against a simple, clean, solid white studio background."
    },
    {
        id: 5,
        title: 'Roma Büstü',
        prompt: "A photorealistic Roman-style marble bust of the person in the photo. The sculpture appears carved from a single piece of aged Carrara marble. It is displayed against a plain, solid white studio background."
    },
    {
        id: 6,
        title: 'Modern Oyuncak',
        prompt: "A 3D render of a stylized, cartoonish action figure resembling the person in the photo. Smooth, plastic-like texture with simplified proportions. Solid white studio background."
    }
];

// İkonlar ve Yükleme Göstergesi
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f7ba0c]"></div>
        <p className="text-[#f7ba0c] mt-6 font-bold text-lg animate-pulse">Figürünüz Tasarlanıyor...</p>
    </div>
);

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
            // Vercel'deki Environment Variable'dan anahtarı çekiyoruz
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("API Anahtarı bulunamadı. Vercel ayarlarınızı kontrol edin.");
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{
                    parts: [
                        { text: selectedPrompt.prompt },
                        { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
                    ]
                }],
                generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || "Servis şu an meşgul, lütfen tekrar deneyin.");
            }

            const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

            if (base64Data) {
                setGeneratedImage(`data:image/png;base64,${base64Data}`);
            } else {
                throw new Error("Görsel oluşturulamadı. Lütfen başka bir stil deneyin.");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = () => {
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = "3dfigur-tasarim.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#31006e] text-white min-h-screen font-sans">
            {/* Kampanya/Bilgi Çubuğu */}
            <div className="bg-[#f7ba0c] text-black text-center py-2 text-xs sm:text-sm font-black uppercase tracking-widest">
                🚀 SİPARİŞLERİNİZ 3 İŞ GÜNÜ İÇİNDE ÜRETİLİP KARGOYA VERİLİR!
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-10">
                <header className="text-center mb-12">
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase">
                        3D FİGÜR <span className="text-[#f7ba0c]">AI</span>
                    </h1>
                    <p className="text-gray-300 mt-4 text-lg max-w-xl mx-auto font-medium">
                        Fotoğrafınızı yükleyin, tarzınızı seçin ve anılarınızı saniyeler içinde sanat eserine dönüştürün.
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Giriş Paneli */}
                    <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-8">
                        <div>
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 italic">
                                <span className="bg-[#f7ba0c] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">1</span>
                                FOTOĞRAF YÜKLE
                            </h2>
                            <label className="relative flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/20 rounded-3xl cursor-pointer hover:border-[#f7ba0c] transition-all bg-black/20 group">
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Önizleme" className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="text-center">
                                        <UploadIcon />
                                        <p className="text-gray-400 mt-3 text-sm">Net bir portre fotoğrafı seçin</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 italic">
                                <span className="bg-[#f7ba0c] text-black w-8 h-8 rounded-full flex items-center justify-center text-sm not-italic">2</span>
                                STİL BELİRLE
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PROMPTS.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPromptId(p.id)}
                                        className={`text-[10px] sm:text-xs font-black uppercase py-4 px-2 rounded-xl border-2 transition-all ${
                                            selectedPromptId === p.id 
                                            ? 'bg-[#d61545] border-[#d61545] shadow-lg shadow-[#d61545]/40 scale-105' 
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
                            className="w-full bg-[#d61545] hover:bg-[#b5123a] disabled:opacity-20 py-5 rounded-2xl text-xl font-black italic tracking-widest transition-all shadow-xl active:scale-95"
                        >
                            {isLoading ? 'TASARLANIYOR...' : 'FİGÜRÜMÜ OLUŞTUR'}
                        </button>
                    </div>

                    {/* Sonuç Paneli */}
                    <div className="bg-black/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : error ? (
                            <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/20">
                                <p className="text-red-400 font-bold">Bir Sorun Oluştu</p>
                                <p className="text-sm text-gray-400 mt-2">{error}</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="w-full space-y-6 animate-in fade-in duration-700">
                                <img src={generatedImage} alt="Sonuç" className="w-full rounded-3xl shadow-2xl border-4 border-white/5" />
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
                                        SİPARİŞ VER (3 GÜNDE KARGO)
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-20">
                                <div className="w-24 h-24 mx-auto border-4 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-5xl">✨</span>
                                </div>
                                <p className="text-xl font-black italic">TASARIMINIZ BURADA GÖRÜNECEK</p>
                            </div>
                        )}
                    </div>
                </main>

                {/* SEO Metin Alanı */}
                <section className="mt-20 bg-black/20 p-8 sm:p-12 rounded-[3rem] border border-white/5">
                    <h2 className="text-3xl font-black text-[#f7ba0c] mb-6 italic uppercase">Yapay Zeka Destekli 3D Figür Atölyesi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-400 leading-relaxed text-sm">
                        <div className="space-y-4">
                            <p>
                                <strong className="text-white">3DFigur.com</strong> olarak, en sevdiğiniz anıları sadece ekranlarda değil, masanızda canlı bir şekilde tutmanız için geleceğin teknolojisini kullanıyoruz. Yapay zeka motorumuz, fotoğrafınızı saniyeler içinde analiz eder ve seçtiğiniz tarza (Funko, Pixar veya Chibi) en uygun tasarımı hazırlar.
                            </p>
                            <p>
                                Oluşturduğunuz tasarım sadece bir görsel değil, profesyonel üretim ekibimiz için temel bir referanstır. Tasarımınızı beğendikten sonra saniyeler içinde sipariş verebilirsiniz.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p>
                                <strong className="text-white">Neden Biz?</strong> Diğerlerinin aksine biz, yapay zekayı sadece bir eğlence aracı değil, bir üretim köprüsü olarak kullanıyoruz. Sipariş verdiğiniz her ürün, uzman ekibimiz tarafından titizlikle modellenir ve en yüksek kalitede 3D yazıcılarla üretilir.
                            </p>
                            <ul className="grid grid-cols-2 gap-2 text-[#f7ba0c] font-black italic uppercase text-[10px]">
                                <li>✓ 3 İŞ GÜNÜNDE KARGO</li>
                                <li>✓ ÜCRETSİZ DİJİTAL TASARIM</li>
                                <li>✓ YÜKSEK DETAYLI BOYAMA</li>
                                <li>✓ %100 MÜŞTERİ MEMNUNİYETİ</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <footer className="mt-12 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                    © 2025 3DFigur.com - Yapay Zeka Tasarım Atölyesi. Tüm hakları saklıdır.
                </footer>
            </div>
        </div>
    );
}
