import mongoose from "mongoose";

// Subschema for Gallery items
const GallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    shortDesc: { type: String },
    imagePath: { type: String, required: true }
});

const WebInformationSchema = new mongoose.Schema({
    mainTitle: { type: String, required: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String, required: true },

    // Mottos
    motto1: { type: String, required: true },
    motto2: { type: String, required: true },
    motto3: { type: String, required: true },

    address: { type: String, required: true },

    // Separate Opening Hours
    openingHours: {
        weekday: { type: String, required: true, default: "Senin - Jumat: 09:00 - 21:00" },
        weekend: { type: String, required: true, default: "Sabtu - Minggu: 10:00 - 23:00" }
    },

    phoneNumber: { type: String, required: true },
    establishedYear: { type: Number, required: true },
    mapsLink: { type: String, required: true },
    gallery: [GallerySchema]

}, { timestamps: true });

export default mongoose.model('WebInformation', WebInformationSchema);