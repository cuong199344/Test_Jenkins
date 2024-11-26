import express from "express";


import userRoute from "./userRoutes.js";


const router = express.Router();

const path = "/api-v1/";


router.use(`${path}users`, userRoute);


export default router;
