import { contactInfo as defaultContactInfo } from "../../data/cafeData";

function ContactItem({ icon, title, lines }) {
    return (
        <div className="flex gap-4 md:gap-5">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-[#f2ede4] rounded-sm flex items-center justify-center text-lg shrink-0">
                {icon}
            </div>
            <div>
                <span className="text-[10px] tracking-widest text-[#c8a97a] uppercase mb-1 block font-semibold">
                    {title}
                </span>
                {lines.map(line => (
                    <p key={line} className="text-sm md:text-base text-[#3d2b1f] font-light leading-relaxed">
                        {line}
                    </p>
                ))}
            </div>
        </div>
    );
}

function ContactCTA({ phoneNumber, mapsLink }) {
    const waNumber = phoneNumber
        ? phoneNumber.replace(/[^0-9]/g, '')
        : '6281234567890';

    return (
        <div className="relative group overflow-hidden bg-[#2a1a0f] rounded-sm p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-75 md:min-h-100">
            <div className="relative z-10 space-y-6 w-full">
                <div className="text-5xl md:text-6xl mb-4">💬</div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#f2ede4]">Ada Pertanyaan?</h3>
                <p className="text-xs md:text-sm text-[#a89080] font-light leading-relaxed max-w-xs mx-auto">
                    Ingin reservasi tempat atau sekadar bertanya? Hubungi kami langsung via WhatsApp.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                    <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-[#c8a97a] text-[#2a1a0f] text-[11px] tracking-[2px] font-bold rounded-sm hover:bg-[#faf8f4] transition-all flex items-center justify-center gap-2"
                    >
                        <span className="w-2 h-2 bg-[#2a1a0f] rounded-full animate-pulse" />
                        CHAT DI WHATSAPP
                    </a>
                    <a
                        href={mapsLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 border border-[#f2ede4]/20 text-[#f2ede4] text-[10px] tracking-[2px] rounded-sm hover:bg-white/5 transition-all uppercase"
                    >
                        Petunjuk di Maps
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function Contact({ address, openingHours, phoneNumber, mapsLink }) {
    const dynamicContactInfo = (address || openingHours || phoneNumber)
        ? [
            {
                icon: "📍",
                title: "Alamat",
                lines: address ? address.split(',').map(s => s.trim()) : ["Jl. Kesawan No. 12", "Medan, Sumatera Utara 20111"]
            },
            {
                icon: "🕐",
                title: "Jam Buka",
                lines: openingHours
                    ? [openingHours.weekday, openingHours.weekend]
                    : ["Senin – Jumat: 07.00 – 21.00", "Sabtu – Minggu: 08.00 – 22.00"]
            },
            {
                icon: "📞",
                title: "Telepon",
                lines: [phoneNumber || "+62 812-3456-7890"]
            }
        ]
        : defaultContactInfo;

    return (
        <section id="kontak" className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
                <span className="text-[11px] tracking-[4px] text-[#c8a97a] mb-4 block font-medium uppercase">
                    Lokasi & Kontak
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-light text-[#2a1a0f]">
                    Temukan <em className="italic">Kami</em>
                </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 md:space-y-8">
                    {dynamicContactInfo.map(info => (
                        <ContactItem key={info.title} {...info} />
                    ))}
                </div>
                <ContactCTA phoneNumber={phoneNumber} mapsLink={mapsLink} />
            </div>
        </section>
    );
}
