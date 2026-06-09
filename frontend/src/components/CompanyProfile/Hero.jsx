export default function Hero({ mainTitle, shortDesc, establishedYear }) {
    return (
        <section className="relative min-h-screen flex items-center justify-center px-6 text-center overflow-hidden">

            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop"
                    alt="Fahmi Cafe Atmosphere"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-[#2a1a0f]/40 to-[#faf8f4]" />
            </div>

            <div className="relative z-10 max-w-2xl px-8 py-12 rounded-sm backdrop-blur-[2px] bg-white/5 border border-white/10 shadow-2xl">
                <span className="block text-[11px] tracking-[4px] text-[#c8a97a] mb-6 font-medium">
                    EST. {establishedYear || 2021} · MEDAN, INDONESIA
                </span>

                <h1 className="font-serif text-7xl md:text-9xl font-light leading-none text-white tracking-tight">
                    {mainTitle ? (
                        <>
                            {mainTitle.split(' ')[0]}<br />
                            <em className="italic text-[#c8a97a]">{mainTitle.split(' ').slice(1).join(' ') || ''}</em>
                        </>
                    ) : (
                        <>
                            Fahmi<br />
                            <em className="italic text-[#c8a97a]">Cafe</em>
                        </>
                    )}
                </h1>

                <p className="text-base text-stone-200 leading-relaxed my-8 max-w-md mx-auto font-light">
                    {shortDesc || "Secangkir kopi bukan sekadar minuman. Ini adalah jeda momen di antara kesibukan, ruang untuk menjadi diri sendiri."}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="#tentang"
                        className="inline-block px-10 py-4 bg-[#c8a97a] text-[#2a1a0f] text-[11px] tracking-[2.5px] font-bold rounded-sm hover:bg-white transition-colors"
                    >
                        KENALI KAMI
                    </a>
                    <a
                        href="#menu"
                        className="inline-block px-10 py-4 border border-white/30 text-white text-[11px] tracking-[2.5px] rounded-sm hover:bg-white/10 backdrop-blur-sm transition-colors"
                    >
                        LIHAT MENU
                    </a>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                <div className="w-px h-12 bg-linear-to-b from-[#c8a97a] to-transparent" />
                <span className="text-[9px] tracking-[3px] text-[#2a1a0f]/50 uppercase">Scroll</span>
            </div>
        </section>
    );
}
