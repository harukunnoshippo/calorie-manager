import { useState } from 'react';
import { BADGES } from '../../lib/badges';
import { useBadgeStats } from '../../hooks/useBadgeStats';

export function BadgesCard() {
  const stats = useBadgeStats();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const earnedCount = BADGES.filter((b) => b.check(stats)).length;
  const selected = BADGES.find((b) => b.id === selectedId);
  const selectedEarned = selected ? selected.check(stats) : false;

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-700">達成バッジ</span>
        <span className="text-xs text-gray-400">{earnedCount} / {BADGES.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {BADGES.map((badge) => {
          const earned = badge.check(stats);
          return (
            <button
              key={badge.id}
              onClick={() => setSelectedId(badge.id)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl p-1 transition ${
                earned ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-gray-50'
              }`}
            >
              <span className={`text-2xl ${earned ? '' : 'grayscale opacity-30'}`}>{badge.emoji}</span>
              <span className={`text-[9px] mt-0.5 text-center leading-tight ${earned ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {badge.name}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setSelectedId(null)}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <div className={`text-5xl mb-2 ${selectedEarned ? '' : 'grayscale opacity-30'}`}>{selected.emoji}</div>
            <h3 className="text-base font-bold text-gray-800 mb-1">{selected.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{selected.description}</p>
            <p className={`text-xs font-medium mb-4 ${selectedEarned ? 'text-emerald-500' : 'text-gray-400'}`}>
              {selectedEarned ? '✓ 達成済み' : '未達成'}
            </p>
            <button
              onClick={() => setSelectedId(null)}
              className="px-4 py-2 bg-gray-100 text-sm text-gray-600 rounded-lg hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
