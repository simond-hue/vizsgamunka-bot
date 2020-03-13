const Discord = require("discord.js");
const index = require("../index.js");
const summon = require('./summon.js');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

module.exports.run = async (bot, message, args) => {
    server = index.servers[message.guild.id];
    if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                            .setColor("#DABC12")
                                            .setTitle("Voice channelben kell lenned, hogy véletlenszerű lejátszást alkalmazd!"));
    if(!message.guild.voiceConnection) return message.channel.send(new Discord.RichEmbed()
                                            .setColor("#DABC12")
                                            .setTitle("Nem vagyok voice-on!"));
    if(server.length === 1) return message.channel.send(new Discord.RichEmbed()
                                                                .setColor("#DABC12")
                                                                .setTitle("Csak egy zene van a lejátszási listában!"));
    if(!server.queue[0]) return message.channel.send(new Discord.RichEmbed()
                                                        .setColor("#DABC12")
                                                        .setTitle("Üres a lejátszási lista!"));
    if(server.summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('626527448858886184'))
        if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('626527448858886184').voiceChannelID)
            server.summonedChannel = message.member.voiceChannel.id;
    if(server.summonedChannel === message.member.voiceChannel.id){
        if(server.queue[0]){
            for(var i = 1; i < server.queue.length; i++){
                csereltElem = getRandomInt(i,server.queue.length-1);

                tempQueue = server.queue[i];
                server.queue[i] = server.queue[csereltElem];
                server.queue[csereltElem] = tempQueue;

                tempInfo = server.information[i];
                server.information[i] = server.information[csereltElem];
                server.information[csereltElem] = tempInfo;

                tempProfPic = server.requestedByProfPic[i];
                server.requestedByProfPic[i] = server.requestedByProfPic[csereltElem];
                server.requestedByProfPic[csereltElem] = tempProfPic;

                tempReqBy = server.requestedBy[i];
                server.requestedBy[i] = server.requestedBy[csereltElem];
                server.requestedBy[csereltElem] = tempReqBy;
            }
        }
    }
    else{
        return message.channel.send(new Discord.RichEmbed()
                .setColor("#DABC12")
                .setTitle("Nem vagyunk ugyanabban a szobában!"));
    }
    return message.channel.send(new Discord.RichEmbed()
                .setColor("#DABC12")
                .setTitle("A lejátszási lista össze lett keverve!")); 
}
module.exports.help = {
    name: "randomize",
    type: "music",
    alias: ["rnd"]
}