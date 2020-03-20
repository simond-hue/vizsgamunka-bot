const Discord = require("discord.js");
const play = require("./play.js");
const index = require("../index.js");
const summon = require('./summon.js');

async function skip(msg,bt){
    server = index.servers[msg.guild.id];
    server.skip = 0;
    server.skippedBy = [];
    server.looped = false;
    new Promise((resolve,reject)=>{
        resolve(server.dispatcher.end());
    });
}

function countOfNonBots(map){
    var sum = 0;
    map.forEach(element => {
        if(!element.user.bot) sum++;
    });
    return sum;
}

module.exports.run = async (bot, message, args) => {
    try{
        if(!message.guild.voiceConnection) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Nem vagyok voice channelen!"))

        if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Voice channelben kell lenned, hogy tudj számot ugrani!"));
        server = index.servers[message.guild.id];
        if(server.summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('666067588039704599'))
            if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('666067588039704599').voiceChannelID){
                servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;
                servers[message.guild.id].summonedVoiceConnection = message.member.voiceConnection;
            }
        if(server.summonedChannel === message.member.voiceChannel.id){
            if(!server.skippedBy.includes(message.member.id)){
                server.skips++;
                server.skippedBy.push(message.member.id);
            }
            nonBots = countOfNonBots(message.member.voiceChannel.members);
            if(!server.queue[0]){
                return message.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle("Nincs több elem a lejátszási listában!"));
            }
            if((server.skips >= Math.floor(nonBots/2) || message.member.hasPermission('ADMINISTRATOR')) && server.queue[0]){
                message.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle("Ugrás..."));
                skip(message,bot);
            }
            else{
                return message.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle(`Ugrás ${server.skips}\\${Math.floor(nonBots/2)}`));
            }
        }
        else{
            return message.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle("Nem vagyunk ugyanabban a szobában!"));
        }
    }
    catch(e){
        console.log(e)
    }
}

module.exports.help = {
    name: "skip",
    type: "music",
    alias: ["s"]
}