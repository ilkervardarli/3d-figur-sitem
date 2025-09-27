import React, { useState, useCallback, useMemo } from 'react';

// Vercel build'ini yeniden tetikle
// Sabit olarak tanımlanmış prompt'lar
const PROMPTS = [
    {
        id: 1,
        title: 'Chibi Stili',
        prompt: "Create a high-quality 3D render of a cute 'chibi' style character based on the person in the uploaded photo. The character should have classic chibi proportions: a very large, oversized head and a small, short body. The face should be the main focus, with large, glossy, and highly expressive 'anime-style' eyes, a tiny nose, and a simple mouth. The hair and clothing should be stylized and simplified but still recognizable from the photo, with a smooth, clean, plastic toy-like texture. The figure should be a full-body rendering in a cute pose. Place it against a simple, clean, solid white studio background with soft, professional lighting."
    },
    {
        id: 2,
        title: 'Funko Stili',
        prompt: "A Funko Pop style vinyl figurine of the person in the photo. It has the classic Funko Pop characteristics: an oversized head, large black circular eyes, a small nose, and no mouth. The figure is placed against a simple, clean, solid white studio background with soft lighting."
    },
    {
        id: 3,
        title: 'Pixar Stili',
        prompt: "A full-body 3D character rendering of the person in the photo, in the style of a Pixar movie. The character has expressive eyes, soft features, and detailed hair, capturing their likeness in a charming, animated way. The character is placed against a simple, clean, solid white studio background with soft lighting."
    },
    {
        id: 4,
        title: 'Hasbro/Mattel Figürü',
        prompt: "An action figure of the person in the photo, styled like a classic Hasbro or Mattel toy from the 90s. The figure features visible articulated joints, a slightly idealized physique, and painted details. It stands against a simple, clean, solid white studio background with soft lighting."
    },
    {
        id: 5,
        title: 'Roma Büstü',
        prompt: "A photorealistic Roman-style marble bust of the person in the photo. The sculpture appears carved from a single piece of aged Carrara marble, with realistic texture, cracks, and imperfections. It is displayed on a stone pedestal within a grand museum setting, under dramatic, focused lighting."
    },
    {
        id: 6,
        title: 'Modern Oyuncak Figür',
        prompt: "A 3D render of a stylized, cartoonish action figure resembling the person in the uploaded photo. The figure has simplified, smooth features characteristic of a modern Mattel or Hasbro toy line (e.g., Fisher-Price Imaginext). It retains the recognizable facial features and outfit from the photo, translated into a smooth, plastic-like texture with simplified proportions. The figure stands on a simple, round display base against a plain, solid studio background."
    }
];

