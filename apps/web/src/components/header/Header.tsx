// ═══════════════════════════════════════════
// Header — 顶部导航栏
// ═══════════════════════════════════════════

import { useProjectStore } from '@/stores/useProjectStore';
import { useGraphStore } from '@/stores/useGraphStore';
import { NodeType } from '@director/shared-types';

export function Header() {
  const title = useProjectStore((s) => s.title);
  const totalCost = useProjectStore((s) => s.totalCost);
  const budgetLimit = useProjectStore((s) => s.globalConfig.budget_limit);
  const addNode = useGraphStore((s) => s.addNode);

  const usagePercent = budgetLimit > 0 ? (totalCost / budgetLimit) * 100 : 0;

  return (
    <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
      <h1 className="text-sm font-semibold text-white">
        🎬 Director Workflow
      </h1>

      {title && (
        <span className="text-xs text-gray-400 border-l border-gray-700 pl-4">
          {title}
        </span>
      )}

      {/* 快速创建节点按钮 */}
      <div className="flex gap-1 ml-auto">
        {Object.values(NodeType).map((type) => (
          <button
            key={type}
            onClick={() => addNode(type, { x: 200 + Math.random() * 400, y: 200 + Math.random() * 300 })}
            className="px-2 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            + {type}
          </button>
        ))}
      </div>

      {/* 成本追踪 */}
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 50 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">
          ¥{totalCost.toFixed(0)} / ¥{budgetLimit}
        </span>
      </div>
    </header>
  );
}
