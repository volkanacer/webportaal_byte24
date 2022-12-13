exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("admin")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("admin").insert([
        {
          id: 1,
          first_name: "adminName",
          lasts_name: "adminLastname",
          email: "admin@admin.com",
          password:
            "$2a$10$vnVuUL33oz2PUBLGXGt3Ue70QHFdQ83e.qGuo3JzTCcs/izGPxgJ.",
          address: "adminStreet",
          zip_code: "1212ER",
          city: "adminStreet",
          forgot_token: "",
          activation_key: "",
          is_activated: true,
          is_approved: true,
          role: "Admin",
        },
      ]);
    });
};
