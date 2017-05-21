const fs = require('fs')
const os = require('os')
const path = require('path')

const HOME = os.homedir()
const ENTRIES_DIR = process.env.DIURNAL_DIR || path.resolve(HOME + '/.diurnal')

function handleError (err, message) {
  if (process.env.NODE_ENV === 'makenova_dev') {
    console.log(message || 'some thing bad happend')
    throw err
  } else {
    console.log(message || 'some thing bad happend')
    process.exit(1)
  }
}

function strip (string) {
  return string.raw[0].split('\n').map(line => line.trim()).join('\n')
}

function printHelp () {
  console.log(strip`
    Description
      A simple journaling application

    Usage
      $ diurnal [-hlp]

    Commands
      -h    print this help text
      -l    list journal entries
      -p    purge(delete) a journal entry
      -t    create a new entry with a title or override today's current title

    Examples
      $ diurnal -l
      20170614 - I'm in love
      20170615 - They hate me
      20170616 - Forever alone

      $ diurnal -p 20170614
      one journal entry purged
  `)
}

function createDirIfNecessary (filepath, callback) {
  fs.readdir(ENTRIES_DIR, function (err, files) {
    if (err && err.message.indexOf('ENOENT') >= 0) {
      fs.mkdir(ENTRIES_DIR, function (err) {
        return callback(err, [])
      })
    } else if (err) {
      return callback(err)
    } else {
      return callback(null, files)
    }
  })
}

function newEntry (title) {
  const NL = os.EOL
  const today = new Date()
  const dayString = today.getDate().toString()
  const monthString = (today.getMonth() + 1).toString()
  const yearString = today.getFullYear().toString()

  const diurnalFileName = `${yearString}${monthString}${dayString}`

  let fileData = `# ${monthString}-${dayString}-${yearString}${NL}`
  if (title) {
    fileData += `${NL}## ${title}${NL}${NL}`
  }

  var filePath = path.resolve(ENTRIES_DIR, `${diurnalFileName}.md`)

  createDirIfNecessary(ENTRIES_DIR, function (err) {
    if (err) return handleError(err, 'Failed to create diurnal folder.')

    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err && err.message.indexOf('ENOENT') >= 0) {
        fs.writeFile(filePath, fileData, function (err) {
          if (err) return handleError(err, 'Could not create an entry(2).')

          console.log('new entry created at: ' + filePath)
        })
      } else if (err) {
        handleError(err, 'Could not create an entry(1).')
      } else {
        console.log(data)
      }
    })
  })
}

function listEntries () {
  createDirIfNecessary(ENTRIES_DIR, function (err, files) {
    if (err) return handleError(err, 'Failed to create diurnal folder.')

    if (files.length < 1) {
      console.log('You have no entries, consider writing one.')
      return
    }

    files.forEach(function (file) {
      console.log(file)
    })
  })
}

module.exports = function (args) {
  if (args.h) {
    printHelp()
  } else if (args.l) {
    listEntries(args.l || 10)
  }
}

module.exports.new = newEntry
