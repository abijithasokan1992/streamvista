import { useState } from 'react';
import './App.css';
import { useAudioEngine } from './hooks/useAudioEngine';
import { MapPin, History, Check, X, Bell, Shield, BrainCircuit, AlertOctagon } from 'lucide-react';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { audioData, confirmSound } = useAudioEngine(isMonitoring);
  const [showHistory, setShowHistory] = useState(false);

  const triggerSOS = async () => {
    // 1. Force Danger State
    navigator.vibrate([1000, 200, 1000]);
    
    // 2. Log Emergency to Firebase
    await confirmSound("🆘 EMERGENCY SOS TRIGGERED", true);
    
    // 3. Simple Alert
    alert("SOS ALERT SENT TO CLOUD. Current location logged.");
  };

  return (
    <div className={`app-container ${audioData.safetyLevel === 'DANGER' ? 'flash-red' : (audioData.safetyLevel === 'ALERT' ? 'flash-yellow' : '')}`}>
      
      {/* Header Status */}
      <div className="header">
        <div className="status-badge">
          <Shield size={24} color={audioData.safetyLevel === 'SAFE' ? '#00ff41' : '#fff'} />
          <span className="status-text">{audioData.safetyLevel}</span>
        </div>
        
        {/* Strategy Engine Indicator */}
        {audioData.activeStrategies.length > 0 && (
          <div className="strategy-pill">
            <BrainCircuit size={20} className="pulse" />
            <span>{audioData.activeStrategies.length} PLANS ACTIVE</span>
          </div>
        )}

        <button className="icon-btn sos-btn" onClick={triggerSOS}>
          <AlertOctagon size={32} color="#ff0000" />
        </button>

        <button className="icon-btn" onClick={() => setShowHistory(!showHistory)}>
          <History size={32} />
        </button>
      </div>

      {/* Directional Awareness Bars */}
      <div className="directional-container">
        <div className="dir-bar left" style={{ height: `${audioData.leftLevel}%` }}></div>
        <div className="dir-bar right" style={{ height: `${audioData.rightLevel}%` }}></div>
      </div>

      {/* Main Visualizer */}
      <div className="main-content">
        
        {/* Active Strategies Overlay */}
        <div className="active-plans-container">
          {audioData.activeStrategies.map(plan => (
            <div key={plan.id} className={`plan-card ${plan.type.toLowerCase()}`}>
              <strong>{plan.title}</strong>
              <p>{plan.description}</p>
            </div>
          ))}
        </div>

        <div className={`traffic-light ${audioData.safetyLevel.toLowerCase()}`} />
        
        {/* Proactive Suggestions */}
        <div className="suggestions-area">
          {audioData.suggestions.map((s, i) => (
            <div key={i} className="suggestion-card">
              <p>{s}</p>
              <div className="card-actions">
                <button className="confirm-btn" onClick={() => confirmSound(s, true)}><Check size={32} /></button>
                <button className="reject-btn" onClick={() => confirmSound(s, false)}><X size={32} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Transcription */}
        {audioData.transcript && (
          <div className="transcript-box">
            <p>"{audioData.transcript}"</p>
          </div>
        )}
      </div>

      {/* History Overlay */}
      {showHistory && (
        <div className="history-overlay">
          <h2><History size={24} /> Sound Memory</h2>
          <div className="history-list">
            {audioData.history.map((h, i) => (
              <div key={i} className={`history-item ${h.confirmed ? 'pos' : 'neg'}`}>
                <div className="history-info">
                  <strong>{h.label}</strong>
                  <span>{new Date(h.timestamp as any).toLocaleTimeString()}</span>
                </div>
                {h.location && <MapPin size={20} />}
              </div>
            ))}
          </div>
          <button className="btn close-btn" onClick={() => setShowHistory(false)}>Close</button>
        </div>
      )}

      {/* Footer Controls */}
      <div className="footer">
        <button 
          className={`btn main-action ${isMonitoring ? 'active' : ''}`} 
          onClick={() => setIsMonitoring(!isMonitoring)}
        >
          {isMonitoring ? <Bell className="pulse" /> : <Bell />}
          {isMonitoring ? 'STOP GUARDIAN' : 'START GUARDIAN'}
        </button>
      </div>

      {/* Cleaning Indicator */}
      <div className="cleaning-bar">
        <span>CLEAN AUDIO STREAM ACTIVE</span>
        <div className="wave-animation"></div>
      </div>
    </div>
  );
}

export default App;
