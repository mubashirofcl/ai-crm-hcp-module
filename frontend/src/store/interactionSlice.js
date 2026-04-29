import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchHCPs = createAsyncThunk('interactions/fetchHCPs', async () => {
  const response = await api.get('/hcps');
  return response.data;
});

export const fetchProducts = createAsyncThunk('interactions/fetchProducts', async () => {
  return ["CardioMax", "OncoShield", "NeuroClear", "ArthroFlex", "ImmunoBoost"];
});

export const submitInteraction = createAsyncThunk('interactions/submitInteraction', async (formData) => {
  const response = await api.post('/interactions', formData);
  return response.data;
});

export const fetchInteractionHistory = createAsyncThunk('interactions/fetchInteractionHistory', async (hcpId) => {
  const response = await api.get(`/hcps/${hcpId}/interactions`);
  return response.data;
});

const initialState = {
  hcps: [],
  products: ["CardioMax", "OncoShield", "NeuroClear", "ArthroFlex", "ImmunoBoost"],
  formData: {
    hcp_id: null,
    hcp_name: "",
    interaction_type: "",
    interaction_date: "",
    duration_minutes: "",
    products_discussed: [],
    notes: "",
    sentiment: "",
    follow_up_required: false,
    follow_up_date: "",
    location: "",
    next_steps: ""
  },
  lastInteractionId: null,
  submitting: false,
  submitted: false,
  submitError: null,
  hcpsLoading: false
};

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.submitted = false;
      state.submitError = null;
    },
    setSubmitted: (state, action) => {
      state.submitted = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHCPs.pending, (state) => {
        state.hcpsLoading = true;
      })
      .addCase(fetchHCPs.fulfilled, (state, action) => {
        state.hcpsLoading = false;
        state.hcps = action.payload;
      })
      .addCase(fetchHCPs.rejected, (state) => {
        state.hcpsLoading = false;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(submitInteraction.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitInteraction.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitted = true;
        state.lastInteractionId = action.payload.id;
      })
      .addCase(submitInteraction.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.error.message;
      });
  }
});

export const { updateFormField, updateFormData, resetForm, setSubmitted } = interactionSlice.actions;

export default interactionSlice.reducer;
