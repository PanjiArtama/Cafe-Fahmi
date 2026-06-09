import { stats as defaultStats } from "../../data/cafeData";

export default function Stats({ establishedYear }) {
    const currentYear = new Date().getFullYear();
    const yearsEstablished = establishedYear
        ? `${currentYear - establishedYear}+`
        : defaultStats[0][0];

    const dynamicStats = [
        [yearsEstablished, "Tahun Berdiri"],
        ...defaultStats.slice(1)
    ];

    return (
        <div className="bg-[#2a1a0f] py-12 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-full justify-center">
            {dynamicStats.map(([num, label]) => (
                <div key={label} className="text-center">
                    <div className="font-serif text-4xl text-[#c8a97a] leading-none">{num}</div>
                    <div className="text-[10px] tracking-widest text-[#a89080] mt-2 uppercase">{label}</div>
                </div>
            ))}
        </div>
    );
}
