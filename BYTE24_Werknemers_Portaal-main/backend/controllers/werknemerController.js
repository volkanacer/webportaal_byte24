const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../knexfile").development;
const knex = require("knex")(config);
const { v4: uuidv4 } = require("uuid");
const Speakeasy = require("speakeasy");
const fs = require("fs");
const moment = require("moment");

const werknemerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ msg: "Voer een email in." });
    }
    if (!password) {
      return res.status(400).send({ msg: "Voer een wachtwoord in." });
    }

    const userRes = await knex("werknemer").where("email", email).first();

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

const werknemerForgotPassword = async (req, res) => {
  const { email } = req.body;

  const werknemer = await knex("werknemer").where("email", email).first();

  try {
    if (!validator.isEmail(email) || !email) {
      return res.status(400).send({ msg: "Please enter a valid email. " });
    }
    if (!werknemer) {
      return res
        .status(404)
        .send({ msg: "No account has been found related to that email. " });
    }

    if (!werknemer.is_approved) {
      return res
        .status(404)
        .send({ msg: "The employee is still not approved" });
    }

    if (werknemer.forgot_token === null) {
      const forgot_token = await uuidv4();

      await knex("werknemer").where("email", email).update({ forgot_token });

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

const werknemer = async (req, res) => {
  const { newPassword, newPasswordCheck } = req.body;
  const forgot_token = req.params.forgotToken;
  const werknemer = await knex("werknemer")
    .where({ forgot_token: forgot_token })
    .first();

  const number = /^(?=.*\d)/;
  const letter = /^(?=.*[A-Z])/;

  if (!werknemer) {
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

  knex("werknemer")
    .update({ password: hashedPassword, forgot_token: null })
    .where("id", werknemer.id)
    .then(async () => {
      res.status(200).send({
        msg: "Password is succesfully changed. You may proceed to login.",
      });
    })
    .catch(() => res.status(400).send({ msg: "Unable to change password." }));
};

const werknemerTokenValidation = async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];

    if (!token) return res.status(400).send({ msg: "Not existing." });

    const verified = await jwt.verify(token, process.env.SECRET_KEY);
    if (!verified) return res.status(400).send(false);
    const user = await knex("werknemer").where("id", verified.id).first();

    return res.status(200).send({
      user_name: user.user_name,
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

const werknemerGreet = async (req, res) => {
  const user_id = req.user;
  try {
    const response = await knex("werknemer")
      .where("werknemer.id", user_id)
      .select("werknemer.first_name", "werknemer.last_name");
    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const werknemerRooster = async (req, res) => {
  const user_id = req.user;
  try {
    const response = await knex("rooster")
      .where("user_id", user_id)
      .select("title", "start_hour as start", "end_hour as end", "id");
    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const werknemerUren = async (req, res) => {
  const user_id = req.user;
  try {
    const response = await knex("urenuren")
      .innerJoin("werknemer", "werknemer.id", "urenuren.user_id")
      .where("urenuren.user_id", user_id)
      .select("urenuren.*", "werknemer.first_name", "werknemer.last_name");

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

const werknemerUrenAdd = async (req, res) => {
  const { start_date, start_hour, end_hour, break_hour } = req.body;
  const user_id = req.user;
  try {
    await knex("urenuren").insert({
      start_date: start_date,
      start_hour: start_hour,
      end_hour: end_hour,
      break_hour: break_hour,
      user_id: user_id,
    });

    return res.status(200).send({
      msg: "Uren opgeslagen.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};

const werknemerUrenDelete = async (req, res) => {
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

const werknemerUrenUpdate = async (req, res) => {
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

const werknemerMedewerkerslijst = async (req, res) => {
  const user_id = req.user;
  try {
    const response = await knex("werknemer")
      .where("werknemer.id", user_id)
      .select(
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

/*const werknemerMedewerkerUpdaten = async (req, res) => {
  const { id, email } = req.body;
  console.log(req.body);
  try {
    await knex("werknemer").where("id", id).update({
      email: email,
    });

    return res.status(200).send({
      msg: "Medewerker geüpdatet.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: err.message });
  }
};*/

// Email

const werknemerDeleteEmail = async (req, res) => {
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

const werknemerGetEmail = async (req, res) => {
  // Alle ingevoerde werkuren zien
  try {
    const response = await knex("inbox")
      .innerJoin("werknemer", "werknemer.id", "inbox.user_id")
      .select("inbox.*", "werknemer.first_name", "werknemer.last_name");

    console.log(response);
    return res.status(200).send(response);
  } catch (err) {
    console.log(req.body);
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = {
  werknemerLogin,
  werknemer,
  werknemerForgotPassword,
  werknemerTokenValidation,
  werknemerGreet,
  werknemerRooster,
  werknemerUren,
  werknemerUrenAdd,
  werknemerUrenDelete,
  werknemerUrenUpdate,
  //werknemerMedewerkerUpdaten,
  werknemerMedewerkerslijst,
  werknemerDeleteEmail,
  werknemerGetEmail,
};
