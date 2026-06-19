import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MenuCard from "./MenuCard";

export default function Menu({ items = [], menuCategories = [] }) {
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [isExpanded, setIsExpanded] = useState(false);

    // Initial number of items to show before clicking "Show More"
    const INITIAL_VISIBLE_COUNT = 6;

    // Initialize categories with "Semua" safely using useMemo
    const categories = useMemo(() => {
        return [
            {
                _id: "0",
                name: "Semua",
                productCount: items.length
            },
            ...menuCategories
        ];
    }, [menuCategories, items.length]);

    // Step 1: Filter items by active category
    const filteredItems = useMemo(() => {
        return activeCategory === "Semua"
            ? items
            : items.filter(m => m.category?.name === activeCategory);
    }, [activeCategory, items]);

    // Step 2: Slice the items depending on the expand toggle state
    const displayedItems = useMemo(() => {
        if (isExpanded) return filteredItems;
        return filteredItems.slice(0, INITIAL_VISIBLE_COUNT);
    }, [filteredItems, isExpanded]);

    // Reset visibility tracking if the user switches categories mid-browsing
    const handleCategoryChange = (categoryName) => {
        setActiveCategory(categoryName);
        setIsExpanded(false); 
    };

    return (
        <section id="menu" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <span className="text-[11px] tracking-[4px] text-[#c8a97a] mb-4 block font-medium uppercase">
                    Menu Unggulan
                </span>
                <h2 className="font-serif text-5xl font-light text-[#2a1a0f]">
                    Pilihan <em className="italic">Terbaik</em> Kami
                </h2>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                {categories.filter(cat => cat.productCount > 0).map(cat => (
                    <button
                        key={cat._id}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`px-5 py-2 text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                            activeCategory === cat.name
                                ? "bg-[#2a1a0f] text-[#faf8f4] border-[#2a1a0f]"
                                : "bg-transparent text-[#6b5544] border-stone-200 hover:border-[#c8a97a]"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 transition-all duration-500">
                {displayedItems.map(item => (
                    <MenuCard key={item._id} item={item} />
                ))}
            </div>

            {/* Expand / Collapse Control Section */}
            {filteredItems.length > INITIAL_VISIBLE_COUNT && (
                <div className="mt-16 text-center flex flex-col items-center justify-center">
                    {/* Minimal decorative dividing line structure */}
                    <div className="w-16 h-px bg-stone-200 mb-6" />
                    
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="group flex flex-col items-center gap-2 text-[11px] tracking-[3px] font-medium uppercase text-[#6b5544] hover:text-[#c8a97a] transition-colors duration-300"
                    >
                        <span>
                            {isExpanded ? "Sembunyikan Menu" : "Lihat Seluruh Menu"}
                        </span>
                        
                        <div className="transition-transform duration-300 group-hover:translate-y-0.5">
                            {isExpanded ? (
                                <ChevronUp size={16} className="text-[#c8a97a]" />
                            ) : (
                                <ChevronDown size={16} className="text-[#c8a97a]" />
                            )}
                        </div>
                    </button>
                </div>
            )}
        </section>
    );
}