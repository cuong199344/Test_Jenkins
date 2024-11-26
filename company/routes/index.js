import express from "express";

import companyRoute from "./companiesRoutes.js";


const router = express.Router();

const path = "/company/api-v1/";

router.use(`${path}companies`, companyRoute);


export default router;
