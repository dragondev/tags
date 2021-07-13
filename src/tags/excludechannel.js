const {
  listActions: { EXCLUDE },
  listTypes: { CHANNEL },
} = require("../constants.js");

module.exports = {
  name: "-channel",
  run: (ctx) => [EXCLUDE, CHANNEL, ctx.value],
};
