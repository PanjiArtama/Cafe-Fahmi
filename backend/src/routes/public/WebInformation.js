import express from "express";
import { GetWebInformation } from "../../controllers/WebInformation.js";

const PublicWebInfo = express.Router();

PublicWebInfo.get("/", GetWebInformation);

export default PublicWebInfo;
