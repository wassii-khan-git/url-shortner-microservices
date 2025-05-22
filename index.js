// index.js
// where your node app starts

// init project
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js";

import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

// configurations
dotenv.config();

// app
const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log(__dirname);

app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint
app.use("/api", routes);

// Listen on port set in environment variable or default to 3000
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Server is listening on " + listener.address().port);
});
