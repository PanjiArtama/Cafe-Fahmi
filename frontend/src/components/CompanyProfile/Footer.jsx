export default function Footer({ mainTitle }) {
    const title = mainTitle || "Fahmi Cafe";
    return (
        <footer className="bg-[#1a0f08] py-12 px-6 text-center">
            <div className="font-serif text-2xl text-[#c8a97a] tracking-[4px] mb-4 uppercase">
                {title}
            </div>
            <p className="text-[10px] text-[#6b5544] tracking-widest font-light uppercase">
                © {new Date().getFullYear()} {title} · Medan, Indonesia · Semua Hak Dilindungi
            </p>
        </footer>
    );
}
