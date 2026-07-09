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

const ROLE_COLORS: Record<string, string> = {
  '主角': 'bg-red-500',
  '配角': 'bg-blue-500',
  '龙套': 'bg-gray-500',
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
      className={`relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
        character.selected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(character.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${ROLE_COLORS[character.role_level]}`}>
          {ROLE_LABELS[character.role_level]}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          character.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
        }`}>
          {character.selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>

      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-4xl text-white font-bold">{character.name[0]}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{character.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{character.description}</p>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>发型</span>
            <span className="font-medium">{character.appearance.hair_style}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>发色</span>
            <span className="font-medium">{character.appearance.hair_color}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>服装</span>
            <span className="font-medium">{character.clothing.style}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {character.clothing.colors.map((color, idx) => (
            <div
              key={idx}
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gray-800 text-white p-3 flex gap-2 transition-all duration-300 ${
        isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <button
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(character.id);
          }}
        >
          {character.selected ? '取消选择' : '选择'}
        </button>
        <button
          className="flex-1 py-2 px-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
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