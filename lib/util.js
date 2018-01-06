'use strict'

const assert = require('assert')
const _ = require('lodash')

/**
 * ID3v2.3 总大小使用 4 byte
 * 每个 byte, 去除最高位, 然后拼在一起, 当做 uint32
 * 脑残设计
 * http://blog.csdn.net/fulinwsuafcie/article/details/8972346
 */

exports.getID3TotalSize = (buf) => {
    assert.equal(buf.length, 4)

    let ret = 0
    for (let i = 0; i < 4; i++) {
        const cur = buf[i]
        ret = (ret << 7) + (cur & 0x7f)
    }
    return ret
}

/**
 * 解出 string
 * http://stackoverflow.com/questions/26575659/id3-frame-header
 */

exports.getTagString = (buf) => {
    let enc
    switch (buf[0]) {
        case 0:
            // start: 00
            // end: 00
            enc = 'binary' // latin1 fail on v4 & v5
            break
        case 1:
        case 2:
            // start: 01
            // end: 00 00
            enc = 'utf16le'
            break
        case 3:
            // start: 03
            // end: 00
            enc = 'utf8'
            break
        default:
            break
    }
    buf = buf.slice(1)

    // strip bom
    const bom1 = Buffer.from([0xff, 0xfe])
    const bom2 = Buffer.from([0xfe, 0xff])
    if (_.startsWith(buf, bom1) || _.startsWith(buf, bom2)) {
        buf = buf.slice(2)
    }

    return buf.toString(enc)
}
