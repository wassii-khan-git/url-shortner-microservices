import express from "express";
import {
  RedirectToUrlController,
  ShortUrlController,
} from "../controller/controller.js";

const router = express.Router();

// Define API routes
router.post("/shorturl", ShortUrlController); // POST /shorturl to shorten
router.get("/shorturl/:urlCode", RedirectToUrlController); // GET /shorturl/:urlCode to redirect

export default router;
