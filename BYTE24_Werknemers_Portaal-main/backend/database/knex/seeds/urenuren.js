exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("urenuren")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("urenuren").insert([
        {
          id: 1,
          user_id: "",
          date_hour: "",
          start_hour: "",
          end_hour: "",
          break_hour: "",
        },
      ]);
    });
};
