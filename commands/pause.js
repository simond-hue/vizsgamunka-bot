const Discord = require("discord.js");
const index = require("../index.js");

async function giveError(message, msg){
    return await message.channel.send(new Discord.RichEmbed().setColor('#DABC12').setTitle(msg));
}

module.exports.run = async (bot, message, args) => {
    try{
        if(!message.guild.voiceConnection) return giveError(message, 'Nem vagyok voice channelen!');
        if(!message.member.voiceChannel) return giveError(message, 'Voice channelben kell lenned, hogy meg tudd állíani a zenelejátszót!');
        let server = index.servers[message.guild.id];
        if(servers[message.guild.id].summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('666067588039704599'))
            if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('666067588039704599').voiceChannelID){
                servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;
                servers[message.guild.id].summonedVoiceConnection = message.member.voiceConnection;
            }
        if(server.summonedChannel !== message.member.voiceChannel.id) return giveError(message, 'Nem vagyunk ugyanabban a szobában!');
        if(!server.dispatcher) return giveError(message, 'Nincs zene a lejátszóban!');
        if(server.dispatcher.paused) return giveError(message, 'A zene korábban már meg lett állítva!');
    
        server.dispatcher.pause();
    
        server.pauseTimeout = setTimeout(() => {
            giveError(message, 'Túl sokáig volt megállítva a zene. Lecsatlakozás...');
            bot.commands.get("fuckoff").run(bot,message,args);
        }, 300000);
    
        return giveError(message, 'A zene meg lett állítva!');
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "pause",
    type: "music",
    alias: ['break', 'b', 'stop']
}