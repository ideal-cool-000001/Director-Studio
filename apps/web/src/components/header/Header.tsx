import { useProjectStore } from '@/stores/useProjectStore';
import { useGraphStore } from '@/stores/useGraphStore';
import { NodeType } from '@director/shared-types';

export function Header() {
  const title = useProjectStore((s) => s.title);
  const totalCost = useProjectStore((s) => s.totalCost);
  const budgetLimit = useProjectStore((s) => s.globalConfig.budget_limit);
  const credits = useProjectStore((s) => s.credits);
  const addNode = useGraphStore((s) => s.addNode);

  const usagePercent = budgetLimit > 0 ? (totalCost / budgetLimit) * 100 : 0;

  return (
    <header className="h-14 bg-surface border-b border-outline flex items-center px-lg gap-lg shrink-0">
      <h1 className="text-title-md font-semibold text-primary flex items-center gap-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
        Director Workflow
      </h1>

      {title && (
        <span className="text-body-sm text-on-surface-variant border-l border-outline pl-lg">
          {title}
        </span>
      )}

      <div className="flex gap-xs ml-auto">
        {Object.values(NodeType).map((type) => (
          <button
            key={type}
            onClick={() => addNode(type, { x: 200 + Math.random() * 400, y: 200 + Math.random() * 300 })}
            className="px-sm py-xs text-body-xs rounded-full bg-surface-muted hover:bg-hover text-on-surface-variant hover:text-on-surface border border-transparent hover:border-outline transition-all duration-normal"
          >
            + {type}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-md border-l border-outline pl-lg">
        <div className="flex items-center gap-sm">
          <svg className="w-4 h-4 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-body-sm font-medium text-on-surface">{credits}</span>
        </div>

        <div className="w-28 h-2 bg-surface-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-slow ${
              usagePercent >= 80 ? 'bg-error' : usagePercent >= 50 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        <span className="text-body-xs text-on-surface-variant">
          ¥{totalCost.toFixed(0)} / ¥{budgetLimit}
        </span>
      </div>
    </header>
  );
}