import { useState } from 'react';
import { estimateFromText } from '../../lib/claude';
import type { NutritionResponse } from '../../types';

interface Props {
  onResult: (result: NutritionResponse) => void;
  onError: (error: string) => void;
}

export function TextInput({ onResult, onError }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const result = await estimateFromText(text.trim());
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'PFCの推定に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例: 牛丼の大盛り、味噌汁付き"
        rows={3}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600 disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            推定中...
          </>
        ) : (
          'PFCを推定する'
        )}
      </button>
    </div>
  );
}
