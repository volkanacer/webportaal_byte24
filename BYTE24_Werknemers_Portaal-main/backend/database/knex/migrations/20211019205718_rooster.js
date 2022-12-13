exports.up = function (knex) {
  return knex.schema.createTable("rooster", (table) => {
    table.increments("id");
    table.integer("user_id").notNullable();
    table.string("title").notNullable();
    table.timestamp("start_hour").notNullable();
    table.timestamp("end_hour").notNullable();
    table.string("color").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("rooster");
};
