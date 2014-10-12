//browserify runs module-deps before the plugins are setup,
//which means all the modules will already have their urlify transforms
//already run. Instead, we need to disable it for the command-line
//and run it through the plugin architecture as a global transform

//Hopefully a solve will be found shortly....

var through = require('through2')
// var urify = require('urify')

// function noop(file, opt) {
//     return through()
// }

// urify.__emitter = noop
module.exports = require('./plugin')

// module.exports.enabled = function(bool) {
// 	urify.__emitter = bool ? noop : null
// }

// module.exports.enabled(true)