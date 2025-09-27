import React, { useState, useCallback, useMemo } from 'react';

// Sabit olarak tanımlanmış prompt'lar
const PROMPTS = [
  {
    id: 1,
    title: 'Chibi Stili',
    prompt: "Create a 3D rendered full-body character of the person in the photo in a Chibi/Funko style. The character should have a large head, small body, and cute, endearing features with big expressive eyes. The final image should have a clean, solid white studio background. The character should be the main focus."
  },
  {
    id: 2,
    title: 'Funko Stili',
    prompt: "Create a 3D rendered full-body character of the person in the photo in the style of a Funko Pop vinyl figure. The character should have the classic Funko proportions: oversized head, small body, and black button-like eyes. The final image should have a clean, solid white studio background, focusing entirely on the figure."
  },
  {
    id: 3,
    title: 'Pixar Stili',
    prompt: "Create a 3D rendered, full-body character of the person in the photo in the iconic style of a Pixar animated movie character. The character should have expressive features, detailed textures (hair, clothing), and dynamic lighting. The final image must have a plain, solid white studio background."
  },
  {
    id: 4,
    title: 'Hasbro/Mattel Figürü',
    prompt: "Create a 3D render of a commercialized action figure of the person in the photo, in the style of a modern Hasbro or Mattel toy. The figure should have articulated joints and a clean, polished plastic texture. The final image should be a product shot on a clean, solid white studio background."
  },
  {
    id: 5,
    title: 'Roma Büstü',
    prompt: "Create a masterpiece marble bust of the person in the photo, in the style of a classical Roman sculptor. The sculpture must be crafted from a single block of Carrara marble, showing subtle veining and natural stone imperfections. The result must look like solid, intricately carved stone. Strictly preserve the person’s face and identity. The bust is placed on a simple pedestal against a plain, solid white studio background."
  },
  {
      id: 6,
      title: 'Modern Oyuncak Figür',
      prompt: "A 3D render of a stylized, cartoonish action figure resembling the person in the uploaded photo. The figure should have simplified, smooth features characteristic of a modern Mattel or Hasbro toy line (e.g., Fisher-Price Imaginext, Funko Pop! in 3D, or a friendly corporate mascot style). It should clearly retain the recognizable facial features and outfit of the individual, but translated into a smooth, clean, plastic-like texture with simplified anatomy and proportions. The pose should match the photo. The figure stands on a simple, round toy display base. The background is a plain, solid studio color."
  }
];


// SVG İkonları
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
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
        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        
        // --- DEĞİŞİKLİK BURADA ---
        // API anahtarını artık ortam değişkeninden alıyoruz.
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
        
        if (!apiKey) {
            throw new Error("API anahtarı bulunamadı. Lütfen site yöneticisi ile iletişime geçin.");
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API isteği başarısız oldu: ${response.status}`);
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

    fetch(generatedImage)
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "3dfigur-ai-sonuc.png";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(err => {
            console.error("İndirme işlemi sırasında hata:", err);
            setError("Görsel indirilirken bir hata oluştu. Lütfen tekrar deneyin.");
        });
  }, [generatedImage]);


  return (
    <div className="bg-[#31006e] text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white">
                3D Figür <span className="text-[#f7ba0c]">AI</span>
            </h1>
            <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">Yapay zeka ile fotoğraflarınızı saniyeler içinde göz alıcı 3D figürlere dönüştürün!</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Sol Panel: Girişler */}
          <div className="bg-black bg-opacity-20 p-6 rounded-2xl shadow-2xl flex flex-col gap-6 border border-white/10">
            <div>
              <h2 className="text-2xl font-bold mb-3 text-[#f7ba0c]">1. Fotoğrafını Yükle</h2>
              <label htmlFor="file-upload" className="cursor-pointer group">
                <div className="mt-2 flex justify-center items-center rounded-lg border-2 border-dashed border-gray-500 hover:border-[#f7ba0c] transition-all px-6 py-10 min-h-[250px]">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Yüklenen önizleme" className="max-h-64 rounded-lg object-contain" />
                  ) : (
                    <div className="text-center">
                       <UploadIcon />
                      <div className="mt-4 flex text-sm leading-6 text-gray-400">
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
                    className={`p-3 text-center rounded-lg transition-all duration-200 text-sm font-semibold border-2 ${
                      selectedPromptId === prompt.id
                        ? 'bg-[#d61545] text-white border-[#d61545] shadow-lg'
                        : 'bg-white/10 border-transparent hover:border-white/50 hover:bg-white/20'
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
              className="w-full mt-auto py-4 px-4 rounded-lg text-lg font-bold text-white bg-[#d61545] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? 'Dönüştürülüyor...' : 'Dönüştür'}
            </button>
          </div>

          {/* Sağ Panel: Çıktı */}
          <div className="bg-black bg-opacity-20 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center min-h-[500px] lg:min-h-0 border border-white/10">
            <h2 className="text-2xl font-bold mb-4 self-start text-[#f7ba0c]">3. Sonuç</h2>
            <div className="w-full h-full flex items-center justify-center">
                {isLoading && <LoadingSpinner />}
                {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg text-center">{error}</p>}
                {!isLoading && !error && generatedImage && (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <img src={generatedImage} alt="Oluşturulan görsel" className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-2xl" />
                        <button
                            onClick={handleDownload}
                            title="Görseli İndir"
                            className="mt-4 py-2 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-all duration-300 flex items-center gap-2"
                        >
                            <DownloadIcon/> İndir
                        </button>
                    </div>
                )}
                {!isLoading && !error && !generatedImage && (
                    <p className="text-gray-500 text-center">Oluşturulan görseliniz burada görünecek.</p>
                )}
            </div>
          </div>
        </main>
        
        <footer className="text-center mt-12 bg-black bg-opacity-20 p-6 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold text-[#f7ba0c]">Figürünüzü Gerçeğe Dönüştürün!</h3>
            <p className="text-gray-300 mt-2 max-w-2xl mx-auto">Oluşturduğunuz bu harika tasarımı çok beğendiyseniz, uzman heykeltıraşlarımız tarafından özenle hazırlanacak fiziksel bir 3D figür olarak sipariş verebilirsiniz.</p>
            <a 
                href="https://3dfigur.com/kisiye-ozel-figurler" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 py-3 px-8 rounded-lg font-bold text-white bg-[#d61545] hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
                Hemen Sipariş Ver
            </a>
            <p className="text-gray-500 text-sm mt-6">© 2025 3DFigur.com - Tüm hakları saklıdır.</p>
        </footer>

      </div>
    </div>
  );
}
