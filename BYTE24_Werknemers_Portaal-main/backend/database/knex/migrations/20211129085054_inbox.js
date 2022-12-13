exports.up = function (knex) {
  return knex.schema.createTable("inbox", (table) => {
    table.increments("id");
    table.integer("user_id").notNullable();
    table.string("title").notNullable();
    table.string("message").notNullable();
    table.timestamp("received_at").defaultTo(knex.fn.now());
    // blob voor bijlagen?
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("inbox");
};
