import { useState } from 'react';

interface Character {
  id: string;
  name: string;
  role_level: string;
  role_priority: number;
  description: string;
  style_preset: string;
  appearance: {
    hair_style: string;
    hair_color: string;
    eye_color: string;
    height: string;
    body_type: string;
    face_shape: string;
    skin_tone: string;
  };
  clothing: {
    style: string;
    colors: string[];
    details: string;
  };
  props: string[];
  prompt: string;
  negative_prompt: string;
  detail_level: string;
  design_weight: number;
  selected: boolean;
}

interface CharacterCardProps {
  character: Character;
  onSelect: (id: string) => void;
  onViewDetails: (character: Character) => void;
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  '主角': { bg: 'bg-error', text: 'text-on-error' },
  '配角': { bg: 'bg-info', text: 'text-on-info' },
  '龙套': { bg: 'bg-on-surface-variant', text: 'text-surface' },
};

const ROLE_LABELS: Record<string, string> = {
  '主角': '主角',
  '配角': '配角',
  '龙套': '龙套',
};

export function CharacterCard({ character, onSelect, onViewDetails }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-normal cursor-pointer overflow-hidden ${
        character.selected
          ? 'border-primary bg-primary-light/10 shadow-2'
          : 'border-outline bg-surface hover:border-primary/50 hover:shadow-1'
      }`}
      onClick={() => onSelect(character.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-sm left-sm z-10">
        <span className={`px-sm py-xs text-label-xs font-bold rounded-full ${ROLE_STYLES[character.role_level].bg} ${ROLE_STYLES[character.role_level].text}`}>
          {ROLE_LABELS[character.role_level]}
        </span>
      </div>

      <div className="absolute top-sm right-sm z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          character.selected ? 'border-primary bg-primary' : 'border-outline'
        }`}>
          {character.selected && <div className="w-2.5 h-2.5 bg-surface rounded-full" />}
        </div>
      </div>

      <div className="aspect-square bg-gradient-to-br from-surface-muted to-hover flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tertiary/20 to-accent/20 flex items-center justify-center border-2 border-tertiary/30">
          <span className="text-4xl text-primary font-bold">{character.name[0]}</span>
        </div>
      </div>

      <div className="p-md">
        <h3 className="text-title-md font-bold text-on-surface mb-sm">{character.name}</h3>
        <p className="text-body-sm text-on-surface-variant mb-md line-clamp-2">{character.description}</p>

        <div className="space-y-sm text-body-xs">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">发型</span>
            <span className="font-medium text-on-surface">{character.appearance.hair_style}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">发色</span>
            <span className="font-medium text-on-surface">{character.appearance.hair_color}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">服装</span>
            <span className="font-medium text-on-surface">{character.clothing.style}</span>
          </div>
        </div>

        <div className="mt-md flex gap-xs">
          {character.clothing.colors.map((color, idx) => (
            <div
              key={idx}
              className="w-5 h-5 rounded-full border border-outline shadow-1"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-primary/95 text-on-primary p-md flex gap-sm transition-all duration-normal backdrop-blur-sm ${
        isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <button
          className="flex-1 py-sm px-md bg-surface text-primary rounded-lg text-body-sm font-medium transition-all hover:bg-hover"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(character.id);
          }}
        >
          {character.selected ? '取消选择' : '选择'}
        </button>
        <button
          className="flex-1 py-sm px-md bg-on-primary/20 hover:bg-on-primary/30 rounded-lg text-body-sm font-medium transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(character);
          }}
        >
          详情
        </button>
      </div>
    </div>
  );
}