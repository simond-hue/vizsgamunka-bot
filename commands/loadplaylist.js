const Discord = require("discord.js");
const index = require('../index.js');
const savedplaylists = require('../playlists.json');
const play = require('./play.js');

module.exports.run = async (bot, message, args) => {
    if(!message.guild.voiceConnection) await bot.commands.get('summon').run(bot,message,args);
    if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Voice channelben kell lenned, hogy tudj lejátszási listát betölteni!"));
    guildID = message.guild.id;
    server = index.servers[guildID];
    var initialServerQueueLength;
    if(server.queue) initialServerQueueLength = server.queue.length;
    else initialServerQueueLength = 0;
    if(message.content.split(' ').length === 1) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Nem adtad meg a playlist nevét!"));
    argument = message.content.split(' ');
    if(argument.length > 2){
        argument.shift();
        argument = argument.join('_');
    }
    else argument = argument[1];
    if(!savedplaylists[guildID]) return message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle("A szerveren nincs elmentve lejátszási lista!"));
    if(savedplaylists[guildID]){
        if(!savedplaylists[guildID][argument]){
            return message.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle("Nincs ilyen nevű lejátszási lista!"));
        }
    }

    savedplaylists[guildID][argument].forEach(element => {
        server.queue.push(element);
        server.information.push(null);
        servers[message.guild.id].requestedBy.push(message.member.user.username);
        servers[message.guild.id].requestedByProfPic.push(`https://cdn.discordapp.com/avatars/${message.member.user.id}/${message.member.user.avatar}.png`);
    });

    if(initialServerQueueLength === 0){
        play.exportedPlay(message,bot,args);
    }
    message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle(`A(z) ${argument.split('_').join(' ')} lejátszási lista sikeresen betöltve!`));
}

module.exports.help = {
    name: "loadplaylist",
    type: "music",
    alias: ["ldp", "loadp"]
}