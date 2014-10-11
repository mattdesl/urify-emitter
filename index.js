var fs = require('fs-extra')
var path = require('path')
var through = require('through2')

var staticModule = require('static-module')
var datauri = require('datauri')
var escape = require('js-string-escape')

var loaderUtils = require("loader-utils");
var path = require("path");
var xtend = require('xtend')
var mkdirp = require('mkdirp')
var async = require('async')

function toURI(path, opt) {
    opt.resourcePath = path
    return loaderUtils.interpolateName(opt, opt.name || '[hash].[ext]', opt)
}

function copy(output, item, done) {
    var outfile = path.join(output, path.basename(item.file))
    fs.copy(item.file, outfile, done)
}

function emit(output, uris) {
    var out = []
    async.eachSeries(uris, copy.bind(null, output), function(err) {
        if (err)
            throw new Error(err)
    })
    // fs.writeFileSync("test.txt", JSON.stringify(out))
}

module.exports = function(browserify, opt) {
    opt = opt||{}
    var uris = []
    var output = (opt.o || opt.output) || ''
    var limit = (opt.l || opt.limit)
    limit = typeof limit === 'number' ? limit : -1

    browserify.on('bundle', function(bundle) {

        bundle.on('end', function() {
            mkdirp(output, function(err) {
                if (err)
                    throw err
                emit(output, uris)
            })
        });

    });

    browserify.transform(function(file) {
        if (/\.json$/.test(file)) return through()
        var vars = {
            __filename: file,
            __dirname: path.dirname(file)
        }
        
        var sm = staticModule(
            { 'datauri': urify },
            { vars: vars }
        )
        return sm
        
        function urify(file, emitOpt) {
            if (!fs.statSync(file).isFile())
                throw new Error('datauri must point to a file: '+file)

            emitOpt = emitOpt||{}
            emitOpt.content = fs.readFileSync(file, emitOpt.encoding)

            var out 
            if (limit >= 0 && emitOpt.content.length <= limit) {
                var data = datauri(file)
                out = "'"+escape(data)+"'"
            } else {
                var uri = toURI(file, emitOpt)
                uris.push({
                    file: file,
                    uri: uri
                })
                out = "'"+escape(uri)+"'"
            }
            return out
        }

    });

};