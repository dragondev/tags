const {
  listActions: { INCLUDE },
  listTypes: { ROLE },
} = require("../constants.js");

module.exports = {
  name: "+role",
  run: (ctx) => [INCLUDE, ROLE, ctx.value],
};
