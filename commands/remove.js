const Discord = require("discord.js");
const index = require("../index.js");
const ytdl = require("ytdl-core");

async function giveError(message, msg){
    return message.channel.send(new Discord.RichEmbed().setColor('#DABC12').setTitle(msg));
}

module.exports.run = async (bot, message, args) => {
    if(!message.guild.voiceConnection) return error(message,'Nem vagyok voice channelen!'); // Ha a bot nincs a voice-on
    if(!message.member.voiceChannel) return giveError(message, 'Voice channelben kell lenned, hogy tudj zenét törölni a listáról!');
    server = index.servers[message.guild.id]; // current szerver
    if(servers[message.guild.id].summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('666067588039704599'))
        if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('666067588039704599').voiceChannelID){
            servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;
            servers[message.guild.id].summonedVoiceConnection = message.member.voiceConnection;
        }
    if(server.summonedChannel !== message.member.voiceChannel.id) return giveError(message, 'Nem vagyunk ugyanabban a szobában!');
    if(server.queue.length === 0) return error(message,'Üres a lejátszási lista!') // üres a lejátszási lista
    if(message.content.split(' ').length < 2) return giveError(message, 'Üres argumentum!');
    if(message.content.split(' ').length > 2) return giveError(message, 'Túl sok argumentum!');
    rmIndex = message.content.split(' ')[1];
    if(rmIndex <= 0) return giveError(message, "Hibás argumentum!")
    if(rmIndex === 1) return giveError(message, 'Skip parancsot használd ehelyett!');
    server = index.servers[message.guild.id];
    removedItem = server.information[rmIndex-1].title;
    server.queue.splice(rmIndex-1,1);
    server.information.splice(rmIndex-1,1);
    server.requestedBy.splice(rmIndex-1,1);
    server.requestedByProfPic.splice(rmIndex-1,1);

    return giveError(message, 'Sikeres törlés!')
}
module.exports.help = {
    name: "remove",
    type: "music",
    alias: ["rm", "delete", "del"]
}