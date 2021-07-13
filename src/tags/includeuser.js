const { listActions: { INCLUDE }, listTypes: { USER } } = require('../constants.js');

module.exports = {
	name: '+user',
	run: ctx => [INCLUDE, USER, ctx.value]
};