// SVG İkonları
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-10 w-10 text-[#f7ba0c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-300">Görseliniz oluşturuluyor, lütfen bekleyin...</p>
    </div>
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
        setGeneratedImage(null); // Yeni resim yüklendiğinde eski sonucu temizle
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const selectedPrompt = useMemo(() => {
    return PROMPTS.find(p => p.id === selectedPromptId);
  }, [selectedPromptId]);


  const handleGenerateImage = useCallback(async () => {
    if (!selectedImage || !selectedPrompt) {
      setError("Lütfen bir görsel yükleyin ve bir stil seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
        const base64ImageData = selectedImage.split(',')[1];
        
        const payload = {
            contents: [{
                parts: [
                    { text: selectedPrompt.prompt },
                    { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
                ]
            }],
            generationConfig: {
                responseModalities: ['IMAGE', 'TEXT']
            },
        };
        
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
        
        let retries = 3;
        let response;

        while(retries > 0) {
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    break;
                }
            } catch (e) {
                console.error("Fetch error:", e);
            }
            
            retries--;
            if(retries > 0) {
                 await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!response || !response.ok) {
            const errorData = response ? await response.json() : { error: { message: "Network error or API is down."}};
            throw new Error(errorData.error?.message || `API isteği başarısız oldu: ${response?.status}`);
        }

        const result = await response.json();
        const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            setGeneratedImage(`data:image/png;base64,${base64Data}`);
        } else {
            const textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.error("API returned a text response instead of an image:", textResponse);
            throw new Error("Görsel oluşturulamadı. Model, resim yerine metin tabanlı bir yanıt verdi. Lütfen farklı bir görsel veya stil ile tekrar deneyin.");
        }

    } catch (err) {
        console.error(err);
        setError(`Bir hata oluştu: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  }, [selectedImage, selectedPrompt]);
  
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `3dfigur-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);


  return (
    <div className="bg-[#31006e] text-white min-h-screen font-sans">
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
                3D Figür <span className="text-[#f7ba0c]">AI</span>
            </h1>
            <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">Yapay zeka ile fotoğraflarınızı saniyeler içinde göz alıcı 3D figürlere dönüştürün!</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Sol Panel: Girişler */}
            <div className="bg-black/20 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold mb-3 text-[#f7ba0c]">1. Fotoğrafını Yükle</h2>
                    <label htmlFor="file-upload" className="cursor-pointer group">
                        <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-600 group-hover:border-[#f7ba0c] transition-all px-6 py-10">
                            {selectedImage ? (
                                <img src={selectedImage} alt="Yüklenen önizleme" className="max-h-64 rounded-lg object-contain" />
                            ) : (
                                <div className="text-center">
                                    <UploadIcon />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-400 justify-center">
                                        <p className="pl-1">Bir dosya seçin veya sürükleyip bırakın</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF (10MB'a kadar)</p>
                                </div>
                            )}
                        </div>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4 text-[#f7ba0c]">2. Bir Stil Seç</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PROMPTS.map((prompt) => (
                            <button
                                key={prompt.id}
                                onClick={() => setSelectedPromptId(prompt.id)}
                                className={`p-3 text-center rounded-lg transition-all duration-200 text-sm font-semibold border ${
                                    selectedPromptId === prompt.id
                                        ? 'bg-[#d61545] text-white border-[#d61545] shadow-lg'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {prompt.title}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerateImage}
                    disabled={!selectedImage || !selectedPromptId || isLoading}
                    className="w-full mt-auto py-3 px-4 rounded-lg text-lg font-bold text-white bg-[#d61545] hover:bg-[#b8123a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Oluşturuluyor...' : 'Dönüştür'}
                </button>
            </div>

            {/* Sağ Panel: Çıktı */}
            <div className="bg-black/20 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center min-h-[400px] lg:min-h-0">
                <h2 className="text-2xl font-bold mb-4 self-start text-[#f7ba0c]">3. Sonuç</h2>
                <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-300 bg-red-900/50 p-4 rounded-lg text-center">{error}</p>}
                    {!isLoading && !error && generatedImage && (
                        <div className="flex flex-col items-center gap-4">
                            <img src={generatedImage} alt="Oluşturulan görsel" className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-2xl" />
                            <button
                                onClick={handleDownload}
                                title="Görseli indir"
                                className="mt-4 py-2 px-6 rounded-lg font-bold text-white bg-[#f7ba0c] hover:bg-[#d8a20b] transition-all duration-300 flex items-center gap-2"
                            >
                                <DownloadIcon/> İndir
                            </button>
                        </div>
                    )}
                    {!isLoading && !error && !generatedImage && (
                        <p className="text-gray-400">Oluşturulan görseliniz burada görünecek.</p>
                    )}
                </div>
            </div>
        </main>

        <div className="text-center my-12 py-10 px-6 bg-black/20 border border-white/10 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-[#f7ba0c]">Figürünüzü Gerçeğe Dönüştürün!</h2>
            <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
                Oluşturduğunuz bu harika tasarımı çok beğendiyseniz, uzman heykeltıraşlarımız tarafından özenle hazırlanacak fiziksel bir 3D figür olarak sipariş verebilirsiniz.
            </p>
            <a 
                href="https://3dfigur.com/kisiye-ozel-figurler" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 inline-block py-3 px-8 rounded-lg text-lg font-bold text-white bg-[#d61545] hover:bg-[#b8123a] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                Hemen Sipariş Ver
            </a>
        </div>

        <footer className="text-center mt-12 py-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} 3DFigur.com - Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}

