'use strict'

const Path = require('path')
const Fs = require('fs')
const Bluebird = require('bluebird')
const _ = require('lodash')
const parser = require('./lib/parser.js')
const LocalUtil = require('./lib/util.js')

const openAsync = Bluebird.promisify(Fs.open)
const fstatAsync = Bluebird.promisify(Fs.fstat)
const readAsync = Bluebird.promisify(Fs.read)

const FILE_TOO_SMALL = 'file too small'

/**
 * get ID3 info
 */

module.exports = async (fd) => {
    if (typeof fd !== 'number') {
        const filename = Path.resolve(fd)
        fd = await openAsync(filename, 'r')
    }
    const stat = fstatAsync(fd)
    if (stat.size < 10) {
        throw new Error(FILE_TOO_SMALL)
    }

    const buf = Buffer.alloc(4)
    await readAsync(fd, buf, 0, buf.length, 6)

    const minSize = LocalUtil.getID3TotalSize(buf)
    console.log(`ID3 Size : ${minSize} bytes`)
    if (stat.size <= minSize) {
        throw new Error(FILE_TOO_SMALL)
    }

    const stream = Fs.createReadStream('', { fd })
    try {
        const p = parser.create()
        process.nextTick(() => {
            stream.pipe(p)
        })

        const info = await new Promise((resolve) => {
            p.on('readable', () => {
                resolve(p.read())
            })
        })

        let singer = _.find(info.ID3, ['id', 'TPE1'])
        let title = _.find(info.ID3, ['id', 'TIT2'])
        let album = _.find(info.ID3, ['id', 'TALB'])
        let genre = _.find(info.ID3, ['id', 'TCON'])
        let year = _.find(info.ID3, ['id', 'TYER'])
        singer = singer ? singer.content : null
        title = title ? title.content : null
        album = album ? album.content : null
        genre = genre ? genre.content : null
        year = year ? year.content : null

        stream.close()

        return {
            singer,
            title,
            album,
            genre,
            year,
            raw : info,
        }
    } catch (err) {
        return null
    }
}
