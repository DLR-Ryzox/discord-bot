const Discord = require('discord.js'),
    client = new Discord.Client({
        fetchAllMembers: true
    }),
    config = require('./config.json'),
    fs = require('fs')
 
client.login(process.env.TOKEN)
client.commands = new Discord.Collection()
client.db = require('./db.json')
 
fs.readdir('./commands', (err, files) => {
    if (err) throw err
    files.forEach(file => {
        if (!file.endsWith('.js')) return
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })
})
 
client.on('message', message => {
    if (message.type !== 'DEFAULT' || message.author.bot) return
 
    const args = message.content.trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    if (!commandName.startsWith(config.prefix)) return
    const command = client.commands.get(commandName.slice(config.prefix.length))
    if (!command) return
    command.run(message, args, client)
})
 
client.on('guildMemberAdd', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(new Discord.MessageEmbed()
        .setDescription(`${member} a rejoint le serveur. Nous sommes désormais ${member.guild.memberCount} ! 💜`)
        .setColor('#700496'))
    member.roles.add(config.greeting.role)
})
 
client.on('guildMemberRemove', member => {
    member.guild.channels.cache.get(config.greeting.channel).send(new Discord.MessageEmbed()
        .setDescription(`${member.user.tag} a quitté le serveur... 😢. Nous ne sommes plus que ${member.guild.memberCount}`)
        .setColor('#700496'))
})

client.on('channelCreate', channel => {
    if (!channel.guild) return
    const muteRole = channel.guild.roles.cache.find(role => role.name === 'Muted')
    if (!muteRole) return
    channel.createOverwrite(muteRole, {
        SEND_MESSAGES: false,
        CONNECT: false,
        ADD_REACTIONS: false
    })
})

client.on('ready', () => {
    client.user.setActivity('Alménia RP', {type: 'PLAYING'})
})