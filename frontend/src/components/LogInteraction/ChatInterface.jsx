import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage, addUserMessage, clearChat } from '../../store/agentSlice';
import { updateFormData } from '../../store/interactionSlice';

const bounceKeyframes = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }
`;

const ChatInterface = () => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const dispatch = useDispatch();
  const { messages, loading, toolsUsed } = useSelector(state => state.agent);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = (text) => {
    const trimmedText = text.trim();
    if (!trimmedText || loading) return;

    dispatch(addUserMessage(trimmedText));
    setInputText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Pass only the non-loading history for context
    dispatch(sendMessage({ message: trimmedText, history: messages }))
      .unwrap()
      .then((payload) => {
        // Form updates dispatching is already handled inside the thunk,
        // but adding it here as requested for strict compliance
        if (payload.form_updates && Object.keys(payload.form_updates).length > 0) {
          dispatch(updateFormData(payload.form_updates));
        }
      })
      .catch(() => {});
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  const handleInput = (e) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const quickPrompts = [
    "Log a visit with Dr. Chen today",
    "Search for cardiologists",
    "Show interaction history",
    "Generate follow-up plan"
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <style>{bounceKeyframes}</style>
      
      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
            
            {msg.role !== 'user' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, marginRight: '10px', flexShrink: 0, marginTop: '2px' }}>
                AI
              </div>
            )}
            
            <div style={{ 
              backgroundColor: msg.role === 'user' ? '#6366F1' : 'white',
              color: msg.role === 'user' ? 'white' : '#1E293B',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: msg.role === 'user' ? '10px 14px' : '12px 16px',
              maxWidth: msg.role === 'user' ? '80%' : '85%',
              fontSize: '14px',
              boxShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5'
            }}>
              {msg.content}
              
              {/* Tool Used Badge */}
              {msg.tools_used && msg.tools_used.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {msg.tools_used.map((tool, tIdx) => (
                    <span key={tIdx} style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🔧 {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Form Update Notification */}
              {msg.form_updates && Object.keys(msg.form_updates).length > 0 && (
                <div style={{ marginTop: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#1E40AF' }}>
                  <strong>✅ Form updated:</strong> {Object.keys(msg.form_updates).join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, marginRight: '10px', flexShrink: 0 }}>
              AI
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '18px 18px 18px 4px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '4px', height: 'fit-content' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94A3B8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94A3B8', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94A3B8', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Tools Indicator Bar */}
      <div style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '6px 16px', fontSize: '11px', overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ color: '#64748B', whiteSpace: 'nowrap' }}>Tools used this session:</span>
        {toolsUsed && toolsUsed.length > 0 ? toolsUsed.map((tool, idx) => (
          <span key={idx} style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
            🔧 {tool}
          </span>
        )) : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>None yet</span>}
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px 16px', backgroundColor: 'white', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
        
        {/* Quick Prompts */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                style={{
                  backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', color: '#1E293B', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#6366F1'; e.target.style.color = '#6366F1'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.color = '#1E293B'; }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button 
            onClick={() => dispatch(clearChat())}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#EF4444'}
            onMouseLeave={e => e.target.style.color = '#94A3B8'}
          >
            Clear chat
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            style={{
              flex: 1, maxHeight: '120px', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', overflowY: 'auto', boxSizing: 'border-box', backgroundColor: '#F8FAFC'
            }}
            rows={1}
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || loading}
            style={{
              width: '40px', height: '40px', backgroundColor: (!inputText.trim() || loading) ? '#C7D2FE' : '#6366F1', color: 'white', border: 'none', borderRadius: '50%', cursor: (!inputText.trim() || loading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 0.2s', padding: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '2px' }}>
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ChatInterface;
