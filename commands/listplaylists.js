const Discord = require("discord.js");
const fs = require('fs');
const savedplaylists = require('../playlists.json');

module.exports.run = async (bot, message, args) => {
    guildID = message.guild.id;
    if(!savedplaylists[guildID]) return message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle("A szerveren nincs elmentve lejátszási lista!"));
    listingEmbed = new Discord.RichEmbed()
                        .setColor('#DABC12')
                        .setTitle('Lejátszási listák');
    names = Object.keys(savedplaylists[guildID]);
    var count = 0;
    names.forEach(name => {
        count++;
        var spacedname = "";
        if(name.includes('_')){
            spacedname = name.split('_').join(' ');
        }
        else{
            spacedname = name;
        }
        listingEmbed.addField(`Név: ${spacedname}`,`Elemszám: ${savedplaylists[guildID][name].length}`, true);
    });
    if(count === 0){
        return message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle("A szerveren nincs elmentve lejátszási lista!"));
    }
    return message.channel.send(listingEmbed);
}

module.exports.help = {
    name: "listplaylist",
    type: "music",
    alias: ["lsp", "listp"]
}