const express = require("express");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/auth");
const router = express.Router();
const adminController = require("../controllers/adminController.js");

require("dotenv").config({
  path: `${__dirname}/../../.env`,
});

// (Loginscherm) ---------------------------------------------------------------------

router.post("/login", adminController.adminLogin);

// (Rooster) ---------------------------------------------------------------------

router.get("/rooster", adminAuth, adminController.adminRooster);

router.post("/rooster-toevoegen", adminAuth, adminController.adminRoosterAdd);

router.post(
  "/rooster-verwijderen",
  adminAuth,
  adminController.adminRoosterDelete
);

router.post("/user", adminAuth, adminController.adminUser);

router.post("/user-toevoegen", adminAuth, adminController.adminUserAdd);

// (Urenoverzicht) ---------------------------------------------------------------------

router.get("/urenuren", adminAuth, adminController.adminUren); // ingevoerde uren krijgen van werknemers
router.get("/urenuren/:id", adminAuth, adminController.adminUrenMedewerker); // FILTER ingevoerde uren zien van specifieke medewerker

router.post("/uren-filter", adminAuth, adminController.adminUrenPeriodeMaand); // FILTER ingevoerde uren zien per maand

router.post("/uren-verwijderen", adminAuth, adminController.adminUrenDelete);

router.post("/uren-updaten", adminAuth, adminController.adminUrenUpdate);

router.get(
  "/medewerker-filter",
  adminAuth,
  adminController.adminMedewerkerSelect // Select input om medewerkers te selecteren
);

router.post(
  "/medewerker-maand",
  adminAuth,
  adminController.adminUrenPeriodeMaand
);

// (Medewerkerlijst) ---------------------------------------------------------------------

router.post("/werknemer", adminAuth, adminController.adminMedewerkersAdd);

router.get("/werknemer", adminAuth, adminController.adminMedewerkerslijst);

router.post(
  "/medewerker-updaten",
  adminAuth,
  adminController.adminMedewerkerUpdaten
);

router.post(
  "/medewerker-verwijderen",
  adminAuth,
  adminController.adminMedewerkerDelete
);

// (Email) ------------------------------------------------------------------------------

router.post("/send-email", adminAuth, adminController.adminSendEmail);

router.post("/email-delete", adminAuth, adminController.adminDeleteEmail);

router.post("/delete-email", adminAuth, adminController.adminDeleteEmail);

router.get("/get-email", adminAuth, adminController.adminGetEmail);

module.exports = router;
