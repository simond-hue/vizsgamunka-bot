const Discord = require("discord.js");
const fs = require('fs');
var index = require("../index.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.voiceChannel){
        return message.channel.send(new Discord.RichEmbed()
            .setColor("#DABC12")
            .setTitle("Voice channelben kell lenned, hogy meg tudj idézni!"));
    }
    else{
        if(message.guild.voiceConnection){
            return message.channel.send(new Discord.RichEmbed()
                .setTitle("Már bent vagyok a voice channelen!")
                .setColor("#DABC12"));
        }
        else{
            voice = message.member.voiceChannel;
            connection = message.guild.voiceConnection;
            await message.member.voiceChannel.join();
            servers = index.servers;
            if(!servers[message.guild.id]){
                servers[message.guild.id] = {
                    queue: [],
                    information: [],
                    requestedBy: [],
                    requestedByProfPic: [],
                    skips: 0,
                    skippedBy: [],
                    summonedChannel: message.member.voiceChannel.id,
                    summonedVoiceConnection: message.guild.voiceConnection,
                    voltLejatszvaZene: false,
                    page: 0,
                    queueCanBeCalled: true,
                    looped: false,
                    shuffled: false,
                    shuffleind: 0,
                    botInterval: null
                };
            }
            this.botok(message,servers);
            setTimeout(() => {
                if(servers[message.guild.id])
                    if(!servers[message.guild.id].voltLejatszvaZene && message.guild.voiceConnection) bot.commands.get("fuckoff").run(bot,message,args);
            }, 300000);
        }
    }
}

function bots(message,servers){
    var botusers = true;
    servers[message.guild.id].summonedVoiceConnection = message.guild.voiceConnection;
    message.guild.channels.forEach(element =>{
        if(element.members)
            element.members.forEach(user =>{
                if(user.id === message.guild.me.id){
                    servers[message.guild.id].summonedChannel = element.id;
                }
            })
    })
    message.guild.channels.get(servers[message.guild.id].summonedChannel).members.forEach(element => {
        if(element.user.bot === false) botusers = false;
    });
    return botusers;
}

module.exports.botok = async(message,servers)=>{
    var botok = false;
    setInterval(async() => {
        if(!servers[message.guild.id]) return;
        if(servers[message.guild.id]){
            botok = bots(message,servers);       
        }
        if(!botok){
            return this.botok(message,servers);
        }
        if(botok){
            if(server.summonedVoiceConnection) {
                server.summonedVoiceConnection.disconnect();
                server.summonedVoiceConnection = null;
            }
            else if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();

            if(servers[message.guild.id]){
                await delete servers[message.guild.id];
                index.servers = servers;
            }
        } 
    }, 600000)
}

module.exports.help = {
    name: "summon",
    type: "music",
    alias: ["connect", "join"]
}

