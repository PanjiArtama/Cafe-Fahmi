import WebInformation from "../models/WebInformation.js";

export const GetWebInformation = async (req, res) => {
    try {
        const info = await WebInformation.findOne();
        if (!info) {
            return res.status(404).json({ message: "Web information not found" });
        }
        res.json(info);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const UpdateWebInformation = async (req, res) => {
    try {
        const {
            mainTitle,
            shortDesc,
            longDesc,
            motto1,
            motto2,
            motto3,
            address,
            phoneNumber,
            establishedYear,
            mapsLink,
        } = req.body;

        // Parse JSON fields sent as strings via FormData
        let openingHours = req.body.openingHours;
        if (typeof openingHours === 'string') {
            try { openingHours = JSON.parse(openingHours); } catch (e) { /* keep as-is */ }
        }

        let gallery = req.body.gallery;
        if (typeof gallery === 'string') {
            try { gallery = JSON.parse(gallery); } catch (e) { gallery = []; }
        }

        // Map uploaded files to their gallery items by index
        // Files are uploaded with fieldname "galleryImages" as an array
        const uploadedFiles = req.files || [];
        // req.body.galleryFileMap is a JSON string like {"0": true, "2": true}
        // indicating which gallery indices have new files
        let galleryFileMap = req.body.galleryFileMap;
        if (typeof galleryFileMap === 'string') {
            try { galleryFileMap = JSON.parse(galleryFileMap); } catch (e) { galleryFileMap = {}; }
        } else {
            galleryFileMap = galleryFileMap || {};
        }

        // Assign uploaded file paths to gallery items
        let fileIndex = 0;
        if (gallery && Array.isArray(gallery)) {
            gallery = gallery.map((item, i) => {
                if (galleryFileMap[String(i)] && uploadedFiles[fileIndex]) {
                    item.imagePath = `/uploads/WebInfo/${uploadedFiles[fileIndex].filename}`;
                    fileIndex++;
                }
                return item;
            });
        }

        const updateData = {
            mainTitle,
            shortDesc,
            longDesc,
            motto1,
            motto2,
            motto3,
            address,
            openingHours,
            phoneNumber,
            establishedYear,
            mapsLink,
            gallery
        };

        // Remove undefined fields so we don't accidentally overwrite with undefined
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // Find the single document and update it (upsert in case it doesn't exist)
        const info = await WebInformation.findOneAndUpdate(
            {},
            updateData,
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ message: "Web information updated successfully", data: info });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
