// TODO: Refactor, rename, etc everything in this file as needed

const handlebars = require('handlebars')
const _ = require('lodash')

function getPicsets(msFilenames, msPicsetPath) {
	const picsets = {}
	const src = new RegExp(`^${msPicsetPath}/`)

	_.forEach(msFilenames, (pathedFilename) => {
		// Skip non matching
		if (!pathedFilename.match(src)) {
			return
		}

		// Extract basic information
		const filename = pathedFilename.replace(src, '')
		const picsetName = filename.substr(0, filename.lastIndexOf('-'))
		const width = Number(filename.match(/.*-([0-9]+).[A-z]+/)[1])
		const ext = filename.substr(filename.lastIndexOf('.') + 1)
		if (!picsets[picsetName]) {
			picsets[picsetName] = {
				name: picsetName,
				widths: [],
				filenames: []
			}
		}

		if (ext !== 'webp') {
			picsets[picsetName].fallbackExt = ext
		}

		// Populate unsorted and include dupes
		picsets[picsetName].widths.push(width)
		picsets[picsetName].filenames.push(filename)
	})

	// Cleanup
	_.forEach(picsets, (picset, picsetName) => {
		picsets[picsetName].widths = _.uniq(picset.widths).sort((a, b) => a > b)
		picsets[picsetName].filesname = picset.filenames.sort()
	})
	return picsets
}

function srcset(path, name, widths, ext) {
	return _.map(widths, (width) => `/${path}/${name}-${width}.webp ${width}w`).join(',')
}

function defaultExistsIn(picset, width) {
	return _.includes(picset.filenames, `${picset.name}-${width}.${picset.fallbackExt}`)
}

module.exports = (options) => {
	// Options and defaults
	const opts = options || {}
	if (!opts.path) {
		opts.path = 'img/picset'
	}

	return function(files, metalsmith, done) {
		const picsets = getPicsets(_.keys(files), opts.path)

		handlebars.registerHelper('picset', (name, defaultWidth, alt) => {
			const picset = picsets[name]

			// Ensure default width exists
			// * It's easy for developer to mismatch filename params and handlebar param
			if (!defaultExistsIn(picset, defaultWidth)) {
				throw new Error(`Picset ${name} lacks default width of ${defaultWidth}`)
			}

			let ret = '<picture>'

			// WebP format
			ret += '<source type="image/webp" srcset="'
			ret += srcset(opts.path, name, picset.widths, 'webp')
			ret += '">'

			// Img fallack
			const filename = `/${opts.path}/${name}-${defaultWidth}.${picset.fallbackExt}`
			ret += `<img src="${filename}" srcset=""'`
			ret += srcset(opts.path, name, picset.widths, picset.fallbackExt)
			ret += `" alt="${alt}" />`

			ret += '</picture>'

			return ret
		})

		setImmediate(done)
	}
}
