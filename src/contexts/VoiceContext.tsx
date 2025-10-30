import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface VoiceSettings {
  enabled: boolean;
  voice?: string;
  speed: number;
  pitch: number;
  autoPlay: boolean;
  fieldToRead?: string;
}

interface VoiceContextType {
  settings: VoiceSettings;
  voices: SpeechSynthesisVoice[];
  isSpeaking: boolean;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<VoiceSettings>) => Promise<void>;
  speak: (text: string, overrideSettings?: Partial<VoiceSettings>) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: false,
    speed: 1.0,
    pitch: 1.0,
    autoPlay: false,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 音声リストを取得
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // 話し中の状態を監視
  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 100);

    return () => clearInterval(checkSpeaking);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice/settings');
      if (!res.ok) throw new Error('Failed to fetch voice settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<VoiceSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const res = await fetch('/api/voice/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      if (!res.ok) throw new Error('Failed to update voice settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const speak = useCallback((text: string, overrideSettings?: Partial<VoiceSettings>) => {
    if (!settings.enabled && !overrideSettings?.enabled) {
      return;
    }

    // 既存の音声を停止
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 設定を適用
    const effectiveSettings = { ...settings, ...overrideSettings };
    utterance.rate = effectiveSettings.speed;
    utterance.pitch = effectiveSettings.pitch;

    // 音声を選択
    if (effectiveSettings.voice) {
      const selectedVoice = voices.find(v => v.name === effectiveSettings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Speech synthesis error');
    };

    window.speechSynthesis.speak(utterance);
  }, [settings, voices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  return (
    <VoiceContext.Provider value={{
      settings,
      voices,
      isSpeaking,
      loading,
      error,
      fetchSettings,
      updateSettings,
      speak,
      stop,
      pause,
      resume,
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}
