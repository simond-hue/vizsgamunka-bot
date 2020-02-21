const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const index = require("../index.js");
const play = require("./play.js");
const request = require('request');
const ytdl = require("ytdl-core");

async function Embed(message,string){
    return await this.message.channel.send(new Discord.RichEmbed().setColor("#DABC12").setTitle(string));
}

async function EventHandler(msg){
    if(msg.content >= 1 && msg.content <= global.data.items.length && msg.author.id == global.userid && msg.channel.id == global.message.channel.id){
        global.bot.removeListener("message",EventHandler);
        global.server.queue.push(`https://www.youtube.com/watch?v=${global.data.items[msg.content-1].id.videoId}`);
        global.server.information.push(null);
        global.server.requestedBy.push(global.message.member.user.username);
        global.server.requestedByProfPic.push(`https://cdn.discordapp.com/avatars/${global.message.member.user.id}/${global.message.member.user.avatar}.png`);
        global.chosenElement = global.data.items[msg.content-1].videoId;
        await msg.channel.send(new Discord.RichEmbed()
            .setTitle("Kért zeneszám")
            .setDescription(`${global.data.items[msg.content-1].snippet.title}\n\nJelenlegi pozíciója a lejátszási listában: ${index.servers[msg.guild.id].queue.length}`)
            .setURL(`https://www.youtube.com/watch?${global.data.items[msg.content-1].videoId}`)
            .setColor("#DABC12")
            .setFooter(
                `Kérte: ${global.server.requestedBy[global.server.requestedBy.length-1]}`,
                global.server.requestedByProfPic[global.server.requestedByProfPic.length-1]
            )
            .setThumbnail(global.data.items[msg.content-1].snippet.thumbnails.default.url)
            .setAuthor(
                "Vizsgamunka Bot",
                "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
            ));
        index.servers[msg.guild.id] = global.server;
        if(global.server.queue.length === 1){
            play.exportedPlay(global.message,global.bot,global.args);
        }
    }
}

async function userselect(){
    global.chosenElement = null;
    global.bot.on("message", EventHandler);
    setTimeout(async() => {
        if(global.chosenElement === null){
            Embed(global.message,"Időtúllépés...");
            global.bot.removeListener("message",EventHandler);
        }
    }, 30000);
}

async function search(keyword){
    await new Promise((resolve,reject)=>{
        request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${keyword}&type=video&key=${botconfig.ytAPIKEY}&maxResults=10`,
        async(error, response, body) =>{
            if(!response) return Embed(message,"Váratlan hiba történt!");
            if(response.statusCode !== 200) return Embed(message,"Hiba történt a szerverrel való kommunikációval!");
            if(response.statusCode === 200){
                global.data = JSON.parse(response.body);
                if(Object.keys(global.data.items).length === 0) return Embed(message, "Nem volt találat!");
                searchembed = new Discord.RichEmbed().setColor("#DABC12").setTitle("Keresési eredmények");
                for(var i = 0; i < global.data.items.length; i++){
                    searchembed.addField(`${i+1}.`, global.data.items[i].snippet.title);
                }
                resolve(global.message.channel.send(searchembed));
            }
        })
    }).then(async()=>{
        userselect();
    })
}

module.exports.run = async(bot, message, args)=>{
    // kivételek
    if(!message.member.voiceChannel) return Embed(message, "Voice channelben kell lenned, hogy tudj zenére keresni!"); // user voice connection check
    if(!message.guild.me.hasPermission("CONNECT")) return Embed(message, "Nincs jogom csatlakozni a voice-hoz!"); // permission check
    // ha a bot nincs fent
    if(!message.guild.voiceConnection) await bot.commands.get("summon").run(bot,message,args);
    server = index.servers[message.guild.id];
    global.server = server;
    global.message = message;
    global.bot = bot;
    global.args = args;
    global.userid = global.message.author.id;
    if(server.summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('626527448858886184'))
        if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('626527448858886184').voiceChannelID)
            server.summonedChannel = message.member.voiceChannel.id; 
    if(server.summonedChannel !== message.member.voiceChannel.id) return Embed(message, "Nem vagyunk ugyanabban a szobában!"); // room check
    if(message.content.split(" ").length === 1) return Embed(message, "Üres argumentum!"); // üres string-et adott-e meg a user

    // keyword meghatározása
    argument = [];
    for(var i = 1; i < message.content.split(" ").length; i++){
        argument.push(message.content.split(" ")[i]);
    }
    await search(encodeURIComponent(argument.join("+")), message, bot, args, server);
}

module.exports.help = {
    name: "search",
    type: "music",
    alias: ["find"]
}
