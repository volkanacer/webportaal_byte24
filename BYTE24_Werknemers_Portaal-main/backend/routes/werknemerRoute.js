const express = require("express");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/auth");
const router = express.Router();
const werknemerController = require("../controllers/werknemerController.js");

require("dotenv").config({
  path: `${__dirname}/../../.env`,
});

// (Login) ---------------------------------------------------------------------

router.post("/login", werknemerController.werknemerLogin);

// (Index) ---------------------------------------------------------------------

router.get("/werknemer-greet", auth, werknemerController.werknemerGreet);

// (Rooster) ---------------------------------------------------------------------

router.get("/rooster", auth, werknemerController.werknemerRooster);

// (Urenoverzicht) ---------------------------------------------------------------------

router.post("/uren-toevoegen", auth, werknemerController.werknemerUrenAdd);

router.post("/uren-verwijderen", auth, werknemerController.werknemerUrenDelete);

router.post("/uren-updaten", auth, werknemerController.werknemerUrenUpdate);

router.get("/urenuren", auth, werknemerController.werknemerUren);

// (Medewerkerlijst) ---------------------------------------------------------------------

router.get("/werknemer", auth, werknemerController.werknemerMedewerkerslijst);

/*router.post(
  "/medewerker-updaten",
  auth,
  werknemerController.werknemerMedewerkerUpdaten
);*/

// (Email) ---------------------------------------------------------------------

router.get("/get-email", auth, werknemerController.werknemerGetEmail);

router.post("/delete-email", auth, werknemerController.werknemerDeleteEmail);

module.exports = router;
