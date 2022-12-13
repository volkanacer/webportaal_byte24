const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../knexfile").development;
const upload = require("express-fileupload");
const knex = require("knex")(config);
const Speakeasy = require("speakeasy");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ msg: "Voer een email in." });
    }
    if (!password) {
      return res.status(400).send({ msg: "Voer een wachtwoord in." });
    }

    const userRes = await knex("admin").where("email", email).first();

    if (!userRes) {
      return res
        .status(400)
        .send({ msg: "User with this email does not exist." });
    }

    const passwordCompare = await bcrypt.compare(password, userRes.password);
    if (!passwordCompare) {
      return res.status(400).send({ msg: "Wrong password." });
    }

    const token = await jwt.sign(
      { id: userRes.id, email: userRes.email },
      process.env.SECRET_KEY
    );

    return res.status(200).send({
      token,
      user: {},
    });
  } catch (err) {
    res.status(500).send({ msg: "Unable to Login." });
  }
};

const adminForgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await knex("admin").where("email", email).first();

  try {
    if (!validator.isEmail(email) || !email) {
      return res.status(400).send({ msg: "Please enter a valid email. " });
    }
    if (!admin) {
      return res
        .status(404)
        .send({ msg: "No account has been found related to that email. " });
    }

    if (!admin.is_approved) {
      return res
        .status(404)
        .send({ msg: "The employee is still not approved" });
    }

    if (admin.forgot_token === null) {
      const forgot_token = await uuidv4();

      await knex("admin").where("email", email).update({ forgot_token });

      await sendForgotPasswordViaEmail(email, forgot_token);

      return res
        .status(200)
        .send({ msg: "Password change mail has been sent." });
    }
    return res.status(400).send({
      msg:
        "Password change mail is already been sent. Please check your email.",
    });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

const admin = async (req, res) => {
  const { newPassword, newPasswordCheck } = req.body;
  const forgot_token = req.params.forgotToken;
  const admin = await knex("admin")
    .where({ forgot_token: forgot_token })
    .first();

  const number = /^(?=.*\d)/;
  const letter = /^(?=.*[A-Z])/;

  if (!admin) {
    return res.status(400).send({
      msg:
        "The employee is not found related to this forgot password change request.",
    });
  }
  if (!newPassword) {
    return res.status(400).send({ msg: "Please enter your new password." });
  }
  if (!newPasswordCheck) {
    return res
      .status(400)
      .send({ msg: "Please enter your new password for second time." });
  }
  if (!number.test(newPassword)) {
    return res.status(400).send({
      msg: "Please enter a password that is containing at least a number.",
    });
  }
  if (!letter.test(newPassword)) {
    return res.status(400).send({
      msg: "Please enter at least one uppercase letter in your password.",
    });
  }
  if (newPassword.length < 6) {
    return res.status(400).send({
      msg: "Please enter a password that is at least 6 or more characters. ",
    });
  }
  if (newPassword !== newPasswordCheck) {
    return res.status(400).send({ msg: "Passwords do not match." });
  }

  const theSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, theSalt);

  knex("admin")
    .update({ password: hashedPassword, forgot_token: null })
    .where("id", admin.id)
    .then(async () => {
      res.status(200).send({
        msg: "Password is succesfully changed. You may proceed to login.",
      });
    })
    .catch(() => res.status(400).send({ msg: "Unable to change password." }));
};

