const Discord = require("discord.js");
const index = require("../index.js");

function giveError (message, msg){
    return message.channel.send(new Discord.RichEmbed().setColor('#DABC12').setTitle(msg));
}

module.exports.run = async (bot,message,args) => {
    try{
        if(!message.guild.voiceConnection) return giveError(message, 'Nem vagyok voice channelen!');
        if(!message.member.voiceChannel) return giveError(message, 'Voice channelben kell lenned, hogy véletlenszerű lejátszást tudj beállítani');
        let server = index.servers[message.guild.id];
        if(servers[message.guild.id].summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('666067588039704599'))
            if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('666067588039704599').voiceChannelID){
                servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;
                servers[message.guild.id].summonedVoiceConnection = message.member.voiceConnection;
            }
        if(server.summonedChannel !== message.member.voiceChannel.id) return giveError(message, 'Nem vagyunk ugyanabban a szobában!');
        if(!server.dispatcher) return giveError(message, 'Nincs zene a lejátszóban!');
        if(!server.shuffled) return giveError(message, 'Nincs bekapcsolva a véletlenszerű lejátszás!');

        server.shuffled = false;
        for(var i = 0; i < server.shuffleind; i++){
            server.queue.shift();
            server.information.shift();
            server.requestedBy.shift();
            server.requestedByProfPic.shift();
        }
        server.shuffleind = 0;
        return giveError(message, 'Véletlenszerű lejátszás kikapcsolva!');
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "unshuffle",
    type: "music",
    alias: ['unshuff', 'urp']
}