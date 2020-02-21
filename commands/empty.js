var index = require("../index.js");
const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.guild.voiceConnection) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Nem vagyok voice channelen!"));
    if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Voice channelben kell lenned, hogy a lejátszási listát tudd üríteni!"));
    server = index.servers[message.guild.id];
    if(server.queue.length === 0) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("A lejátszási lista már üres!"));
    if(server.queue.length === 1) return message.channel.send(new Discord.RichEmbed()
                                            .setColor("#DABC12")
                                            .setTitle("Inkább használd a skip parancsot!"));
    currentElement = server.queue[0];
    currentInfo = server.information[0];
    currentRequestedBy = server.requestedBy[0];
    currentProfPic = server.requestedByProfPic[0];

    server.queue = [];
    server.information = [];
    server.requestedBy = [];
    server.requestedByProfPic = [];

    server.queue.push(currentElement);
    server.information.push(currentInfo);
    server.requestedBy.push(currentRequestedBy);
    server.requestedByProfPic.push(currentProfPic);
    
    return message.channel.send(new Discord.RichEmbed()
                                    .setColor('#DABC12')
                                    .setTitle('A lejátszási lista sikeresen ürítve!'));
}

module.exports.help = {
    name: "empty",
    type: "music",
    alias: ["e", "c", "clr"]
}