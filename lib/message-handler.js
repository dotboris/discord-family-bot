const debug = require('debug')('message-hanlder')
const botParse = require('./bot-parse')
const CommandSpec = require('./command-spec')
const botCommands = require('./bot-commands')

const COMMANDS = {
  help: {
    aliases: ['h'],
    args: [],
    description: 'Print this help message',
    handler: handleHelp
  },
  list: {
    aliases: ['ls'],
    args: [],
    description: 'Show your relationships',
    handler: botCommands.listRelationships
  },
  marry: {
    aliases: [],
    args: [{name: '@someone', type: 'user'}],
    description: 'Ask @someone to marry you',
    handler: botCommands.marry
  },
  date: {
    aliases: [],
    args: [{name: '@someone', type: 'user'}],
    description: 'Ask @someone to date you',
    handler: botCommands.date
  },
  adopt: {
    aliases: [],
    args: [{name: '@someone', type: 'user'}],
    description: 'Ask @someone to become your child',
    handler: botCommands.adopt
  },
  adoptme: {
    aliases: [],
    args: [{name: '@someone', type: 'user'}],
    description: 'Ask @someone to become your parent',
    handler: botCommands.adoptMe
  },
  leave: {
    aliases: [],
    args: [{name: '@someone', type: 'user'}],
    description: 'Leave your current relationship with @someone',
    handler: botCommands.leave
  }
}
const COMMANDS_INDEX = CommandSpec.makeIndex(COMMANDS)
const COMMANDS_HELP = CommandSpec.generateHelp(COMMANDS)

async function handleMessage (state, message) {
  debug(`${message.author.username}> ${message.toString()}`)

  const { config } = state
  if (botParse.isCommand(config.commandChar, message)) {
    const command = botParse.parseCommand(message)
    debug(command)

    const commandSpec = CommandSpec.findCommand(COMMANDS_INDEX, command.name)
    if (commandSpec) {
      const specArgTypes = commandSpec.args.map(a => a.type)
      if (botParse.argsMatch(command.args, specArgTypes)) {
        await commandSpec.handler(state, message, ...command.args)
      } else {
        message.channel.send('TODO: bad args reply')
      }
    }
  }
}

module.exports = function (state) {
  return function (message) {
    return handleMessage(state, message)
      .catch(err => debug(err))
  }
}

async function handleHelp (_state, message) {
  await message.channel.send(
    [
      '```',
      COMMANDS_HELP,
      '```'
    ].join('\n')
  )
}
