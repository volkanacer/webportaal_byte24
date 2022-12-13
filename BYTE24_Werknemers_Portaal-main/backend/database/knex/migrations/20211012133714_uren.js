exports.up = function (knex) {
  return knex.schema.createTable("uren", (table) => {
    table.increments("id");
    table.integer("user_id").notNullable();
    table.timestamp("start_date").notNullable();
    table.timestamp("start_hour").notNullable();
    table.timestamp("end_hour").notNullable();
    table.integer("break_hour").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("uren");
};
