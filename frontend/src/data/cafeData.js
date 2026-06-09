const token = localStorage.getItem("token");

const baseUrl = import.meta.env.VITE_API_URL;

export const menuItems = [
    {
        name: "Black Ritual",
        category: "Espresso",
        price: "Rp 28.000",
        desc: "Double shot espresso dengan crema sempurna, biji pilihan single origin Toraja.",
        image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Cloudy Latte",
        category: "Latte",
        price: "Rp 35.000",
        desc: "Espresso lembut bertemu susu full cream yang di-steam dengan teliti.",
        image: "https://images.unsplash.com/photo-1536441573428-046644e7f810?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Cold Drip",
        category: "Cold Brew",
        price: "Rp 38.000",
        desc: "Diseduh dingin selama 12 jam, menghasilkan rasa halus & kompleks.",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Matcha Mist",
        category: "Non-Coffee",
        price: "Rp 32.000",
        desc: "Ceremonial grade matcha Jepang dengan susu oat pilihan.",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Honey Flat White",
        category: "Signature",
        price: "Rp 36.000",
        desc: "Flat white klasik dengan sentuhan madu lokal dan vanilla.",
        image: "https://images.unsplash.com/photo-1572286258217-40142c1c6a70?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Yuzu Tonic",
        category: "Sparkling",
        price: "Rp 33.000",
        desc: "Espresso + tonic water + yuzu segar. Segar, asam, tak terlupakan.",
        image: "https://images.unsplash.com/photo-1551046710-236480749021?q=80&w=800&auto=format&fit=crop"
    },
];


export const galleryItems = [
    { id: 1, label: "Interior Utama", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop", emoji: "🪑", desc: "Duduk, rasakan, nikmati" },
    { id: 2, label: "Pour Over Station", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop", emoji: "☕", desc: "Setiap tetes penuh perhatian" },
    { id: 3, label: "Bar Espresso", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop", emoji: "⚙️", desc: "Presisi dalam setiap seduhan" },
    { id: 4, label: "Sudut Baca", image: "https://images.unsplash.com/photo-1521017432531-fbd92d744264?q=80&w=800&auto=format&fit=crop", emoji: "📖", desc: "Tenang, fokus, menyatu" },
    { id: 5, label: "Window Seat", image: "https://images.unsplash.com/photo-1442975631115-c4f7b0f28abb?q=80&w=800&auto=format&fit=crop", emoji: "🪟", desc: "Cahaya pagi yang sempurna" },
    { id: 6, label: "Biji Kopi", image: "https://images.unsplash.com/photo-1498603536246-15572fea51b9?q=80&w=800&auto=format&fit=crop", emoji: "🫘", desc: "Biji lokal terbaik" },
];

export const menuCategories = ["Semua", "Espresso", "Latte", "Cold Brew", "Non-Coffee", "Signature", "Sparkling"];

export const stats = [
    ["3+", "Tahun Berdiri"],
    ["12+", "Varian Menu"],
    ["5.000+", "Pelanggan Setia"],
    ["100%", "Biji Kopi Lokal"],
];

export const contactInfo = [
    { icon: "📍", title: "Alamat", lines: ["Jl. Kesawan No. 12", "Medan, Sumatera Utara 20111"] },
    { icon: "🕐", title: "Jam Buka", lines: ["Senin – Jumat: 07.00 – 21.00", "Sabtu – Minggu: 08.00 – 22.00"] },
    { icon: "📞", title: "Telepon", lines: ["+62 812-3456-7890"] },
];


export const getMenuItems = async () => {
    try {
        const response = await fetch(`${baseUrl}/product/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
};

export const getCategories = async () => {
    try {
        const response = await fetch(`${baseUrl}/cat/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};
export const getAllCategories = async () => {
    try {
        const response = await fetch(`${baseUrl}/cat/all`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const getPublicWebInformation = async () => {
    try {
        const response = await fetch(`${baseUrl}/web-info`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching web information:", error);
        return null;
    }
};
