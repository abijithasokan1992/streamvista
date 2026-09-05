export type StudioCapabilityKey =
  | 'ai_search'
  | 'logline'
  | 'synopsis'
  | 'script_optimizer'
  | 'shorts_script'
  | 'buyer_matchmaker'
  | 'translation'
  | 'image_generator'
  | 'video_generator'
  | 'voice_generator'
  | 'text_to_speech'
  | 'music_generator'
  | 'ai_character'
  | 'background_remover'
  | 'ai_subtitles'
  | 'ai_dubbing'
  | 'audio_description'
  | 'ai_editing'
  | 'ott_tv_delivery';

export type CapabilityMode = 'live' | 'partial' | 'unavailable';

export interface StudioCapability {
  key: StudioCapabilityKey;
  label: string;
  mode: CapabilityMode;
  backendCapability?: string;
  providerEnv?: string;
  reason: string;
}

export const STUDIO_CAPABILITIES: StudioCapability[] = [
  { key: 'ai_search', label: 'AI Search', mode: 'live', backendCapability: 'chat', reason: 'Uses the authenticated AI text runtime; this is an AI assistant over supplied context, not external web search.' },
  { key: 'logline', label: 'Logline', mode: 'live', backendCapability: 'logline', reason: 'Mapped to the existing production text capability.' },
  { key: 'synopsis', label: 'Synopsis', mode: 'live', backendCapability: 'synopsis', reason: 'Mapped to the existing production text capability.' },
  { key: 'script_optimizer', label: 'Script Optimizer', mode: 'live', backendCapability: 'script_optimizer', reason: 'Mapped to the existing production text capability.' },
  { key: 'shorts_script', label: 'Shorts Script', mode: 'live', backendCapability: 'shorts_script', reason: 'Mapped to the existing production text capability.' },
  { key: 'buyer_matchmaker', label: 'Buyer Matchmaker', mode: 'live', backendCapability: 'buyer_matchmaker', reason: 'Mapped to the existing production text capability.' },
  { key: 'translation', label: 'Video Translation', mode: 'partial', backendCapability: 'chat', reason: 'Text translation can use the LLM runtime; audio/video muxing requires a media worker.' },
  { key: 'image_generator', label: 'Image Generator', mode: 'unavailable', providerEnv: 'OPENAI_API_KEY', reason: 'No production image-generation adapter is present in the current repository.' },
  { key: 'video_generator', label: 'Video Generator', mode: 'unavailable', providerEnv: 'VIDEO_PROVIDER_API_KEY', reason: 'No production video-generation adapter/worker is present in the current repository.' },
  { key: 'voice_generator', label: 'Voice Generator', mode: 'unavailable', providerEnv: 'TTS_PROVIDER_API_KEY', reason: 'No production voice-generation adapter is present in the current repository.' },
  { key: 'text_to_speech', label: 'Text to Speech', mode: 'unavailable', providerEnv: 'TTS_PROVIDER_API_KEY', reason: 'No production TTS adapter is present in the current repository.' },
  { key: 'music_generator', label: 'Music Generator', mode: 'unavailable', providerEnv: 'MUSIC_PROVIDER_API_KEY', reason: 'No production music-generation adapter is present in the current repository.' },
  { key: 'ai_character', label: 'AI Character', mode: 'partial', reason: 'Canonical character persistence exists; image/voice generation is not wired to a production provider.' },
  { key: 'background_remover', label: 'Background Remover', mode: 'unavailable', providerEnv: 'MEDIA_PROVIDER_API_KEY', reason: 'No production background-removal adapter is present in the current repository.' },
  { key: 'ai_subtitles', label: 'AI Subtitles', mode: 'partial', reason: 'Canonical subtitle persistence exists; speech-to-text/media processing worker is still required.' },
  { key: 'ai_dubbing', label: 'AI Dubbing', mode: 'partial', reason: 'Canonical dubbing persistence exists; ASR/TTS/render worker is still required.' },
  { key: 'audio_description', label: 'Audio Description', mode: 'partial', reason: 'Canonical audio-description persistence exists; media generation/render worker is still required.' },
  { key: 'ai_editing', label: 'AI Editing', mode: 'partial', reason: 'Canonical edit/timeline persistence exists; automated render worker is still required.' },
  { key: 'ott_tv_delivery', label: 'OTT / TV Delivery', mode: 'partial', reason: 'Canonical masters, deliverables and delivery-manifest persistence exists; end-to-end delivery execution requires an active worker/provider.' },
];

export function getStudioCapabilities() {
  const configured = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    storage: Boolean(process.env.STORAGE_PROVIDER && (process.env.OCI_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.GCS_BUCKET_NAME)),
  };
  return STUDIO_CAPABILITIES.map((capability) => ({
    ...capability,
    configured,
    runtimeAvailable: capability.mode === 'live' && Boolean(capability.backendCapability),
  }));
}
