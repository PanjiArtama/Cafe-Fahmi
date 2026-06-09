const defaultValues = [
    { emoji: "🌱", text: "Bahan Lokal" },
    { emoji: "♻️", text: "Eco Conscious" },
    { emoji: "👐", text: "Handcrafted" },
];

export default function About({ longDesc, motto1, motto2, motto3, establishedYear }) {
    const mottoText = (motto1 && motto2 && motto3)
        ? `${motto1}\n${motto2}\n${motto3}`
        : null;

    const paragraphs = longDesc
        ? longDesc.split('\n').filter(p => p.trim())
        : [
            "Fahmi Cafe lahir dari kecintaan mendalam terhadap kopi Indonesia. Kami percaya bahwa kopi terbaik tidak harus rumit.",
            "Berlokasi di sudut kota Medan, kami hadir sebagai ruang ketiga — antara rumah dan kantor, tempat ide mengalir."
        ];

    return (
        <section id="tentang" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">

                {/* Text Content */}
                <div>
                    <span className="text-[11px] tracking-[4px] text-[#c8a97a] mb-5 block font-medium">
                        TENTANG KAMI
                    </span>
                    <h2 className="font-serif text-5xl md:text-6xl font-light leading-tight text-[#2a1a0f] mb-8">
                        {mottoText ? (
                            mottoText.split('\n').map((line, i) => (
                                <span key={i}>
                                    {i === 1 ? <em className="italic">{line}</em> : line}
                                    {i < 2 && <br />}
                                </span>
                            ))
                        ) : (
                            <>Sederhana.<br /><em className="italic">Tulus.</em><br />Penuh Rasa.</>
                        )}
                    </h2>
                    <div className="space-y-5 text-[15px] text-[#6b5544] leading-loose font-light">
                        {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                    <div className="flex gap-10 mt-10">
                        {defaultValues.map(({ emoji, text }) => (
                            <div key={text} className="text-center">
                                <div className="text-2xl mb-2">{emoji}</div>
                                <div className="text-[10px] tracking-widest text-[#8b6442] uppercase font-medium">{text}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Card */}
                <div className="relative group mt-10 md:mt-0">
                    <div className="aspect-square md:aspect-4/5 bg-linear-to-br from-[#e8ddd0] to-[#d4c4b0] rounded-sm flex flex-col items-center justify-center gap-4">
                        <span className="text-6xl md:text-8xl">☕</span>
                        <span className="font-serif italic text-lg md:text-xl text-[#6b5544]">our story</span>
                    </div>
                    <div className="absolute -bottom-3 -right-3 md:-bottom-5 md:-right-5 w-20 h-20 md:w-28 md:h-28 bg-[#c8a97a] rounded-sm flex flex-col items-center justify-center text-[#faf8f4] shadow-lg">
                        <span className="font-serif text-xl md:text-3xl font-bold leading-none">{establishedYear || 2021}</span>
                        <span className="text-[8px] md:text-[9px] tracking-widest opacity-80 mt-1">BERDIRI</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
