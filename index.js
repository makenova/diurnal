#!/usr/bin/env node

'use strict'

const diurnal = require('./src/')
const args = require('minimist')(process.argv.slice(2))
const firstArg = process.argv[2]

if (!firstArg || firstArg.includes('-t')) {
  const title = args.t || null
  diurnal.new(title)
} else {
  diurnal(args)
}
