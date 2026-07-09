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

interface CharacterDetailModalProps {
  character: Character;
  onClose: () => void;
  onGenerate: () => void;
}

export function CharacterDetailModal({ character, onClose, onGenerate }: CharacterDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-6xl text-white font-bold">{character.name[0]}</span>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-12rem)]">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{character.name}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              character.role_level === '主角' ? 'bg-red-100 text-red-600' :
              character.role_level === '配角' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {character.role_level}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{character.description}</p>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">外貌特征</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">发型</span>
                  <span className="font-medium text-gray-800">{character.appearance.hair_style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">发色</span>
                  <span className="font-medium text-gray-800">{character.appearance.hair_color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">眼睛颜色</span>
                  <span className="font-medium text-gray-800">{character.appearance.eye_color}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">身高</span>
                  <span className="font-medium text-gray-800">{character.appearance.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">体型</span>
                  <span className="font-medium text-gray-800">{character.appearance.body_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">脸型</span>
                  <span className="font-medium text-gray-800">{character.appearance.face_shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">肤色</span>
                  <span className="font-medium text-gray-800">{character.appearance.skin_tone}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">服装与道具</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm">服装风格</span>
                  <div className="font-medium text-gray-800">{character.clothing.style}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">颜色</span>
                  <div className="flex gap-2 mt-1">
                    {character.clothing.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">细节</span>
                  <div className="text-sm text-gray-600">{character.clothing.details}</div>
                </div>
                {character.props.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-sm">道具</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {character.props.map((prop, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">生成提示词</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              {character.prompt}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">负面提示词</h3>
            <div className="bg-gray-100 text-gray-600 p-3 rounded-lg font-mono text-xs">
              {character.negative_prompt}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">设计权重</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${character.design_weight * 100}%` }}
                />
              </div>
              <span className="font-medium text-gray-600">{character.design_weight}</span>
            </div>
            <div>
              <span className="text-gray-500">细节级别</span>
              <span className="ml-2 font-medium text-gray-700">
                {character.detail_level === 'high' ? '高' : character.detail_level === 'medium' ? '中' : '低'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            onClick={onClose}
          >
            关闭
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
            onClick={onGenerate}
          >
            生成此角色图像
          </button>
        </div>
      </div>
    </div>
  );
}