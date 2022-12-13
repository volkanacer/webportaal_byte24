exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("werknemer")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("werknemer").insert([
        {
          id: 3,
          first_name: "Jan",
          lasts_name: "Jantje",
          email: "janjantje@medewerker.nl",
          password:
            "$2a$10$vnVuUL33oz2PUBLGXGt3Ue70QHFdQ83e.qGuo3JzTCcs/izGPxgJ.",
          address: "Straatnaam 55",
          zip_code: "9966NB",
          city: "Plaatsnaam",
          forgot_token: "",
          activation_key: "",
          is_activated: true,
          is_approved: true,
          role: "Werknemer",
        },
      ]);
    });
};
