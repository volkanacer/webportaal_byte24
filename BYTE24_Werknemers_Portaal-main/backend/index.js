const express = require("express");
const cors = require("cors");
const adminRoute = require("./routes/adminRoute");
const werknemerRoute = require("./routes/werknemerRoute");
const upload = require("express-fileupload");
const cron = require("node-cron");
const config = require("./knexfile").development;
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000"], //Change to corresponding origin  'http://localhost:3000'
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/werknemer", werknemerRoute);
app.use("/admin", adminRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
