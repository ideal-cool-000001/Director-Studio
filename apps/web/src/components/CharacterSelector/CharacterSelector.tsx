import { useState, useEffect } from 'react';
import { CharacterCard } from './CharacterCard';
import { CharacterDetailModal } from './CharacterDetailModal';
import { characterService, agentService } from '../../services/api';

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

interface CharacterSelectorProps {
  scriptContent?: string;
  projectId: string;
  stylePreset?: string;
  onCharactersSelected: (characters: Character[]) => void;
}

export function CharacterSelector({ scriptContent, projectId, stylePreset = 'anime', onCharactersSelected }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (scriptContent) {
      loadCharacters();
    }
  }, [scriptContent, stylePreset]);

  const loadCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await characterService.design('char-selector', {
        action: 'design',
        script_content: scriptContent,
        style_preset: stylePreset,
        project_id: projectId,
      });

      if (response.data.success && response.data.data) {
        const designData = response.data.data;
        const characterList = designData.characters.map((char: any, idx: number) => ({
          id: `char-${idx}-${Date.now()}`,
          ...char,
          selected: false,
        }));
        setCharacters(characterList);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newIds = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      return newIds;
    });

    setCharacters((prev) =>
      prev.map((char) =>
        char.id === id ? { ...char, selected: !char.selected } : char
      )
    );
  };

  const handleViewDetails = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleGenerateImages = async () => {
    const selectedChars = characters.filter((c) => c.selected);
    if (selectedChars.length === 0) {
      alert('请先选择角色');
      return;
    }

    setIsLoading(true);
    try {
      const prompts = selectedChars.map((char) => ({
        character_name: char.name,
        positive_prompt: char.prompt,
        negative_prompt: char.negative_prompt,
      }));

      await agentService.executeAgent('image_generator', 'char-images', {
        action: 'batch_generate',
        prompts,
        model: 'flux2',
        project_id: projectId,
      });

      onCharactersSelected(selectedChars);
    } catch (error) {
      console.error('Failed to generate images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyStyle = async () => {
    await characterService.checkConsistency('char-consistency', characters, stylePreset);
  };

  const filteredCharacters = characters.filter((char) => {
    if (activeFilter === 'all') return true;
    return char.role_level === activeFilter;
  });

  const stats = {
    all: characters.length,
    '主角': characters.filter((c) => c.role_level === '主角').length,
    '配角': characters.filter((c) => c.role_level === '配角').length,
    '龙套': characters.filter((c) => c.role_level === '龙套').length,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">角色设计</h2>
            <p className="text-sm text-gray-500">共 {characters.length} 个角色</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              onClick={handleApplyStyle}
            >
              检查风格一致性
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              onClick={handleGenerateImages}
              disabled={isLoading || selectedIds.length === 0}
            >
              生成选中角色 ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            全部 ({stats.all})
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === '主角'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('主角')}
          >
            主角 ({stats['主角']})
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === '配角'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('配角')}
          >
            配角 ({stats['配角']})
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === '龙套'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter('龙套')}
          >
            龙套 ({stats['龙套']})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">暂无角色</div>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white"
              onClick={loadCharacters}
            >
              重新加载
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={handleSelect}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onGenerate={() => {
            handleSelect(selectedCharacter.id);
            handleGenerateImages();
          }}
        />
      )}
    </div>
  );
}