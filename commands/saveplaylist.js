const Discord = require("discord.js");
const fs = require('fs');
const index = require('../index.js');
const savedplaylists = require('../playlists.json');

function JSONwritefile(writeableJSON, message){
    writeableJSON = JSON.stringify(writeableJSON, null, 2);
    fs.writeFileSync("playlists.json", writeableJSON, (err)=>{
        if(err) console.log(err);
    })
    message.channel.send(new Discord.RichEmbed()
        .setColor("#DABC12")
        .setTitle(`A lejátszási lista sikeresen el lett mentve!`));
}

module.exports.run = async (bot, message, args) => {
    try{
        if(!message.guild.voiceConnection) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Nem vagyok voice channelen!"));
        if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Voice channelben kell lenned, hogy tudj lejátszási listát menteni!"));
        guildID = message.guild.id;
        server = index.servers[guildID];
        if(!server.queue) return message.channel.send(new Discord.RichEmbed()
                            .setColor("#DABC12")
                            .setTitle("Üres lejátszási listát nem lehet menteni!"));
        if(server.queue.length === 0) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Üres lejátszási listát nem lehet menteni!"));
        if(message.content.split(' ').length === 1) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("Nem adtad meg a playlist nevét!"));
        var argument = message.content.split(' ');
        for(var i = 1; i < argument.length; i++){
            if(argument[i].includes('_')) return message.channel.send(new Discord.RichEmbed()
                                                    .setColor("#DABC12")
                                                    .setTitle("A lejátszási lista neve nem tartalmazhat alulvonást!"));
        }
        var name;
        if(message.content.split(' ').length > 2){
            argument.shift();
            name = argument.join(' ');
            argument = argument.join('_');
        }
        else{
            argument = argument[1];
            name = argument;
        }
        writeableJSON = savedplaylists;
        if(!writeableJSON[guildID]){
            writeableJSON[guildID] = {};
            writeableJSON[guildID][argument] = server.queue;
            writeableJSON[guildID][argument].name = name;
        }
        if(writeableJSON[guildID]){
            writeableJSON[guildID][argument] = server.queue;
            writeableJSON[guildID][argument].name = name;
        }
        JSONwritefile(writeableJSON, message);
        }
    catch(e){
        console.log(e)
    }
}

module.exports.help = {
    name: "saveplaylist",
    type: "music",
    alias: ["svp", "savep"]
}
