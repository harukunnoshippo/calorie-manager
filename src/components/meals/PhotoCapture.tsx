import { useState, useRef } from 'react';
import { analyzePhoto } from '../../lib/claude';
import type { NutritionResponse } from '../../types';

export interface PhotoResult {
  result: NutritionResponse;
  blob: Blob;
}

interface Props {
  onResult: (result: NutritionResponse, photoBlob: Blob) => void;
  onResults: (results: PhotoResult[]) => void;
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

export function PhotoCapture({ onResult, onResults, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Single file: use original behavior (camera or single gallery pick)
    if (fileArray.length === 1) {
      const file = fileArray[0];
      setPreviews([URL.createObjectURL(file)]);
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
      return;
    }

    // Multiple files: process all and return batch results
    setPreviews(fileArray.map((f) => URL.createObjectURL(f)));
    setLoading(true);
    setProgress({ current: 0, total: fileArray.length });

    const results: PhotoResult[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      setProgress({ current: i + 1, total: fileArray.length });
      try {
        const { base64, mimeType, blob } = await resizeImage(fileArray[i]);
        const result = await analyzePhoto(base64, mimeType);
        results.push({ result, blob });
      } catch (err) {
        errors.push(`${i + 1}枚目: ${err instanceof Error ? err.message : '解析失敗'}`);
      }
    }

    setLoading(false);

    if (errors.length > 0 && results.length === 0) {
      onError(errors.join('\n'));
    } else {
      if (errors.length > 0) {
        onError(`${errors.length}枚の解析に失敗しました（${results.length}枚は成功）`);
      }
      if (results.length > 0) {
        onResults(results);
      }
    }
  };

  const resetPreview = () => {
    setPreviews([]);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFile}
        className="hidden"
      />

      {previews.length > 0 ? (
        <div className="relative">
          {previews.length === 1 ? (
            <img src={previews[0]} alt="プレビュー" className="w-full h-48 object-cover rounded-xl" />
          ) : (
            <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
              {previews.map((src, i) => (
                <img key={i} src={src} alt={`プレビュー ${i + 1}`} className="w-full h-24 object-cover" />
              ))}
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white text-sm">
                  {progress.total > 1
                    ? `${progress.current}/${progress.total}枚 解析中...`
                    : '解析中...'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex-1 h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">撮影する</span>
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="flex-1 h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">写真を選択（複数可）</span>
          </button>
        </div>
      )}

      {!loading && previews.length > 0 && (
        <button
          onClick={resetPreview}
          className="w-full py-2 text-sm text-gray-500 underline"
        >
          別の写真を選択
        </button>
      )}
    </div>
  );
}
