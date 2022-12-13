exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("uren")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("uren").insert([
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
