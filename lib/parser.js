'use strict'

const Dissolve = require('dissolve')
const $ = require('./util.js')

/**
 * create a parser
 */

exports.create = () =>
    Dissolve()
        .string('header', 3) // ID3
        .tap(function() {
            if (this.vars.header !== 'ID3') {
                return this.interrupt()
            }
        })
        .uint8('ver')
        .uint8('reversion')
        .uint8('flag', 1)
        .buffer('size', 4)
        .tap(function() {
            this.vars.size = $.getID3TotalSize(this.vars.size)
            this.vars.ID3 = []
            this.curSize = 10
        })
        .loop(function(end) {
            if (this.curSize >= this.vars.size) {
                return end()
            }

            this.string('cur_id', 4)
                .uint32be('cur_size')
                .uint16be('cur_flag')
                .tap(function() {
                    this.buffer('cur_content', this.vars.cur_size).tap(function() {
                        this.vars.ID3.push({
                            id : this.vars.cur_id,
                            content : $.getTagString(this.vars.cur_content),
                        })

                        this.curSize += 10 + this.vars.cur_size
                    })
                })
        })
        .tap(function() {
            // clean
            delete this.vars.cur_id
            delete this.vars.cur_size
            delete this.vars.cur_flag
            delete this.vars.cur_content

            // bump
            this.push(this.vars)
            this.push(null)
        })
