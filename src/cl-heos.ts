import zclopts from '@sovpro/zclopts'
import promiseConnect from '@sovpro/promise-connect'
import { HeosLib } from '@sovpro/heos-lib'
import { declarations } from '@sovpro/heos-lib/lib/declarations'
import { format } from 'util'

// Configs for displayItem internal constants
const ITEM_SEP_PAT         = ' -'
const ITEM_SEP_PAT_REPEAT  = 36 

// getFuncArgs insternal constants
getFuncArgs.FN_ARG_REGEX         = /(?:(?:async *)?(?:function *)?[^\(]*\()?(.*[\=\{])/
getFuncArgs.FN_REPL_REGEX        = /[\(\)\=\>\{]/g

// displayItem internal constant
displayItem.ITEM_SEP             = ITEM_SEP_PAT.repeat (ITEM_SEP_PAT_REPEAT)

// displayProp internal constant
displayProp.PROP_INDENT          = '    '

// shouldShowHelp internal constant
shouldShowHelp.HELP_REGEX  = /^\-(?:h(?:elp)?|\-help)$/

// Mapping utilities
const trimStr   = str => str.trim ()
const nonEmpty  = str => str.length

const DEFAULT_PREFIX       = 'CL_HEOS_'
const DEFAULT_PREFIX_LEN   = DEFAULT_PREFIX.length
const DEFAULTS             = ((env, prefix, prefix_len) => {
  return Object.keys (env).
    filter (env_key => env_key.indexOf (prefix) === 0).
    reduce ((defaults, env_key) => ({
      ...defaults,
      [env_key.toLowerCase ().substr (prefix_len)]: env[env_key]
    }), {})
}) (process.env, DEFAULT_PREFIX, DEFAULT_PREFIX_LEN)
const HAS_DEFAULTS         = !!Object.keys (DEFAULTS).length

const EXCLUDE_COMMANDS     = new Set (['registerForChangeEvents', 'checkAccount', 'signIn', 'signOut', 'heartBeat'])
const COMMANDS             = declarations.filter (decl => !EXCLUDE_COMMANDS.has (decl.name)).reduce (buildCommands, {})
const COMMAND              = process.argv[2]
const PARAMS               = zclopts (process.argv.slice (3))
const HEOS_PORT            = +(PARAMS.get ('port')) || +(process.env.HEOS_PORT) || 1255
const HEOS_HOST            = PARAMS.get ('host') || process.env.HEOS_HOST
const LIMIT_PROPS           = ((props) => new Set (
                               Array.isArray (props)
                               ? props : typeof props === 'string'
                               ? props.trim ().split (/\s+/) : null
                             )) (PARAMS.get ('limit-props'))

export async function main () {
  const command  = COMMANDS[COMMAND]
  if (shouldShowHelp (command, PARAMS)) {
    console.log ('Usage: cl-heos <command> <params...>')
    const command_alt = process.argv[3]
    if (command ||COMMANDS[command_alt]) {
      console.log ('')
      showDefaults ()
      showCommand (command ? COMMAND : command_alt)
    }
    else {
      console.log ('       cl-heos --help [<command>] | <command> --help')
      console.log ('')
      console.log ('       required: --host or set HEOS_HOST in environment')
      console.log ('       optional: --port or set HEOS_PORT in environment')
      console.log ('                 --limit-props prop [...prop]')
      console.log ('')
      console.log ('       Tip: Set CL_HEOS_<parameter name> in environment to set a default')
      console.log ('            example: export CL_HEOS_RANGE=0,4 # sets default for: --range')
      console.log ('                     export CL_HEOS_PID=123456789 # sets default for: --pid')
      console.log ('')
      showDefaults ()
      Object.keys (COMMANDS).forEach (showCommand)
    }
  }
  else {
    try {
      const socket   = await promiseConnect (HEOS_PORT, HEOS_HOST)
      const heoslib  = new HeosLib (socket)
      displayResult (await heoslib[command.name] ({
        ...command.defaults,
        ...mapToObj (PARAMS)
      }))
      socket.end ()
    }
    catch (err) {
      console.error ('Error: ' + err.message)
    }
  }
}

function showDefaults () {
  if (HAS_DEFAULTS) {
    console.log ('       Default parameter settings:')
    console.log ('')
    Object.keys (DEFAULTS).forEach (key => {
      console.log (`           ${key} = ${DEFAULTS[key]}`)
    })
    console.log ('')
    console.log ('       ** on an argument indicates a default parameter is set')
    console.log ('')
  }
}

function mapToObj (map) {
  const iter = map.entries ()
  let obj = {}
  let entry = null
  while (true) {
    entry = iter.next ()
    if (entry.done) break
    obj[entry.value[0]] = entry.value[1]
  }
  return obj
}

function displayResult (result) {
  if (Array.isArray (result)) return displayItems (result)
  if (result.items) return displayItems (result.items)
  if (Array.isArray (result.payload)) return displayItems (result.payload)
  if (result.payload) return displayItem (result.payload)
  displayItem (result)
}

function displayItems (items) {
  items.forEach (displayItem)
}

function displayItem (item, i = 0) {
  console.log ((i + 1) + displayItem.ITEM_SEP)
  const props = Object.getOwnPropertyNames (item)  
  ; ( LIMIT_PROPS.size
    ? props.filter (prop => LIMIT_PROPS.has (prop))
    : props.filter (prop => item[prop] !== undefined)
  ).forEach (displayProp.bind (null, item))
}

function displayProp (item, prop) {
  if (item[prop]) {
    console.log (displayProp.PROP_INDENT + prop + ' = ' + item[prop])
  }
}

function showCommand (command) {
  const { args, defaults } = COMMANDS[command]
  const args_str = args.map ((HAS_DEFAULTS ?
    s => `--${s} ${defaults[s] ? '**' : '..'}` :
    s => `--${s} ..`
  )).join (' ')
  console.log (`       cl-heos ${command} ${args_str}`)
  console.log ('')
}

function getFuncArgs (func) {
  const arg_str = getFuncArgs.FN_ARG_REGEX.exec (func.toString ())[1]
    .replace (getFuncArgs.FN_REPL_REGEX, '')
  return arg_str.trim ().split (',')
    .filter (nonEmpty).map (trimStr)
}
  
function buildCommands (commands, declaration) {
  const command = getCommand (declaration)
  const args = getArgs (declaration)
  const defaults = getDefaults (args)
  const name = declaration.name
  commands[command] = { name, args, defaults }
  return commands
}

function getDefaults (args) {
  return args
    .filter (arg => DEFAULTS.hasOwnProperty (arg))
    .reduce ((defaults, arg) => ({
      ...defaults, [arg]: DEFAULTS[arg]
    }), {})
}

function getArgs (declaration) {
  if (declaration['args'])
    return declaration.args
  else if (declaration.func)
    return getFuncArgs (declaration.func)
  else
    return []
}

function getCommand (declaration) {
  return declaration.name
  // Prepend all capital letters with
  // a dash then covert to lower case
    .replace (/([A-Z])/g, '-$1')
    .toLowerCase ()
}

function shouldShowHelp (command, params) {
  return ! command ||
         shouldShowHelp.HELP_REGEX.test (command) ||
         params.get ('h') ||
         params.has ('help')
}
