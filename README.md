# urify-emitter

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Similar to webpack's file-loader, this builds on the [urify](https://www.npmjs.org/package/urify) transform but emits a file into an application-level output directory. This allows for modular front-end code which relies on images and icons, without increasing JS bundle size or sacrificing browser image caching optimizations. 

Example front-end code:  

```js
var datauri = require('datauri')
var uri = datauri(__dirname+'/icon.png')

var img = new Image()
img.onload = function() {
	console.log("Image loaded!")
}
img.src = uri
```

Now, from your application, you can bundle the code using the urify-emitter plugin.


```browserify -p [ urify-emitter -o images ] index.js > bundle.js```

This will emit a `bundle.js` file, which inlines the URI like so:  

```js
var uri = '53cf2c1426533b467d606312b4e246ef.png'
```

It will also copy the static asset `icon.png` with the above hashed URL to your specified output directory, in this case `images`. 

You can also specifiy a `--limit` (or `-l`) option, and if the file is under that size in bytes, it will be inlined as a regular data URI.


**NOTE:** Because of the way browserify and module-deps transform loading works, this currently is not applied to a projects dependencies -- only the top-level source. 

## Usage

[![NPM](https://nodei.co/npm/urify-emitter.png)](https://nodei.co/npm/urify-emitter/)

- `--output`, `-o` the output directory, defaults to `.`
- `--limit`, `-l` the limit in bytes, under which we will inline with a Data URI
- `--base`, `-b` an optional base to use on the inlined URL, which is joined with the asset name. For example, your local output directory might be in `app/output`, but your site URLs you can specify `--base output` so they look like `output/53cf2c14265..png`

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/urify-emitter/blob/master/LICENSE.md) for details.