const adminTokenValidation = async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) return res.status(400).send({ msg: "Not existing." });

    const verified = await jwt.verify(token, process.env.SECRET_KEY);
    if (!verified) return res.status(400).send(false);
    const user = await knex("admin").where("id", verified.id).first();

    return res.status(200).send({
      user_name: user.user_name,
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

// Rooster

const adminRooster = async (req, res) => {
  // Rooster met planningen laten zien
  try {
    const response = await knex("rooster").select(
      "title",
      "start_hour as start",
      "end_hour as end",
      "id",
      "color"
    );

    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const adminRoosterAdd = async (req, res) => {
  // Planning toevoegen
  const { title, start_hour, end_hour, user_id, color } = req.body;
  try {
    await knex("rooster").insert({
      title: title,
      user_id: user_id,
      start_hour: start_hour,
      end_hour: end_hour,
      color: color,
    });

    return res.status(200).send({
      msg: "Rooster opgeslagen.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminUser = async (req, res) => {
  const user_id = req.user;
  try {
    const response = await knex("rooster")
      .where("user_id", user_id)
      .select("user_id as user");

    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const adminUserAdd = async (req, res) => {
  // Medewerkers indelen in de planning (rooster)
  const user_id = req.user;
  const { user } = req.body;
  try {
    await knex("rooster").insert({
      user_id: user,
    });

    return res.status(200).send({
      msg: "User toegevoegd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminRoosterDelete = async (req, res) => {
  // Rooster verwijderen
  const { id } = req.body;
  try {
    await knex("rooster").where("id", id).delete();

    return res.status(200).send({
      msg: "Rooster verwijderd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

// Urenoverzicht

const adminUren = async (req, res) => {
  // Alle ingevoerde werkuren zien
  try {
    const response = await knex("urenuren")
      .innerJoin("werknemer", "werknemer.id", "urenuren.user_id")
      .select("urenuren.*", "werknemer.first_name", "werknemer.last_name");

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const adminUrenMedewerker = async (req, res) => {
  // FILTER ingevoerde uren zien van specifieke medewerker
  try {
    const medewerkerid = req.params.id;
    const response = await knex("urenuren")
      .where("user_id", medewerkerid)
      .innerJoin("werknemer", "werknemer.id", "urenuren.user_id")
      .select("urenuren.*", "werknemer.first_name", "werknemer.last_name");

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

const adminUrenPeriodeMaand = async (req, res) => {
  // FILTER ingevoerde uren zien per maand
  try {
    console.log("test");

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const response = await knex("urenuren")
      .whereBetween("start_date", [firstDay, lastDay])
      .innerJoin("werknemer", "werknemer.id", "urenuren.user_id")
      .select(
        "urenuren.*",
        "urenuren.start_date",
        "werknemer.first_name",
        "werknemer.last_name"
      );

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminUrenDelete = async (req, res) => {
  // Ingevoerde uren verwijderen
  const { id } = req.body;
  try {
    await knex("urenuren").where("id", id).delete();

    return res.status(200).send({
      msg: "Werkuren verwijderd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminUrenUpdate = async (req, res) => {
  // Ingevoerde uren updaten
  const { id, start_date, start_hour, end_hour, break_hour } = req.body;
  console.log(req.body);
  try {
    await knex("urenuren").where("id", id).update({
      start_date: start_date,
      start_hour: start_hour,
      end_hour: end_hour,
      break_hour: break_hour,
    });

    return res.status(200).send({
      msg: "Werkuren geüpdatet.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminMedewerkerSelect = async (req, res) => {
  // Select input om medewerkers te selecteren
  try {
    const response = await knex("werknemer").select(
      "werknemer.id",
      "werknemer.first_name",
      "werknemer.last_name"
    );

    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

// Medewerkerslijst

const adminMedewerkerslijst = async (req, res) => {
  // Lijst met medewerkers vertonen
  try {
    const response = await knex("werknemer").select(
      "werknemer.first_name",
      "werknemer.last_name",
      "werknemer.email",
      "werknemer.address",
      "werknemer.zip_code",
      "werknemer.city"
    );
    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const adminMedewerkersAdd = async (req, res) => {
  // Medewerkers toevoegen aan de lijst
  const {
    first_name,
    last_name,
    email,
    password,
    address,
    zip_code,
    city,
  } = req.body;
  try {
    await knex("werknemer").insert({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
      address: address,
      zip_code: zip_code,
      city: city,
      is_activated: true,
      is_approved: true,
    });

    return res.status(200).send({
      msg: "Medewerker toegevoegd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminMedewerkerDelete = async (req, res) => {
  // Medewerkers verwijderen van de lijst
  const { id } = req.body;
  console.log(req.body);
  try {
    await knex("werknemer").where("id", id).del();

    return res.status(200).send({
      msg: "Medewerker verwijderd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminMedewerkerUpdaten = async (req, res) => {
  // Medewerkers van de lijst updaten
  const {
    id,
    first_name,
    last_name,
    email,
    address,
    zip_code,
    city,
  } = req.body;
  console.log(req.body);
  try {
    await knex("werknemer").where("id", id).update({
      first_name: first_name,
      last_name: last_name,
      email: email,
      address: address,
      zip_code: zip_code,
      city: city,
    });

    return res.status(200).send({
      msg: "Medewerker geüpdatet.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

// Email

const adminSendEmail = async (req, res) => {
  // Email versturen naar database
  const { title, message } = req.body;
  const user_id = req.user;
  console.log(req.body);
  try {
    await knex("inbox").insert({
      user_id: user_id,
      title: title,
      message: message,
    });

    return res.status(200).send({
      msg: "Email opgeslagen.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const adminDeleteEmail = async (req, res) => {
  // email berichten verwijderen
  const { id } = req.body;
  try {
    await knex("inbox").where("id", id).delete();

    return res.status(200).send({
      msg: "Bericht verwijderd.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

/*const adminGetEmail = async (req, res) => {
  // Alle emails zien
  try {
    const response = await knex("inbox")
      .innerJoin("werknemer", "werknemer.id", "inbox.user_id")
      .select("inbox.*");

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};
*/

const adminGetEmail = async (req, res) => {
  // Alle emails zien
  try {
    const response = await knex("inbox").select(
      "title",
      "received_at",
      "message"
    );

    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  adminLogin,
  admin,
  adminForgotPassword,
  adminTokenValidation,
  adminRooster,
  adminRoosterAdd,
  adminUser,
  adminUserAdd,
  adminRoosterDelete,
  adminUren,
  adminUrenDelete,
  adminUrenUpdate,
  adminMedewerkerSelect,
  adminMedewerkersAdd,
  adminUrenMedewerker,
  adminUrenPeriodeMaand,
  adminMedewerkerslijst,
  adminMedewerkerUpdaten,
  adminMedewerkerDelete,
  adminSendEmail,
  adminDeleteEmail,
  adminGetEmail,
};
