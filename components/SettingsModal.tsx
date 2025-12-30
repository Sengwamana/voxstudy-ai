import React, { useState, useEffect } from 'react';
import { ApiConfig, DEFAULT_VOICE_ID, StudyMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
  initialConfig: ApiConfig;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  onClearHistory?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialConfig,
    voiceEnabled,
    onVoiceToggle,
    onClearHistory
}) => {
  const [config, setConfig] = useState<ApiConfig>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1915]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-[#FAF9F6] border border-[#DEDBD4] rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Settings</h2>

        {/* Study Mode Selection */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Mode</label>
            <div className="grid grid-cols-1 gap-2">
                {(Object.keys(MODE_CONFIGS) as StudyMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setConfig({ ...config, studyMode: mode })}
                        className={`text-left px-4 py-3 rounded-lg border transition-all ${
                            config.studyMode === mode 
                            ? 'border-[#D97706] bg-[#FEF3C7] text-[#B45309]' 
                            : 'border-[#DEDBD4] bg-white hover:border-[#D97706] hover:bg-[#FEF3C7]/50 text-[#1A1915]'
                        }`}
                    >
                        <div className="font-medium text-sm">{MODE_CONFIGS[mode].label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 opacity-80">
                            {mode === 'tutor' && 'Detailed explanations and analogies.'}
                            {mode === 'quiz' && 'Rapid-fire questions to test you.'}
                            {mode === 'eli5' && 'Simple language for easy understanding.'}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* User Preferences */}
        <div className="mb-6">
           <div className="flex items-center justify-between">
              <div>
                 <label className="block text-sm font-medium text-gray-700">Voice Output</label>
                 <p className="text-xs text-gray-500">Enable spoken answers</p>
              </div>
              <button 
                onClick={() => onVoiceToggle(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2 ${voiceEnabled ? 'bg-[#D97706]' : 'bg-gray-200'}`}
              >
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm ${voiceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
           </div>
        </div>

        {/* Advanced / Voice ID */}
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Voice ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                value={config.elevenLabsVoiceId}
                onChange={(e) => setConfig({ ...config, elevenLabsVoiceId: e.target.value })}
                placeholder={DEFAULT_VOICE_ID}
              />
              <p className="text-[10px] text-gray-400 mt-1">ElevenLabs Voice ID (Optional)</p>
            </div>
            
            {onClearHistory && (
                <div className="pt-2">
                    <button 
                        onClick={() => {
                            if(confirm('Are you sure you want to clear your study history?')) {
                                onClearHistory();
                                onClose();
                            }
                        }}
                        className="text-red-500 text-sm hover:text-red-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Clear History
                    </button>
                </div>
            )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
                onSave(config);
                onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all text-sm font-semibold active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};