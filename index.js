const handlebars = require('handlebars')
const _ = require('lodash')

function getPicsets(msFilenames, msPicsetPath) {
	const picsets = {}

	const reParam = '_[0-9,]+[a-z]+'
	const reName = '[a-zA-Z-]*'
	const reExt = 'jpg|png|webp'
	const rePathPrefix = new RegExp(`${msPicsetPath}/`)
	const rePic = new RegExp(`${msPicsetPath}/(${reName}).*(${reParam})*.*\\.(${reExt})`)

	_.forEach(msFilenames, (pathedFilename) => {
		// Ensure it's a picset picture
		// * Sometimes things like Thumbs.db will try to sneak in
		if (!pathedFilename.match(rePic)) {
			return
		}

		// Extract basic information
		const filename = pathedFilename.replace(rePathPrefix, '')
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
		picsets[picsetName].filenames = picset.filenames.sort()
	})
	return picsets
}

function srcset(path, name, widths, ext) {
	return _.map(widths, (width) =>
		`/${path}/${name}-${width}.${ext} ${width}w`).join(',')
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

		handlebars.registerHelper('picset', (name, defaultWidth, sizes, alt) => {
			const picset = picsets[name]
			if (!picset) {
				throw new Error(`Couldn't find picset "${name}". Is it in ${opts.path}?`)
			}
			// Default sizes for validation
			if (!sizes) {
				sizes="100vw"
			}

			// Ensure default width exists
			// * It's easy for developer to mismatch filename params and handlebar param
			if (!defaultExistsIn(picset, defaultWidth)) {
				throw new Error(`Picset ${name} lacks default width of ${defaultWidth}`)
			}

			let ret = '<picture>'

			// WebP format
			ret += '<source type="image/webp" srcset="'
			ret += srcset(opts.path, name, picset.widths, 'webp')
			ret += `" sizes="${sizes}" />`

			// Img fallack
			const filename = `/${opts.path}/${name}-${defaultWidth}.${picset.fallbackExt}`
			ret += `<img src="${filename}" srcset="`
			ret += srcset(opts.path, name, picset.widths, picset.fallbackExt)
			ret += `" sizes="${sizes}" alt="${alt}" />`

			ret += '</picture>'

			return ret
		})

		setImmediate(done)
	}
}
