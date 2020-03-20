const Discord = require("discord.js");
const index = require("../index.js");
const summon = require("./summon.js");

module.exports.run = async (bot, message, args) => {
    try{
        server = index.servers[message.guild.id];
        if(server){
            if(server.summonedVoiceConnection || message.guild.voiceConnection){
                if(!message.member.voiceChannel && index.servers[message.guild.id].dispatcher)
                    return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Ne akard már elrontani a többiek jólétét!"));
                if(server.summonedVoiceConnection) {
                    server.summonedVoiceConnection.disconnect();
                    server.summonedVoiceConnection = null;
                }
                else if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        
                servers = index.servers;
                if(servers[message.guild.id]){
                    clearInterval(servers[message.guild.id].botInterval);
                    await delete servers[message.guild.id];
                    index.servers = servers;
                }
            }
            else{
                return message.channel.send(new Discord.RichEmbed()
                    .setTitle("Nem vagyok bent a voice channelben!")
                    .setColor("#DABC12"));
            }
        }
        else{
            return message.channel.send(new Discord.RichEmbed()
                    .setTitle("Nem vagyok bent a voice channelben!")
                    .setColor("#DABC12"));
        }
    }
    catch(e){
        console.log(e)
    }
}
module.exports.help = {
    name: "disconnect",
    type: "music",
    alias: ["dc"]
}