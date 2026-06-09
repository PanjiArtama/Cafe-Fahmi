import Product from '../models/Product.js';

const SeedProduct = async (cat) => {
    const categoryMap = {
        food: cat[0]._id,
        coffee: cat[1]._id,
        nonCoffee: cat[2]._id
    };
    const res = await Product.insertMany([
        {
            name: "Martabak Kering",
            category: categoryMap.food,
            price: 18000,
            desc: "Martabak kering yang cocok untuk cemilan",
            image: "/uploads/menu/martabak.jpg",
        },
        {
            name: "Tiramisu Cake",
            category: categoryMap.food,
            price: 45000,
            desc: "Cake lembut dengan rasa kopi dan krim khas tiramisu",
            image: "/uploads/menu/tiramisu.jpg",
        },
        {
            name: "Americano",
            category: categoryMap.coffee,
            price: 25000,
            desc: "Kopi hitam dengan rasa ringan dan aroma khas",
            image: "/uploads/menu/americano.jpg",
        },
        {
            name: "Espresso",
            category: categoryMap.coffee,
            price: 20000,
            desc: "Kopi pekat dengan rasa kuat dan bold",
            image: "/uploads/menu/espresso.jpg",
        },
        {
            name: "Iced Lemon Tea",
            category: categoryMap.nonCoffee,
            price: 15000,
            desc: "Teh dingin segar dengan perasan lemon",
            image: "/uploads/menu/icelemontea.jpg",
        },
        {
            name: "Thai Tea",
            category: categoryMap.nonCoffee,
            price: 18000,
            desc: "Minuman teh manis dengan susu khas Thailand",
            image: "/uploads/menu/thaitea.jpg",
        },
        {
            name: "Matcha",
            category: categoryMap.nonCoffee,
            price: 22000,
            desc: "Minuman teh hijau Jepang dengan rasa creamy",
            image: "/uploads/menu/matcha.jpg",
        }
    ]);
    console.log("Products seeded");
    return res;
};

export default SeedProduct;