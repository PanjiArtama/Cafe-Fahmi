import WebInformation from "../models/WebInformation.js";

const SeedWebInformation = async () => {
    await WebInformation.deleteMany({});

    const data = await WebInformation.create({
        mainTitle: "Fahmi Cafe",
        shortDesc: "Secangkir kopi bukan sekadar minuman. Ini adalah jeda momen di antara kesibukan, ruang untuk menjadi diri sendiri.",
        longDesc: "Fahmi Cafe lahir dari kecintaan mendalam terhadap kopi Indonesia. Kami percaya bahwa kopi terbaik tidak harus rumit.\n\nBerlokasi di sudut kota Medan, kami hadir sebagai ruang ketiga — antara rumah dan kantor, tempat ide mengalir.",

        motto1: "Sederhana.",
        motto2: "Tulus.",
        motto3: "Penuh Rasa.",

        address: "Jl. Kesawan No. 12, Medan, Sumatera Utara 20111",

        openingHours: {
            weekday: "Senin – Jumat: 07.00 – 21.00",
            weekend: "Sabtu – Minggu: 08.00 – 22.00"
        },

        phoneNumber: "+62 812-3456-7890",
        establishedYear: 2021,
        mapsLink: "https://maps.google.com",

        gallery: [
            {
                title: "Interior Utama",
                shortDesc: "Duduk, rasakan, nikmati",
                imagePath: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Pour Over Station",
                shortDesc: "Setiap tetes penuh perhatian",
                imagePath: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Bar Espresso",
                shortDesc: "Presisi dalam setiap seduhan",
                imagePath: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Sudut Baca",
                shortDesc: "Tenang, fokus, menyatu",
                imagePath: "https://images.unsplash.com/photo-1521017432531-fbd92d744264?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Window Seat",
                shortDesc: "Cahaya pagi yang sempurna",
                imagePath: "https://images.unsplash.com/photo-1442975631115-c4f7b0f28abb?q=80&w=800&auto=format&fit=crop"
            },
            {
                title: "Biji Kopi",
                shortDesc: "Biji lokal terbaik",
                imagePath: "https://images.unsplash.com/photo-1498603536246-15572fea51b9?q=80&w=800&auto=format&fit=crop"
            }
        ]
    });

    console.log("WebInformation seeded ✓");
    return data;
};

export default SeedWebInformation;
