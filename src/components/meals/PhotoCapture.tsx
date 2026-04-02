import { useState, useRef } from 'react';
import { analyzePhoto } from '../../lib/claude';
import type { NutritionResponse } from '../../types';

interface Props {
  onResult: (result: NutritionResponse, photoBlob: Blob) => void;
  onError: (error: string) => void;
}

function resizeImage(file: File): Promise<{ base64: string; mimeType: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxSize = 1024;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('画像の変換に失敗'));
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve({ base64, mimeType: 'image/jpeg', blob });
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.7
      );
    };
    img.onerror = () => reject(new Error('画像の読み込みに失敗'));
    img.src = url;
  });
}

export function PhotoCapture({ onResult, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const { base64, mimeType, blob } = await resizeImage(file);
      const result = await analyzePhoto(base64, mimeType);
      onResult(result, blob);
    } catch (err) {
      onError(err instanceof Error ? err.message : '写真の解析に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <img src={preview} alt="プレビュー" className="w-full h-48 object-cover rounded-xl" />
          {loading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm">解析中...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
            <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
            <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">写真を撮影・選択</span>
        </button>
      )}

      {!loading && preview && (
        <button
          onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ''; }}
          className="w-full py-2 text-sm text-gray-500 underline"
        >
          別の写真を選択
        </button>
      )}
    </div>
  );
}
