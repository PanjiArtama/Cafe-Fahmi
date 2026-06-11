export default function MenuCard({ item }) {
    return (
        <div className="group bg-white border border-[#ede8e0] overflow-hidden rounded-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-video md:aspect-4/3 overflow-hidden bg-stone-100">
                <img
                    src={`http://localhost:5005${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            </div>
            <div className="p-6 md:p-8">
                <span className="text-[10px] tracking-widest text-[#c8a97a] uppercase mb-2 block font-medium">
                    {item.category.name}
                </span>
                <h3 className="font-serif text-xl md:text-2xl text-[#2a1a0f] mb-2 md:mb-3">{item.name}</h3>
                <p className="text-[13px] text-[#8b7060] leading-relaxed font-light mb-6 md:min-h-15">{item.desc}</p>
                <div className="border-t border-[#ede8e0] pt-4 flex justify-between items-center">
                    <span className="font-serif text-lg md:text-xl font-semibold text-[#8b6442]">{item.price}</span>
                    
                </div>
            </div>
        </div>
    );
}
