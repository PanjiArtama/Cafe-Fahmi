import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/Menu");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const originName = path.basename(file.originalname, ext);
        const filename = `${originName}${ext}`;
        cb(null, filename);
    }
});

const webInfoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/WebInfo");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const originName = path.basename(file.originalname, ext);
        const filename = `${Date.now()}-${originName}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("File harus berupa gambar"), false);
    }
};

export const uploadMenuImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export const uploadWebInfoImage = multer({
    storage: webInfoStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

