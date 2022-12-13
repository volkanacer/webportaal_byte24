exports.up = function (knex) {
  return knex.schema.createTable("urenuren", (table) => {
    table.increments("id");
    table.integer("user_id").notNullable();
    table.date("start_date").notNullable();
    table.string("start_hour").notNullable();
    table.string("end_hour").notNullable();
    table.string("break_hour").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("urenuren");
};
