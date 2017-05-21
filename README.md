# diurnal

A simple journaling application

## Install

```js
npm i -g diurnal
```

## Use

From the command line, the following command will print the help text,

```sh
$ diurnal -h

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
```

## Bugs

Please report any bugs to: https://github.com/makenova/diurnal/issues

## License

Licensed under the MIT License: https://opensource.org/licenses/MIT
