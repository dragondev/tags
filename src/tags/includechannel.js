const { listActions: { INCLUDE }, listTypes: { CHANNEL } } = require('../constants.js');

module.exports = {
	name: '+channel',
	run: ctx => [INCLUDE, CHANNEL, ctx.value]
};
