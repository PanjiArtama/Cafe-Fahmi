import { galleryItems as defaultGallery } from "../../data/cafeData";
import { resolveImageUrl } from "../../utils/imageUrl";

function GalleryCard({ item }) {
    const temp = resolveImageUrl(item.imagePath || item.image);
    const imgUrl = temp.replaceAll(" ", "%20"); // Handle spaces in URLs
    return (
        <div
            className="relative rounded-sm overflow-hidden group transition-all duration-500 aspect-4/3 md:aspect-square"
            style={{
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-[#1a0f08]/40 group-hover:bg-[#1a0f08]/60 transition-colors duration-500" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                
                <div className="font-serif text-xl text-white mb-1">{item.title || item.label}</div>
                <div className="text-[10px] text-white/80 italic tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {item.shortDesc || item.desc}
                </div>
                {/* Hover border */}
                <div className="absolute inset-4 border border-white/20 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
            </div>
        </div>
    );
}

export default function Gallery({ gallery }) {
    const items = gallery && gallery.length > 0 ? gallery : defaultGallery;

    return (
        <section id="galeri" className="bg-[#f2ede4] py-24 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-[11px] tracking-[4px] text-[#c8a97a] mb-4 block font-medium uppercase">
                        Galeri
                    </span>
                    <h2 className="font-serif text-5xl font-light text-[#2a1a0f]">
                        Sekilas <em className="italic">Suasana</em>
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {items.map((item, index) => (
                        <GalleryCard key={item._id || item.id || index} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}
