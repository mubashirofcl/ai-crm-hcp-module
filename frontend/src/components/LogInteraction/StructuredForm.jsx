import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitInteraction, resetForm, updateFormField } from '../../store/interactionSlice';

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

const FieldDisplay = ({ label, fieldKey, value, type = "text", options = [] }) => {
  const dispatch = useDispatch();
  const flash = useFieldFlash(value);
  
  const handleChange = (e) => {
    let val = e.target.value;
    if (type === "number") val = val ? parseInt(val) : "";
    if (type === "boolean") val = val === "true" ? true : (val === "false" ? false : null);
    if (type === "array") val = val.split(",").map(s => s.trim()).filter(Boolean);
    dispatch(updateFormField({ field: fieldKey, value: val }));
  };

  const commonStyle = {
    background: flash ? '#EEF2FF' : '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1E293B',
    width: '100%',
    transition: 'background-color 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  let inputElement;

  if (type === "select") {
    inputElement = (
      <select value={value === null ? "" : value} onChange={handleChange} style={commonStyle}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (type === "boolean") {
    inputElement = (
      <select value={value === null ? "" : value} onChange={handleChange} style={commonStyle}>
        <option value="">Select...</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  } else if (type === "array") {
    inputElement = (
      <input type="text" value={Array.isArray(value) ? value.join(", ") : value || ""} onChange={handleChange} style={commonStyle} placeholder="Comma separated..." />
    );
  } else if (type === "textarea") {
    inputElement = (
      <textarea value={value || ""} onChange={handleChange} style={{...commonStyle, minHeight: '80px', resize: 'vertical'}} placeholder="Enter notes..." />
    );
  } else {
    inputElement = (
      <input type={type} value={value || ""} onChange={handleChange} style={commonStyle} />
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      {inputElement}
    </div>
  );
};

const StructuredForm = () => {
  const dispatch = useDispatch();
  const { formData, submitting, submitted, submitError, hcps } = useSelector(state => state.interactions);
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

  // Auto-fill HCP name based on ID
  useEffect(() => {
    if (formData.hcp_id && (!formData.hcp_name || formData.hcp_name.startsWith("HCP ID:") || formData.hcp_name === "undefined undefined")) {
      const hcp = hcps.find(h => h.id === parseInt(formData.hcp_id));
      if (hcp) {
        const nameToUse = hcp.full_name || hcp.name || `${hcp.first_name || ''} ${hcp.last_name || ''}`.trim();
        dispatch(updateFormField({ field: 'hcp_name', value: nameToUse }));
      }
    }
  }, [formData.hcp_id, formData.hcp_name, hcps, dispatch]);

  const handleSave = () => {
    if (formData.hcp_id) {
      dispatch(submitInteraction(formData));
    }
  };

  return (
    <div style={{ maxWidth: '100%', position: 'relative' }}>
      
      {/* Banner */}
      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
        You can now edit this form manually or use the AI Assistant &rarr;
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
        <FieldDisplay label="HCP Name" fieldKey="hcp_name" value={formData.hcp_name} />
        <FieldDisplay label="Interaction Type" fieldKey="interaction_type" value={formData.interaction_type} type="select" options={[
          {value: 'In-Person Visit', label: 'In-Person Visit'},
          {value: 'Phone Call', label: 'Phone Call'},
          {value: 'Email', label: 'Email'},
          {value: 'Virtual Meeting', label: 'Virtual Meeting'},
          {value: 'Conference', label: 'Conference'}
        ]} />
        <FieldDisplay label="Date" fieldKey="interaction_date" type="date" value={formData.interaction_date ? formData.interaction_date.split('T')[0] : ""} />
        <FieldDisplay label="Duration (min)" fieldKey="duration_minutes" type="number" value={formData.duration_minutes} />
      </div>

      <FieldDisplay label="Location" fieldKey="location" value={formData.location} />

      <div style={{ borderBottom: '1px solid #F1F5F9', margin: '24px 0' }}></div>

      {/* Section 2 */}
      <FieldDisplay label="Products Discussed" fieldKey="products_discussed" value={formData.products_discussed} type="array" />
      
      <FieldDisplay label="Sentiment" fieldKey="sentiment" value={formData.sentiment} type="select" options={[
        {value: 'Positive', label: 'Positive'},
        {value: 'Neutral', label: 'Neutral'},
        {value: 'Negative', label: 'Negative'}
      ]} />

      <FieldDisplay label="Notes" fieldKey="notes" value={formData.notes} type="textarea" />

      <div style={{ borderBottom: '1px solid #F1F5F9', margin: '24px 0' }}></div>

      {/* Section 3 */}
      <FieldDisplay label="Next Steps" fieldKey="next_steps" value={formData.next_steps} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <FieldDisplay label="Follow-up Required" fieldKey="follow_up_required" value={formData.follow_up_required} type="boolean" />
        <FieldDisplay label="Follow-up Date" fieldKey="follow_up_date" value={formData.follow_up_date || ""} type="date" />
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
