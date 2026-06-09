import { useEffect, useState } from "react";
import {menuItems} from "../../data/cafeData";
import MenuCard from "./MenuCard";

export default function Menu({ items, menuCategories}) {
    const [active, setActive] = useState("Semua");
    const [categories, setCat] = useState([
        {
            _id: "0",
            name: "Semua",
            productCount: 1
        },
        ...menuCategories,

    ]);
    const filtered = active === "Semua"
        ? items
        : items.filter(m => m.category.name === active);

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
                        onClick={() => setActive(cat.name)}
                        className={`px-5 py-2 text-[10px] tracking-widest uppercase border transition-all duration-300 ${
                            active === cat.name
                                ? "bg-[#2a1a0f] text-[#faf8f4] border-[#2a1a0f]"
                                : "bg-transparent text-[#6b5544] border-stone-200 hover:border-[#c8a97a]"
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filtered.map(item => (
                    <MenuCard key={item._id} item={item} />
                ))}
            </div>
        </section>
    );
}
