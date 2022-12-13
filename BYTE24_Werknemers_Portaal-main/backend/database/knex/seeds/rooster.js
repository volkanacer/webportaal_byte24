exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("rooster")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("rooster").insert([
        {
          id: 1,
          title: "",
          start_hour: "",
          end_hour: "",
          color: "",
        },
      ]);
    });
};
