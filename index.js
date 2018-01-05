'use strict'

const path = require('path')
const co = require('co')
const pify = require('promise.ify')
const fs = pify.all(require('fs-extra'))
const _ = require('lodash')
const parser = require('./lib/parser.js')
const LocalUtil = require('./lib/util.js')

const FILE_TOO_SMALL = 'file too small'

/**
 * get ID3 info
 */

module.exports = co.wrap(function*(fd) {
    if (typeof fd !== 'number') {
        const filename = path.resolve(fd)
        fd = yield fs.openAsync(filename, 'r')
    }

    const stat = yield fs.fstatAsync(fd)
    if (stat.size < 10) {
        throw new Error(FILE_TOO_SMALL)
    }

    const buf = Buffer.alloc(4)
    yield fs.readAsync(
        fd,
        buf,
        0,
        buf.length,
        6 // offset, length, position
    )
    const minSize = LocalUtil.getID3TotalSize(buf)
    if (stat.size <= minSize) {
        throw new Error(FILE_TOO_SMALL)
    }

    const stream = fs.createReadStream('', {
        fd,
    })
    const p = parser.create()
    process.nextTick(() => {
        stream.pipe(p)
    })

    const info = yield new Promise((resolve) => {
        p.on('readable', function() {
            resolve(p.read())
        })
    })

    const ret = {}

    let singer = _.find(info.ID3, ['id', 'TPE1'])
    let title = _.find(info.ID3, ['id', 'TIT2'])
    let album = _.find(info.ID3, ['id', 'TALB'])
    let genre = _.find(info.ID3, ['id', 'TCON'])
    let year = _.find(info.ID3, ['id', 'TYER'])
    singer = singer.content
    title = title.content
    album = album.content
    genre = genre.content
    year = year.content

    return {
        singer,
        title,
        album,
        genre,
        year,
        raw : info,
    }
})
