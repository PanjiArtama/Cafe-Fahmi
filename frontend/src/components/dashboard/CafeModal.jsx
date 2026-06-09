const CafeModal = ({ isOpen, onClose, onSave, title, children, loading = false }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[#E8DFD5] overflow-hidden transform transition-all">
        <div className="p-6 md:p-8">
          <h3 className="text-2xl font-serif font-bold text-[#4A3728] mb-6">{title}</h3>

          <div className="space-y-4">{children}</div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-[#E8DFD5] text-[#8C6A53] font-bold hover:bg-[#FDFBF7] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-[#8C6A53] text-white font-bold hover:bg-[#725541] shadow-lg shadow-[#8C6A53]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeModal;
