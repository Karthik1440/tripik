// src/components/AddHiddenSpotModal.js
import React, { useState } from 'react';
import api from '../api';
import { X, Upload, MapPin, Compass, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AddHiddenSpotModal({ isOpen, onClose, onSpotAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mountains',
    address: '',
    latitude: '',
    longitude: '',
    nearby_landmark: '',
    description: '',
    distance_km: '85',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [gettingGps, setGettingGps] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to max 3 photos total
    const combined = [...selectedFiles, ...files].slice(0, 3);
    setSelectedFiles(combined);

    // Create image preview URLs
    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGettingGps(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGettingGps(false);
      },
      (err) => {
        setError('Could not retrieve GPS location. Please enter manually.');
        setGettingGps(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Please enter spot name.');
    if (!formData.address.trim()) return setError('Please enter address/region.');
    if (!formData.description.trim()) return setError('Please enter description.');
    if (selectedFiles.length === 0) return setError('Please upload at least 1 photo.');

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('address', formData.address);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('nearby_landmark', formData.nearby_landmark);
      data.append('description', formData.description);
      data.append('distance_km', formData.distance_km);

      // Append up to 3 photos
      selectedFiles.forEach((file) => {
        data.append('photos', file);
      });

      const res = await api.post('/trips/hidden-spots/add/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSpotAdded(res.data);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to add hidden spot:', err);
      setError(err.response?.data?.error || 'Failed to submit spot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <span style={styles.badge}>✨ Community Upload</span>
            <h2 style={styles.title}>Add Hidden Spot</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBanner}>
            <CheckCircle size={18} />
            <span>Hidden spot added successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 📸 Photos Upload Section (Up to 3) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              📸 Upload Photos <span style={{ color: '#047857', fontSize: 12 }}>(Up to 3)</span>
            </label>
            <div style={styles.photoGrid}>
              {previews.map((src, idx) => (
                <div key={idx} style={styles.previewBox}>
                  <img src={src} alt="Preview" style={styles.previewImg} />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    style={styles.removePhotoBtn}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 3 && (
                <label style={styles.uploadZone}>
                  <Upload size={22} color="#047857" />
                  <span style={styles.uploadText}>+ Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    multiple
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 🏷️ Spot Name & Category */}
          <div style={styles.row}>
            <div style={{ ...styles.fieldGroup, flex: 2 }}>
              <label style={styles.label}>🏷️ Spot Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Meenmutty Falls"
                style={styles.input}
                required
              />
            </div>

            <div style={{ ...styles.fieldGroup, flex: 1 }}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Mountains">Mountains ⛰️</option>
                <option value="Waterfalls">Waterfalls 🌊</option>
                <option value="Beaches">Beaches 🏖️</option>
                <option value="Food Spot">Food Spot 🍲</option>
                <option value="Lakes">Lakes 🏞️</option>
                <option value="Caves">Caves 洞</option>
                <option value="General">General 📍</option>
              </select>
            </div>
          </div>

          {/* 📍 Address / Location */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>📍 Address / Region</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Wayanad, Kerala"
              style={styles.input}
              required
            />
          </div>

          {/* 🏛️ Nearby Landmark */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>🏛️ Nearby Landmark</label>
            <input
              type="text"
              name="nearby_landmark"
              value={formData.nearby_landmark}
              onChange={handleChange}
              placeholder="e.g. Meenmutty Trekking Base"
              style={styles.input}
            />
          </div>

          {/* 🗺️ Location GPS Coordinates */}
          <div style={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>🗺️ GPS Coordinates (Optional)</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingGps}
                style={styles.gpsBtn}
              >
                {gettingGps ? <Loader2 size={14} className="spin" /> : <MapPin size={14} />}
                <span>{gettingGps ? 'Detecting...' : 'Use Current GPS'}</span>
              </button>
            </div>
            <div style={styles.row}>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude (e.g. 11.6052)"
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude (e.g. 76.1011)"
                style={{ ...styles.input, flex: 1 }}
              />
            </div>
          </div>

          {/* 📝 Description */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>📝 Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="A serene 3-tier waterfall surrounded by lush forest..."
              style={styles.textarea}
              required
            />
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Uploading to ImageKit...</span>
                </>
              ) : (
                <span>Publish Hidden Spot 🚀</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#047857',
    background: '#ecfdf5',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: '4px 0 0 0',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    border: 'none',
    background: '#f1f5f9',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
  },
  errorBanner: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  successBanner: {
    background: '#ecfdf5',
    color: '#065f46',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    background: '#ffffff',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  photoGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  previewBox: {
    position: 'relative',
    width: '90px',
    height: '90px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #cbd5e1',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  uploadZone: {
    width: '90px',
    height: '90px',
    borderRadius: '12px',
    border: '2px dashed #059669',
    background: '#ecfdf5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: '4px',
  },
  uploadText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#047857',
  },
  gpsBtn: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    background: '#f1f5f9',
    color: '#475569',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
};
