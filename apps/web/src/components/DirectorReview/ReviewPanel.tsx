import { useState } from 'react';
import { agentService } from '../../services/api';

interface ReviewItem {
  nodeId: string;
  nodeType: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewFeedback?: string;
  qualityScore?: number;
  cost: number;
  result: any;
  createdAt: string;
}

interface ReviewPanelProps {
  projectId: string;
  pendingItems: ReviewItem[];
  onRefresh: () => void;
}

export function ReviewPanel({ projectId, pendingItems, onRefresh }: ReviewPanelProps) {
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (item: ReviewItem) => {
    setIsProcessing(true);
    try {
      await agentService.approve(projectId, item.nodeId);
      onRefresh();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (item: ReviewItem) => {
    if (!feedback.trim()) {
      alert('请填写反馈意见');
      return;
    }

    setIsProcessing(true);
    try {
      await agentService.reject(projectId, item.nodeId, feedback);
      setFeedback('');
      setSelectedItem(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = async (item: ReviewItem) => {
    if (!feedback.trim()) {
      alert('请填写反馈意见');
      return;
    }

    setIsProcessing(true);
    try {
      await agentService.feedback(projectId, item.nodeId, feedback);
      setFeedback('');
      onRefresh();
    } catch (error) {
      console.error('Failed to send feedback:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'character_designer': '👤',
      'scene_designer': '🌆',
      'image_generator': '🖼️',
      'video_generator': '🎥',
      'audio_producer': '🎵',
      'editor': '✂️',
      'promotion': '📢',
      'screenwriter': '📝',
    };
    return icons[type] || '📦';
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-blue-500';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">导演审核台</h2>
            <p className="text-sm text-gray-500">待审核: {pendingItems.length} 项</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
            onClick={onRefresh}
          >
            刷新
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r border-gray-200 overflow-auto">
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🎉</div>
              <div>暂无待审核项目</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingItems.map((item) => (
                <div
                  key={item.nodeId}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedItem?.nodeId === item.nodeId
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedItem(item);
                    setFeedback(item.reviewFeedback || '');
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getNodeIcon(item.nodeType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.nodeType}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getQualityColor(item.qualityScore)}`} />
                          <span className="text-xs text-gray-500">{item.qualityScore?.toFixed(2) || '--'}</span>
                        </div>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">¥{item.cost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      item.status === 'approved' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {item.status === 'pending' ? '待审核' : item.status === 'approved' ? '已通过' : '已拒绝'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-white">
          {selectedItem ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getNodeIcon(selectedItem.nodeType)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedItem.title}</h3>
                    <p className="text-sm text-gray-500">{selectedItem.nodeType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">创建时间</div>
                  <div className="text-sm text-gray-600">{selectedItem.createdAt}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">生成结果</h4>
                <div className="font-mono text-sm text-gray-700 max-h-60 overflow-auto">
                  {JSON.stringify(selectedItem.result, null, 2)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">质量评分</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getQualityColor(selectedItem.qualityScore)}`}
                        style={{ width: `${(selectedItem.qualityScore || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    (selectedItem.qualityScore || 0) >= 0.9 ? 'text-green-600' :
                    (selectedItem.qualityScore || 0) >= 0.7 ? 'text-blue-600' :
                    (selectedItem.qualityScore || 0) >= 0.5 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(selectedItem.qualityScore || 0).toFixed(2)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {selectedItem.qualityScore && selectedItem.qualityScore >= 0.9 ? '优秀' :
                   selectedItem.qualityScore && selectedItem.qualityScore >= 0.7 ? '良好' :
                   selectedItem.qualityScore && selectedItem.qualityScore >= 0.5 ? '一般' :
                   '较差'}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">反馈意见</h4>
                <textarea
                  className="w-full h-24 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入反馈意见..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  onClick={() => handleApprove(selectedItem)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '✅ 批准通过'}
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                  onClick={() => handleFeedback(selectedItem)}
                  disabled={isProcessing || !feedback.trim()}
                >
                  {isProcessing ? '处理中...' : '💬 提交反馈'}
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  onClick={() => handleReject(selectedItem)}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '❌ 拒绝'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">👆</div>
                <div>请选择一个待审核项目</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}