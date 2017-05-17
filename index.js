#!/usr/bin/env node

'use strict'

const diurnal = require('./src/')
const argv = require('minimist')(process.argv.slice(2))
const firstArg = process.argv[2]

if (!firstArg) {
  diurnal.new()
} else {
  diurnal(argv)
}
