const { tagTypes: { DELETE } } = require('../constants');

module.exports = {
	name: 'delete',
	run: () => [DELETE]
};
