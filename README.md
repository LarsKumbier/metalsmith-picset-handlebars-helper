# CURRENTLY IN DEVELOPMENT - NOT YET READY FOR USE

Uses image sets generated by [metalsmith-picset-generate](https://github.com/AnthonyAstige/metalsmith-picset-generate) to give browsers choice

## Example use

Add to your pipeline like

```sh
npm i metalsmith-picset-handlebars-helper --save
```

```javascript
const picsetHandlearsHelper = require('metalsmith-picset-handlebars-helper')
Metalsmith(__dirname)
	...
	.use(picsetHandlearsHelper())
	...
```

Assume

 * You have a **handlebars** package installed somewhere either directly or as a sub-dependency (We use that same version / install)
 * `/img/picset/anthony_80webp_90jpg_2000,1000,500,250,125.jpg` as a 2000px wide 90% quality photo
 * [metalsmith-picset-generate](https://github.com/AnthonyAstige/metalsmith-picset-generate) is used earlier in your metalsmith pipeline

Then use the handlebars helper like `{{{picset "anthony" 500 "Anthony's Face"}}}` to output something like

```html
<picture>
	<source type="image/webp" srcset="img/srcsets/anthony-2000.webp 2000w, img/srcsets/anthony-1000.webp 1000w, img/srcsets/anthony-500.webp 500w, img/srcsets/anthony-250.webp 250w, img/srcsets/anthony-125.webp 125w">
	<img src="img/srcsets/anthony-500.jpg" srcset="img/srcsets/anthony-2000.jpg 2000w, img/srcsets/anthony-1000.jpg 1000w, img/srcsets/anthony-500.jpg 500w, img/srcsets/anthony-250.jpg 250w, img/srcsts/anthony-125.jpg 125w" alt="Anthony's Face" />
</picture>
```
## Specification

### Metalsmith requirements

 * You have a **handlebars** package installed somewhere either directly or as a sub-dependency (We use that same version / install)

### Metalsmith options object

```javascript
{
	path: 'img/picset'
}
```

**path**

* Relative to Metalsmith **source** folder
* Default: `img/picset/`

**Helper use**

Like `{{{picset NAME DEFAULT_WIDTH ALT_TAG}}}`

 * Parameter 1 (NAME): Image source name
 * Parameter 2 (DEFAULT_WIDTH): Default width
 * Parameter 3 (ALT_TAG): Optional alt tag

Generates `<picture>` elements with:

* `srcset` parameters that include all files found following [metalsmith-picset-generate](https://github.com/AnthonyAstige/metalsmith-picset-generate)'s naming convention
* `<source>` with `.webp` type in `srcset`
* `<img>` with:
 * `srcset` with file type of `.jpg`, `.png`, or `.svg` as a fallback
 * `src` at default width and same file type as it's srcset

## Background info

### Philosophy

[Convention over Configuration](https://en.wikipedia.org/wiki/Convention_over_configuration)

* Give the browser all availble choices
* Simple case of resizing only (not artistic decisions)
 * No implementation for `size="..."`, though it could be added to this later
* Reduce bandwidth bloat and keep high quality:
 1. `.webp` is first choice
 1. Responsive size is first choice
 1. Always give fallbacks
* Standards based (Using `<picture>` with inner `<img src="...">` fallback)

### Inspiration

* [Responsive Images: If you’re just changing resolutions, use srcset](https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-srcset/)
* [Don’t use \<picture\> (most of the time)](https://cloudfour.com/thinks/dont-use-picture-most-of-the-time/)
* [Using the picture element to load WebP images with fallback](https://walterebert.com/blog/using-the-picture-element-to-load-webp-images-with-fallback/)

### Implementation

* Implemented on Node v6.9.1, untested in other versions
* Doesn't install handlebars, as assumes you have it in your MetalSmith install and we want to use that same version
