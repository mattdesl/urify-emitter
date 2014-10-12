var fs = require('fs-extra')
var path = require('path')
var through = require('through2')

var staticModule = require('static-module')
var datauri = require('datauri')
var escape = require('js-string-escape')

var loaderUtils = require("loader-utils")
var path = require("path")
var xtend = require('xtend')
var mkdirp = require('mkdirp')
var async = require('async')

var noslash = require('remove-trailing-slash')
var urljoin = require('url-join')

function toName(path, opt) {
    opt.resourcePath = path
    return loaderUtils.interpolateName(opt, opt.name || '[hash].[ext]', opt)
}

function norm(dir) {
    dir = noslash(dir)
    if (dir === '.')
        dir = ''
    //remove leading slash
    dir = dir.replace(/^(\.(\\|\/)+)?/, '')
    return dir
}

function toURI(path, opt, output) {
    var name = toName(path, opt)
    return urljoin(norm(output||''), name)
}

function copy(output, item, done) {
    var outfile = path.join(output, path.basename(item.uri))
    fs.copy(item.file, outfile, done)
}

function emit(output, uris) {
    async.eachSeries(uris, copy.bind(null, output), function(err) {
        if (err)
            throw new Error(err)
    })
}

module.exports = function(browserify, opt) {
    opt = opt||{}
    var uris = []
    opt.output = opt.o || opt.output || ''
    opt.base = opt.b || opt.base || ''
    
    browserify.on('bundle', function(bundle) {

        bundle.on('end', function() {
            mkdirp(opt.output, function(err) {
                if (err)
                    throw err
                emit(opt.output, uris)
            })
        })

    })

    browserify.transform(function(file) {
        return transform(file, opt, uris)
    }, { global: true })
}

function transform(file, opt, uris) {
    opt = opt||{}
    var limit = (opt.l || opt.limit)
    limit = typeof limit === 'number' ? limit : -1

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
            var uri = toURI(file, emitOpt, opt.base || opt.output)
            if (Array.isArray(uris)) {
                uris.push({
                    file: file,
                    uri: uri
                })
            }
            out = "'"+escape(uri)+"'"
        }
        return out
    }
}