import React, { useState } from 'react';
import { Layers, History, Plus, PackageOpen } from 'lucide-react';
import MaterialTable from './MaterialTable';
import MaterialHistoryTable from './MaterialHistoryTable';

const MaterialManagement = ({ materials, onEdit, onDelete, onAdd }) => {
    const [activeTab, setActiveTab] = useState('materials');

    return (
        <div className="max-w-full mx-auto p-6">
            {/* --- TAB NAVIGATION --- */}
            <div className="flex items-center justify-between mb-8 border-b border-[#E8DFD5]">
                <div className="flex gap-8">
                    <TabButton
                        active={activeTab === 'materials'}
                        onClick={() => setActiveTab('materials')}
                        label="Materials"
                        count={materials.length}
                        icon={<Layers size={18} />}
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        label="History"
                        icon={<History size={18} />}
                    />
                </div>

                {activeTab === 'materials' && (
                    <div className="pb-2">
                        <button
                            onClick={onAdd}
                            className="flex items-center gap-2 bg-[#8C6A53] hover:bg-[#725541] text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#8C6A53]/20"
                        >
                            <Plus size={18} /> Add Material
                        </button>
                    </div>
                )}
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="transition-all duration-300">
                {activeTab === 'materials' ? (
                    <section className="animate-in fade-in slide-in-from-bottom-2">
                        <MaterialTable data={materials} onEdit={onEdit} onDelete={onDelete} />
                    </section>
                ) : (
                    <section className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="overflow-hidden">
                            <MaterialHistoryTable />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TabButton = ({ active, onClick, label, count, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 pb-4 px-1 transition-all relative font-bold text-sm ${active ? 'text-[#4A3728]' : 'text-[#8C6A53] hover:text-[#4A3728]'
            }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-[#4A3728] text-white' : 'bg-[#F5EFE6] text-[#8C6A53]'
                }`}>
                {count}
            </span>
        )}
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8C6A53] rounded-t-full" />
        )}
    </button>
);

export default MaterialManagement;
