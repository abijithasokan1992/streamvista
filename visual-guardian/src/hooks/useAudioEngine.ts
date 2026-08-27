import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';

export type SafetyLevel = 'SAFE' | 'ALERT' | 'DANGER';

interface SoundMemory {
  label: string;
  confirmed: boolean;
  timestamp: number | Timestamp;
  location: { lat: number; lng: number } | null;
}

interface GuardianStrategy {
  id: string;
  title: string;
  description: string;
  type: 'PREVENTION' | 'EFFICIENCY' | 'COMFORT';
}

interface AudioData {
  level: number;
  leftLevel: number;
  rightLevel: number;
  safetyLevel: SafetyLevel;
  transcript: string;
  detectedSound: string | null;
  suggestions: string[];
  history: SoundMemory[];
  activeStrategies: GuardianStrategy[];
}

export const useAudioEngine = (isMonitoring: boolean) => {
  const [audioData, setAudioData] = useState<AudioData>({
    level: 0,
    leftLevel: 0,
    rightLevel: 0,
    safetyLevel: 'SAFE',
    transcript: '',
    detectedSound: null,
    suggestions: [],
    history: [],
    activeStrategies: [],
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserLRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const safetyTimeoutRef = useRef<any>(null);
  const currentLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Haptic Feedback Logic
  const triggerVibration = (level: SafetyLevel) => {
    if ("vibrate" in navigator) {
      if (level === 'DANGER') navigator.vibrate([500, 100, 500, 100, 500]);
      else if (level === 'ALERT') navigator.vibrate([200, 100, 200]);
    }
  };

  // 1. Sync History from Firebase
  useEffect(() => {
    const q = query(collection(db, "sound_history"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history: SoundMemory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          label: data.label,
          confirmed: data.confirmed,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
          location: data.location,
        });
      });
      setAudioData(prev => ({ ...prev, history }));
    });

    return () => unsubscribe();
  }, []);

  // 2. Get Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((pos) => {
        currentLocationRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      });
    }
  }, []);

  // 3. Strategy Engine: Analyze history and implement plans
  useEffect(() => {
    const analyzeHistory = () => {
      const history = audioData.history;
      if (history.length < 3) return;

      const strategies: GuardianStrategy[] = [];

      // Danger Zone Detection
      const dangerSpots = history.filter(h => h.label.includes('DANGER') || (h.confirmed && h.label.includes('ALERT')));
      if (dangerSpots.length >= 2) {
        strategies.push({
          id: 'danger-zone',
          title: 'CLOUD-SYNCED SAFETY PLAN',
          description: 'Historical data confirms this as a high-alert zone. Protective measures active.',
          type: 'PREVENTION'
        });
      }

      // Nightingale/Comfort Sound Strategy
      const comfortSounds = history.filter(h => h.label.toLowerCase().includes('nightingale') && h.confirmed);
      if (comfortSounds.length > 0) {
          strategies.push({
              id: 'comfort-mode',
              title: 'AWARENESS PLAN',
              description: 'Nightingale presence remembered here. Enhancing auditory clarity.',
              type: 'COMFORT'
          });
      }

      setAudioData(prev => ({ ...prev, activeStrategies: strategies }));
    };

    analyzeHistory();
  }, [audioData.history.length]);

  useEffect(() => {
    if (!isMonitoring) {
      if (audioContextRef.current) audioContextRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
        });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const splitter = audioContextRef.current.createChannelSplitter(2);
        
        analyserLRef.current = audioContextRef.current.createAnalyser();
        analyserRRef.current = audioContextRef.current.createAnalyser();
        
        source.connect(splitter);
        splitter.connect(analyserLRef.current, 0);
        splitter.connect(analyserRRef.current, 1);
        
        analyserLRef.current.fftSize = 256;
        analyserRRef.current.fftSize = 256;
        
        const dataL = new Uint8Array(analyserLRef.current.frequencyBinCount);
        const dataR = new Uint8Array(analyserRRef.current.frequencyBinCount);

        const checkLevel = () => {
          if (!analyserLRef.current || !analyserRRef.current) return;
          analyserLRef.current.getByteFrequencyData(dataL);
          analyserRRef.current.getByteFrequencyData(dataR);
          
          const getAvg = (arr: Uint8Array) => {
              let sum = 0;
              for (let i = 0; i < arr.length; i++) sum += arr[i];
              return (sum / arr.length / 255) * 100;
          };

          const left = getAvg(dataL);
          const right = getAvg(dataR);
          const level = Math.max(left, right);
          
          let currentSafety: SafetyLevel = 'SAFE';
          if (level > 80) currentSafety = 'DANGER';
          else if (level > 50) currentSafety = 'ALERT';

          setAudioData(prev => {
            if (currentSafety !== prev.safetyLevel && currentSafety !== 'SAFE') {
                triggerVibration(currentSafety);
            }

            const newSafety = currentSafety === 'DANGER' ? 'DANGER' : 
                             (currentSafety === 'ALERT' && prev.safetyLevel !== 'DANGER' ? 'ALERT' : 
                             (prev.safetyLevel));

            if (currentSafety !== 'SAFE') {
                if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = setTimeout(() => {
                    setAudioData(p => ({ ...p, safetyLevel: 'SAFE', detectedSound: null, suggestions: [] }));
                }, 5000);
            }

            return { ...prev, level, leftLevel: left, rightLevel: right, safetyLevel: currentSafety !== 'SAFE' ? newSafety : prev.safetyLevel };
          });

          requestAnimationFrame(checkLevel);
        };

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          
          recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            setAudioData(prev => ({ ...prev, transcript }));
            
            if (transcript.includes('train')) {
              setAudioData(prev => ({ ...prev, suggestions: [...new Set([...prev.suggestions, "Did you hear a train passing?"])] }));
            }
            if (transcript.includes('bird') || transcript.includes('nightingale')) {
              setAudioData(prev => ({ ...prev, suggestions: [...new Set([...prev.suggestions, "Was that a Nightingale singing?"])] }));
            }
          };
          recognitionRef.current.start();
        }

        checkLevel();
      } catch (err) { console.error(err); }
    };

    startAudio();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isMonitoring]);

  const confirmSound = async (label: string, confirmed: boolean) => {
    const entry = {
      label,
      confirmed,
      timestamp: Timestamp.now(),
      location: currentLocationRef.current,
    };
    
    try {
      await addDoc(collection(db, "sound_history"), entry);
      setAudioData(prev => ({
        ...prev,
        suggestions: prev.suggestions.filter(s => !s.includes(label))
      }));
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return { audioData, confirmSound };
};
