import { useState } from 'react';
import { TransformMode, BodyType, PropEntity } from '../types';
import { CHARACTER_ADD_OPTIONS, GEOMETRY_ADD_OPTIONS } from '../constants';

interface ToolbarProps {
  transformMode: TransformMode;
  onTransformModeChange: (mode: TransformMode) => void;
  onAddCharacter: (bodyType: BodyType) => void;
  onAddProp: (type: PropEntity['type']) => void;
  onAddCrowd: () => void;
  onAddCamera: () => void;
  onPanorama: () => void;
  onScreenshot: () => void;
  onFullscreen: () => void;
}

function AddMenu({
  onAddCharacter,
  onAddProp,
  onAddCrowd,
}: {
  onAddCharacter: (bodyType: BodyType) => void;
  onAddProp: (type: PropEntity['type']) => void;
  onAddCrowd: () => void;
}) {
  const [activeSubmenu, setActiveSubmenu] = useState<'character' | 'prop' | null>(null);

  return (
    <div className="relative">
      <button
        onClick={() => setActiveSubmenu(activeSubmenu ? null : 'character')}
        className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {activeSubmenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-panel rounded-lg shadow-xl border border-primary p-2 min-w-[180px]">
          <div className="mb-2 pb-2 border-b border-primary">
            <button
              onClick={() => setActiveSubmenu('character')}
              className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all ${
                activeSubmenu === 'character' ? 'bg-accent text-black' : 'text-secondary hover:text-primary hover:bg-hover'
              }`}
            >
              角色素体
            </button>
            <button
              onClick={() => setActiveSubmenu('prop')}
              className={`w-full px-2 py-1.5 text-sm rounded-lg transition-all ${
                activeSubmenu === 'prop' ? 'bg-accent text-black' : 'text-secondary hover:text-primary hover:bg-hover'
              }`}
            >
              道具模型
            </button>
          </div>

          {activeSubmenu === 'character' && (
            <div className="grid grid-cols-2 gap-1">
              {CHARACTER_ADD_OPTIONS.map((option) => (
                <button
                  key={option.bodyType}
                  onClick={() => {
                    onAddCharacter(option.bodyType);
                    setActiveSubmenu(null);
                  }}
                  className="px-2 py-1.5 text-sm bg-card hover:bg-hover text-secondary hover:text-primary rounded-lg border border-primary transition-all"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {activeSubmenu === 'prop' && (
            <div className="grid grid-cols-2 gap-1">
              {GEOMETRY_ADD_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    onAddProp(option.type);
                    setActiveSubmenu(null);
                  }}
                  className="px-2 py-1.5 text-sm bg-card hover:bg-hover text-secondary hover:text-primary rounded-lg border border-primary transition-all"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-primary">
            <button
              onClick={() => {
                onAddCrowd();
                setActiveSubmenu(null);
              }}
              className="w-full px-2 py-1.5 text-sm bg-card hover:bg-hover text-secondary hover:text-primary rounded-lg border border-primary transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              群众阵列
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Toolbar({
  transformMode,
  onTransformModeChange,
  onAddCharacter,
  onAddProp,
  onAddCrowd,
  onAddCamera,
  onPanorama,
  onScreenshot,
  onFullscreen,
}: ToolbarProps) {
  return (
    <div className="h-12 bg-panel border-t border-primary flex items-center justify-center gap-3 px-5">
      <div className="flex items-center gap-1 bg-card rounded-lg p-0.5">
        <button
          onClick={() => onTransformModeChange('translate')}
          className={`p-2 rounded-md transition-all ${
            transformMode === 'translate'
              ? 'bg-accent text-black'
              : 'text-secondary hover:text-primary hover:bg-hover'
          }`}
          title="移动 (V)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <button
          onClick={() => onTransformModeChange('rotate')}
          className={`p-2 rounded-md transition-all ${
            transformMode === 'rotate'
              ? 'bg-accent text-black'
              : 'text-secondary hover:text-primary hover:bg-hover'
          }`}
          title="旋转 (R)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={() => onTransformModeChange('scale')}
          className={`p-2 rounded-md transition-all ${
            transformMode === 'scale'
              ? 'bg-accent text-black'
              : 'text-secondary hover:text-primary hover:bg-hover'
          }`}
          title="缩放 (S)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
      </div>

      <div className="w-px h-6 bg-primary" />

      <AddMenu
        onAddCharacter={onAddCharacter}
        onAddProp={onAddProp}
        onAddCrowd={onAddCrowd}
      />

      <div className="w-px h-6 bg-primary" />

      <button
        onClick={onPanorama}
        className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        title="全景背景"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        全景图
      </button>

      <button
        onClick={onAddCamera}
        className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        title="添加机位"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        添加机位
      </button>

      <button
        onClick={onScreenshot}
        className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        title="截图 (C)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        截图
      </button>

      <button
        onClick={onFullscreen}
        className="flex items-center gap-2 px-3 py-2 bg-card hover:bg-hover text-secondary hover:text-primary text-sm rounded-lg border border-primary transition-all"
        title="全屏"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        全屏
      </button>
    </div>
  );
}