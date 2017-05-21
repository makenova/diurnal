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
      $ diurnal [-hlpt]

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
      One journal entry, 20170614 purged.
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

function leftpad (string, pad, stringlength) {
  while (string.length < stringlength) {
    string = `${pad}${string}`
  }

  return string
}

function newEntry (title) {
  const NL = os.EOL
  const today = new Date()
  const dayString = leftpad(today.getDate().toString(), '0', 2)
  const monthString = leftpad((today.getMonth() + 1).toString(), '0', 2)
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
        process.exit(0)
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

    files.forEach((file) => {
      const filename = file.slice(0, file.indexOf('.md'))
      const filePath = path.resolve(ENTRIES_DIR, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      let titleIndex = fileContent.indexOf('##')
      let fileTitle = 'No title'

      if (titleIndex >= 0) {
        fileTitle = fileContent.slice(titleIndex + 2, fileContent.indexOf(os.EOL, titleIndex)).trim()
      }

      console.log(`${filename} - ${fileTitle}`)
    })
  })
}

function purgeEntry (filename) {
  if (typeof filename === 'boolean') {
    return handleError(new Error('No file to purge'), 'Provide a file name to purge.')
  }

  fs.readdir(ENTRIES_DIR, (err, files) => {
    if (err) handleError(err, 'Cannot read diurnal folder.')
    if (files < 1) {
      handleError(new Error('No entries to purge'), 'You have no entries to purge.')
    }

    if (files.includes(filename + '.md')) {
      // TODO: use trash instead and accept a -f option to skip the trash.
      fs.unlink(path.resolve(ENTRIES_DIR, filename + '.md'), (err) => {
        if (err) return handleError(err, 'Could not delete your entry.')

        console.log(`${filename} deleted!`)
        console.log(`One journal entry, ${filename} purged.`)
      })
    } else {
      let message = 'Cannot purge, file not found'
      handleError(new Error(message), message)
    }
  })
}

module.exports = function (args) {
  if (args.h) {
    printHelp()
  } else if (args.l) {
    listEntries(args.l || 10)
  } else if (args.p) {
    purgeEntry(args.p)
  }
}

module.exports.new = newEntry
