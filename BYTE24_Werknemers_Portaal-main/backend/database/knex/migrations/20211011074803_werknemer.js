exports.up = function (knex) {
  return knex.schema.createTable("werknemer", (table) => {
    table.increments("id");
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.string("address").nullable();
    table.string("zip_code").nullable();
    table.string("city").nullable();
    table.string("forgot_token").nullable();
    table.string("activation_key").nullable();
    table.boolean("is_activated").notNullable();
    table.boolean("is_approved").notNullable();
    table.date("activation_date").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("werknemer");
};
