import { useState } from 'react';
import { SceneSnapshot } from '../types';

interface LeftPanelProps {
  snapshot: SceneSnapshot;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}

export function LeftPanel({ snapshot, selectedId, onSelect, onToggleVisibility, onDelete }: LeftPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCrowds, setExpandedCrowds] = useState<Set<string>>(new Set());

  const filteredItems = [
    ...snapshot.cameras.map((c) => ({ ...c, type: 'camera' as const })),
    ...snapshot.characters.map((c) => ({ ...c, type: 'character' as const })),
    ...snapshot.props.map((p) => ({ ...p, type: 'prop' as const })),
    ...snapshot.crowdGroups.map((g) => ({ ...g, type: 'crowd' as const })),
  ].filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleCrowd = (id: string) => {
    setExpandedCrowds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'character':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'prop':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'crowd':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColor = (type: string, item: any) => {
    if (type === 'character') return item.color;
    if (type === 'prop') return item.color;
    if (type === 'camera') return item.isActive ? '#22c55e' : '#00d4ff';
    return '#8a8a9a';
  };

  return (
    <div className="w-64 bg-panel border-r border-primary flex flex-col">
      <div className="p-3 border-b border-primary">
        <h2 className="text-primary font-medium text-sm mb-2">场景清单</h2>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-card text-primary text-sm rounded-lg border border-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredItems.length === 0 ? (
          <div className="text-muted text-sm text-center py-8">
            未找到匹配项
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredItems.map((item) => {
              const isSelected = selectedId === item.id;
              const isExpanded = expandedCrowds.has(item.id);

              if (item.type === 'crowd') {
                return (
                  <div key={item.id}>
                    <div
                      onClick={() => {
                        onSelect(item.id);
                        toggleCrowd(item.id);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-accent/15 border border-accent/30' : 'hover:bg-hover'
                      }`}
                    >
                      <svg className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {getIcon(item.type)}
                      <span className={`text-sm flex-1 ${isSelected ? 'text-accent' : 'text-primary'}`}>{item.name}</span>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(item.type, item) }} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(item.id, !item.visible);
                        }}
                        className="text-muted hover:text-primary"
                      >
                        {item.visible ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-6 pl-2.5 border-l border-primary space-y-0.5">
                        {item.characterIds.slice(0, 5).map((charId: string) => {
                          const char = snapshot.characters.find((c) => c.id === charId);
                          if (!char) return null;
                          return (
                            <div
                              key={charId}
                              onClick={() => onSelect(charId)}
                              className={`flex items-center gap-2 px-2.5 py-1 rounded-md cursor-pointer text-sm transition-all ${
                                selectedId === charId ? 'bg-accent/15' : 'hover:bg-hover'
                              }`}
                            >
                              {getIcon('character')}
                              <span className={selectedId === charId ? 'text-accent' : 'text-secondary'}>{char.name}</span>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color }} />
                            </div>
                          );
                        })}
                        {item.characterIds.length > 5 && (
                          <div className="text-muted text-xs px-2.5 py-1">
                            +{item.characterIds.length - 5} 更多...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'bg-accent/15 border border-accent/30' : 'hover:bg-hover'
                  }`}
                >
                  {getIcon(item.type)}
                  <span className={`text-sm flex-1 ${isSelected ? 'text-accent' : 'text-primary'}`}>{item.name}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(item.type, item) }} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(item.id, !(item as any).visible);
                    }}
                    className="text-muted hover:text-primary"
                  >
                    {(item as any).visible ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-muted hover:text-error"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}