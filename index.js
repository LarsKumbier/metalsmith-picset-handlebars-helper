const _ = require('lodash')

module.exports = (opts) => {
	return function(files, metalsmith, done) {
		/*
		console.log('Inside: metalsmith-picset-handlebars-helper')
		console.log(opts)
		*/

		_.forEach(files, (file, filename) => {
			// console.log(filename)
		})

		setImmediate(done)
	}
}
