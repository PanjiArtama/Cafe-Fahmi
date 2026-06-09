import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Image, MapPin, Phone, Clock, Type, FileText, Sparkles, Building2, Loader2, Upload } from 'lucide-react';
import { Toast } from '../../utils/Toast';

const baseUrl = import.meta.env.VITE_API_URL;

// ── Section Card wrapper ──────────────────────────────────────────────────────
const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-[#E8DFD5] p-6 md:p-8 space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-[#E8DFD5]">
      <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-[#8C6A53]">
        {icon}
      </div>
      <div>
        <h3 className="font-serif font-bold text-[#4A3728] text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-[#8C6A53]">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Input field ───────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', placeholder, rows }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-widest text-[#8C6A53]">
      {label}
    </label>
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D9C5B2] text-[#4A3728] text-sm resize-none transition-all"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FDFBF7] border border-[#E8DFD5] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#D9C5B2] text-[#4A3728] text-sm transition-all"
      />
    )}
  </div>
);

// ── Helper to resolve image src ───────────────────────────────────────────────
const getImageSrc = (item) => {
  // If there's a preview URL (from file selection), use it
  if (item.previewUrl) return item.previewUrl;
  // If it's an absolute URL (http/https), use directly
  if (item.imagePath && (item.imagePath.startsWith('http://') || item.imagePath.startsWith('https://'))) {
    return item.imagePath;
  }
  // If it's a server path like /uploads/..., prepend base URL
  if (item.imagePath && item.imagePath.startsWith('/uploads/')) {
    return `${baseUrl}${item.imagePath}`;
  }
  return item.imagePath || '';
};

