import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchHCPs } from '../../store/interactionSlice';
import StructuredForm from './StructuredForm';
import ChatInterface from './ChatInterface';

const pulseKeyframes = `
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
`;

const LogInteractionPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ display: 'flex', gap: '32px', width: '100%', height: '100%', overflow: 'hidden' }}>
        
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 className="panel-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: 0 }}>Log Interaction</h2>
              <p className="panel-subtitle" style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>Interaction Details</p>
            </div>
            <div style={{ background: '#EEF2FF', color: '#6366F1', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>
              AI-Controlled
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <StructuredForm />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="panel-title" style={{ fontSize: '16px', fontWeight: 600, color: '#1E293B', margin: 0 }}>AI Assistant</h2>
              <p className="panel-subtitle" style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: 0 }}>Powered by Groq · llama-3.3-70b-versatile</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Live</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <ChatInterface />
          </div>
        </div>

      </div>
    </>
  );
};

export default LogInteractionPage;
