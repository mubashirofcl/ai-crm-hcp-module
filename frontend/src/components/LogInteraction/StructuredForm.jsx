import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitInteraction, resetForm } from '../../store/interactionSlice';

const useFieldFlash = (value) => {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    const currentValue = typeof value === 'object' ? JSON.stringify(value) : value;
    const previousValue = typeof prevValue.current === 'object' ? JSON.stringify(prevValue.current) : prevValue.current;
    
    if (currentValue !== previousValue && value !== "" && value !== null && (Array.isArray(value) ? value.length > 0 : true)) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 1000);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return flash;
};

const FieldDisplay = ({ label, value, renderValue, isArray, emptyText = "Waiting for AI input..." }) => {
  const flash = useFieldFlash(value);
  
  // Custom logic for boolean values (like follow_up_required)
  let isEmpty = false;
  if (isArray) {
    isEmpty = !value || value.length === 0;
  } else if (typeof value === 'boolean') {
    isEmpty = value === null; // Initial state might be false, which is valid
  } else {
    isEmpty = value === "" || value === null || value === undefined;
  }
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{
        background: flash ? '#EEF2FF' : (isEmpty ? '#F1F5F9' : '#F8FAFC'),
        border: isEmpty ? '1px dashed #CBD5E1' : '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        color: isEmpty ? '#94A3B8' : '#1E293B',
        minHeight: '40px',
        fontStyle: isEmpty ? 'italic' : 'normal',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center'
      }}>
        {isEmpty ? emptyText : (renderValue ? renderValue(value) : value)}
      </div>
    </div>
  );
};

const StructuredForm = () => {
  const dispatch = useDispatch();
  const { formData, submitting, submitted, submitError } = useSelector(state => state.interactions);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (submitted) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        dispatch(resetForm());
      }, 4000);
    }
  }, [submitted, dispatch]);

  const handleSave = () => {
    if (formData.hcp_id) {
      dispatch(submitInteraction(formData));
    }
  };

  const renderProducts = (products) => (
    products.map((p, idx) => (
      <span key={idx} style={{ background: '#EEF2FF', color: '#6366F1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
        {p}
      </span>
    ))
  );

  const renderSentiment = (sentiment) => {
    const s = sentiment?.toLowerCase() || '';
    let bg = '#F1F5F9', color = '#64748B';
    if (s === 'positive') { bg = '#DCFCE7'; color = '#16A34A'; }
    if (s === 'negative') { bg = '#FEE2E2'; color = '#DC2626'; }
    return (
      <span style={{ background: bg, color: color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
        {sentiment}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: '100%', position: 'relative' }}>
      
      {/* Banner */}
      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
        This form is controlled by the AI Assistant &rarr;
      </div>

      {showToast && (
        <div style={{ backgroundColor: '#10B981', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 500, marginBottom: '24px', transition: 'opacity 0.3s' }}>
          ✅ Interaction logged successfully!
        </div>
      )}

      {submitError && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 500, marginBottom: '24px' }}>
          Error saving: {submitError}
        </div>
      )}

      {/* Section 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <FieldDisplay label="HCP Name" value={formData.hcp_name || (formData.hcp_id ? `HCP ID: ${formData.hcp_id}` : "")} />
        <FieldDisplay label="Interaction Type" value={formData.interaction_type} />
        <FieldDisplay label="Date & Time" value={formData.interaction_date} renderValue={formatDate} />
        <FieldDisplay label="Duration" value={formData.duration_minutes} renderValue={v => `${v} minutes`} />
      </div>

      <FieldDisplay label="Location" value={formData.location} />

      <div style={{ borderBottom: '1px solid #F1F5F9', margin: '24px 0' }}></div>

      {/* Section 2 */}
      <FieldDisplay label="Products Discussed" value={formData.products_discussed} renderValue={renderProducts} isArray={true} />
      
      <FieldDisplay label="Sentiment" value={formData.sentiment} renderValue={renderSentiment} />

      <FieldDisplay label="Notes" value={formData.notes} />

      <div style={{ borderBottom: '1px solid #F1F5F9', margin: '24px 0' }}></div>

      {/* Section 3 */}
      <FieldDisplay label="Next Steps" value={formData.next_steps} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <FieldDisplay label="Follow-up Required" value={formData.follow_up_required === null ? "" : (formData.follow_up_required ? "Yes" : "No")} />
        {formData.follow_up_required && (
          <FieldDisplay label="Follow-up Date" value={formData.follow_up_date} />
        )}
      </div>

      <button 
        onClick={handleSave} 
        disabled={!formData.hcp_id || submitting}
        style={{
          width: '100%',
          backgroundColor: '#6366F1',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '15px',
          border: 'none',
          cursor: (!formData.hcp_id || submitting) ? 'not-allowed' : 'pointer',
          opacity: (!formData.hcp_id || submitting) ? 0.5 : 1,
          marginTop: '16px',
          transition: 'opacity 0.2s ease, transform 0.1s ease',
        }}
        onMouseDown={e => { if (!(!formData.hcp_id || submitting)) e.target.style.transform = 'scale(0.98)'; }}
        onMouseUp={e => { e.target.style.transform = 'scale(1)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
      >
        {submitting ? 'Saving to Database...' : 'Save Interaction'}
      </button>

    </div>
  );
};

export default StructuredForm;