// ── Gallery Item Card ─────────────────────────────────────────────────────────
const GalleryItemCard = ({ item, index, onChange, onRemove, onFileSelect }) => {
  const fileInputRef = useRef(null);
  const imgSrc = getImageSrc(item);

  return (
    <div className="bg-[#FDFBF7] rounded-xl border border-[#E8DFD5] p-4 space-y-3 group relative">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#8C6A53] uppercase tracking-widest">
          Item #{index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <input
        type="text"
        value={item.title}
        onChange={(e) => onChange(index, 'title', e.target.value)}
        placeholder="Title"
        className="w-full bg-white border border-[#E8DFD5] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#D9C5B2] text-[#4A3728] text-sm"
      />
      <input
        type="text"
        value={item.shortDesc}
        onChange={(e) => onChange(index, 'shortDesc', e.target.value)}
        placeholder="Short Description"
        className="w-full bg-white border border-[#E8DFD5] rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#D9C5B2] text-[#4A3728] text-sm"
      />

      {/* File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onFileSelect(index, file);
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-2 justify-center py-2.5 bg-white border border-[#E8DFD5] rounded-lg text-[#8C6A53] text-sm font-medium hover:bg-[#F5EFE6] hover:border-[#8C6A53] transition-all"
      >
        <Upload size={16} />
        {item.file ? item.file.name : 'Choose Image'}
      </button>

      {/* Image Preview */}
      {imgSrc && (
        <div className="w-full h-32 rounded-lg overflow-hidden border border-[#E8DFD5] bg-[#f2ede4]">
          <img
            src={imgSrc}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CompanyProfileEditor = ({ data, onSave }) => {
  const [form, setForm] = useState({
    mainTitle: '',
    shortDesc: '',
    longDesc: '',
    motto1: '',
    motto2: '',
    motto3: '',
    address: '',
    openingHours: { weekday: '', weekend: '' },
    phoneNumber: '',
    establishedYear: '',
    mapsLink: '',
    gallery: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        mainTitle: data.mainTitle || '',
        shortDesc: data.shortDesc || '',
        longDesc: data.longDesc || '',
        motto1: data.motto1 || '',
        motto2: data.motto2 || '',
        motto3: data.motto3 || '',
        address: data.address || '',
        openingHours: {
          weekday: data.openingHours?.weekday || '',
          weekend: data.openingHours?.weekend || ''
        },
        phoneNumber: data.phoneNumber || '',
        establishedYear: data.establishedYear || '',
        mapsLink: data.mapsLink || '',
        gallery: data.gallery?.map(g => ({
          title: g.title || '',
          shortDesc: g.shortDesc || '',
          imagePath: g.imagePath || '',
          file: null,
          previewUrl: null
        })) || []
      });
    }
  }, [data]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateOpeningHours = (key, value) => {
    setForm(prev => ({
      ...prev,
      openingHours: { ...prev.openingHours, [key]: value }
    }));
  };

  const updateGalleryItem = (index, field, value) => {
    setForm(prev => {
      const gallery = [...prev.gallery];
      gallery[index] = { ...gallery[index], [field]: value };
      return { ...prev, gallery };
    });
  };

  const handleGalleryFileSelect = (index, file) => {
    setForm(prev => {
      const gallery = [...prev.gallery];
      // Revoke old preview URL to prevent memory leaks
      if (gallery[index].previewUrl) {
        URL.revokeObjectURL(gallery[index].previewUrl);
      }
      gallery[index] = {
        ...gallery[index],
        file: file,
        previewUrl: URL.createObjectURL(file)
      };
      return { ...prev, gallery };
    });
  };

  const addGalleryItem = () => {
    setForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, { title: '', shortDesc: '', imagePath: '', file: null, previewUrl: null }]
    }));
  };

  const removeGalleryItem = (index) => {
    setForm(prev => {
      // Revoke preview URL before removing
      if (prev.gallery[index]?.previewUrl) {
        URL.revokeObjectURL(prev.gallery[index].previewUrl);
      }
      return {
        ...prev,
        gallery: prev.gallery.filter((_, i) => i !== index)
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        establishedYear: Number(form.establishedYear)
      };
      const res = await onSave(payload);
      if (res.ok) {
        Toast.fire({
          icon: 'success',
          iconColor: '#10b981',
          title: 'Company profile updated',
          background: '#ecfdf5',
          color: '#065f46'
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      Toast.fire({
        icon: 'error',
        iconColor: '#f43f5e',
        title: 'Failed to update',
        background: '#fff1f2',
        color: '#9f1239'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── Save Button (sticky) ── */}
      <div className="flex justify-end sticky top-0 z-10 pt-1 pb-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#8C6A53] hover:bg-[#725541] disabled:opacity-60 text-white px-8 py-3 rounded-2xl font-bold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#8C6A53]/20"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ── General Info ── */}
      <SectionCard icon={<Building2 size={20} />} title="General Information" subtitle="Main title and descriptions">
        <Field
          label="Main Title"
          value={form.mainTitle}
          onChange={(v) => updateField('mainTitle', v)}
          placeholder="e.g. Fahmi Cafe"
        />
        <Field
          label="Short Description"
          value={form.shortDesc}
          onChange={(v) => updateField('shortDesc', v)}
          placeholder="Brief description shown on hero section"
          rows={3}
        />
        <Field
          label="Long Description"
          value={form.longDesc}
          onChange={(v) => updateField('longDesc', v)}
          placeholder="Detailed description shown on About section"
          rows={5}
        />
        <Field
          label="Established Year"
          value={form.establishedYear}
          onChange={(v) => updateField('establishedYear', v)}
          type="number"
          placeholder="e.g. 2021"
        />
      </SectionCard>

      {/* ── Mottos ── */}
      <SectionCard icon={<Sparkles size={20} />} title="Mottos" subtitle="Three main mottos displayed in the About section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Motto 1"
            value={form.motto1}
            onChange={(v) => updateField('motto1', v)}
            placeholder="e.g. Sederhana."
          />
          <Field
            label="Motto 2"
            value={form.motto2}
            onChange={(v) => updateField('motto2', v)}
            placeholder="e.g. Tulus."
          />
          <Field
            label="Motto 3"
            value={form.motto3}
            onChange={(v) => updateField('motto3', v)}
            placeholder="e.g. Penuh Rasa."
          />
        </div>
      </SectionCard>

      {/* ── Contact & Location ── */}
      <SectionCard icon={<MapPin size={20} />} title="Contact & Location" subtitle="Address, phone, and maps link">
        <Field
          label="Address"
          value={form.address}
          onChange={(v) => updateField('address', v)}
          placeholder="Full address"
          rows={2}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(v) => updateField('phoneNumber', v)}
            placeholder="+62 812-3456-7890"
          />
          <Field
            label="Google Maps Link"
            value={form.mapsLink}
            onChange={(v) => updateField('mapsLink', v)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </SectionCard>

      {/* ── Opening Hours ── */}
      <SectionCard icon={<Clock size={20} />} title="Opening Hours" subtitle="Weekday and weekend schedules">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Weekday Hours"
            value={form.openingHours.weekday}
            onChange={(v) => updateOpeningHours('weekday', v)}
            placeholder="e.g. Senin – Jumat: 07.00 – 21.00"
          />
          <Field
            label="Weekend Hours"
            value={form.openingHours.weekend}
            onChange={(v) => updateOpeningHours('weekend', v)}
            placeholder="e.g. Sabtu – Minggu: 08.00 – 22.00"
          />
        </div>
      </SectionCard>

      {/* ── Gallery ── */}
      <SectionCard icon={<Image size={20} />} title="Gallery" subtitle="Upload gallery images shown on the website">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.gallery.map((item, index) => (
            <GalleryItemCard
              key={index}
              item={item}
              index={index}
              onChange={updateGalleryItem}
              onRemove={removeGalleryItem}
              onFileSelect={handleGalleryFileSelect}
            />
          ))}
        </div>
        <button
          onClick={addGalleryItem}
          className="flex items-center gap-2 w-full justify-center py-3 border-2 border-dashed border-[#D9C5B2] rounded-xl text-[#8C6A53] font-bold text-sm hover:bg-[#F5EFE6] hover:border-[#8C6A53] transition-all"
        >
          <Plus size={18} /> Add Gallery Item
        </button>
      </SectionCard>
    </div>
  );
};

export default CompanyProfileEditor;
