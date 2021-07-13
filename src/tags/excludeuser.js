const {
  listActions: { EXCLUDE },
  listTypes: { USER },
} = require("../constants.js");

module.exports = {
  name: "-user",
  run: (ctx) => [EXCLUDE, USER, ctx.value],
};
