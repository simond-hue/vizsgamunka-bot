const Discord = require("discord.js");
const fs = require('fs');
const savedplaylists = require('../playlists.json');

function JSONwritefile(writeableJSON, message){
    writeableJSON = JSON.stringify(writeableJSON, null, 2);
    fs.writeFileSync("playlists.json", writeableJSON, (err)=>{
        if(err) console.log(err);
    })
    message.channel.send(new Discord.RichEmbed()
        .setColor("#DABC12")
        .setTitle(`A lejátszási lista sikeresen törölve!`));
}


module.exports.run = async (bot, message, args) => {
    try{
        guildID = message.guild.id;
        if(!savedplaylists[guildID]) return message.channel.send(new Discord.RichEmbed()
                                            .setColor("#DABC12")
                                            .setTitle("A szerveren nincs elmentve lejátszási lista!"));
        if(message.content.split(' ').length === 1) return message.channel.send(new Discord.RichEmbed()
                                                        .setColor("#DABC12")
                                                        .setTitle("Nem adtad meg a playlist nevét!"));
        var argumentum = message.content.split(' ');
        if(message.content.split(' ').length > 2){
            argumentum.shift();
            argumentum = argumentum.join('_');
        }
        else{
            argumentum = argumentum[1];
        }
        writableJson = savedplaylists;
        if(!writableJson[guildID][argumentum]){
            return message.channel.send(new Discord.RichEmbed()
                                            .setColor("#DABC12")
                                            .setTitle("Nincs ilyen nevű lejátszási lista!"));
        }
        delete writableJson[guildID][argumentum];
        JSONwritefile(writableJson,message);
    }
    catch(e){ 
        console.log(e) 
    }
}

module.exports.help = {
    name: "deleteplaylist",
    type: "music",
    alias: ["dlp", "delp"]
}