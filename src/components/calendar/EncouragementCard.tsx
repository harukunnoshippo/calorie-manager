import { useBadgeStats } from '../../hooks/useBadgeStats';
import { getEncouragementMessage } from '../../lib/encouragement';

export function EncouragementCard() {
  const stats = useBadgeStats();
  const { emoji, message } = getEncouragementMessage(stats);

  return (
    <div className="mt-4 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{emoji}</span>
        <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      </div>
    </div>
  );
}
