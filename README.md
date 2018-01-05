# id3-reader

> mp3 ID3 reader for Node.js

[![Build Status](https://img.shields.io/travis/magicdawn/node-id3-reader.svg?style=flat-square)](https://travis-ci.org/magicdawn/node-id3-reader)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/node-id3-reader.svg?style=flat-square)](https://codecov.io/gh/magicdawn/node-id3-reader)
[![npm version](https://img.shields.io/npm/v/id3-reader.svg?style=flat-square)](https://www.npmjs.com/package/id3-reader)
[![npm downloads](https://img.shields.io/npm/dm/id3-reader.svg?style=flat-square)](https://www.npmjs.com/package/id3-reader)
[![npm license](https://img.shields.io/npm/l/id3-reader.svg?style=flat-square)](http://magicdawn.mit-license.org)

## Install

```sh
$ npm i id3-reader --save
```

## API

```js
const reader = require('id3-reader')

reader(filename | fd).then(info => {
    // blabla
})
```

### resolved info

* `singer`: extracted from `TPE1`
* `title`: extracted from `TIT2`
* `album`: extracted from `TALB`
* `genre` : extracted from `TCON`
* `year` : extracted from `TYER`
* `raw`: the raw ID3 info

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
