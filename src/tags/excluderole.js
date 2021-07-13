const {
  listActions: { EXCLUDE },
  listTypes: { ROLE },
} = require("../constants.js");

module.exports = {
  name: "-role",
  run: (ctx) => [EXCLUDE, ROLE, ctx.value],
};
