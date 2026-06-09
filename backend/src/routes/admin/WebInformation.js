import express from "express";
import { GetWebInformation, UpdateWebInformation } from "../../controllers/WebInformation.js";
import { isAdmin } from "../../middleware/auth.js";
import { uploadWebInfoImage } from "../../middleware/uploadImage.js";

const AdminWebInfo = express.Router();

AdminWebInfo.get("/", isAdmin, GetWebInformation);
AdminWebInfo.put("/update", isAdmin, uploadWebInfoImage.array("galleryImages", 20), UpdateWebInformation);

export default AdminWebInfo;
