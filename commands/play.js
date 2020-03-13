const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const request = require('request');
var index = require("../index.js");
const botconfig = require("../botconfig.json");
/*
const Agent = require('https-proxy-agent');
const host = '109.251.197.33';
const port = '49046';
const proxy = 'http://' + host + ':' +  port;
const agent = new Agent(proxy);
*/

// TypeError: Cannot read property 'information' of undefined
// amikor túl gyorsan disconnecteled a botot

module.exports.exportedPlay = async(message,bot,args)=>{
    play(message,bot,args);
}

var functionInPlay = async function (msg,bt,ar){
    server = index.servers[msg.guild.id];
    if(!server) return;
    if(!msg.guild.voiceConnection) return;
    if(!server.information[server.shuffleind]){
        if(server && msg.guild.voiceConnection){
            msg.channel.send(new Discord.RichEmbed()
                    .setColor('#DABC12')
                    .setTitle("A videó nem elérhető!"));
            server.skips = 0;
            server.skippedBy = [];
            server.queue.shift();
            server.information.shift();
            server.requestedBy.shift();
            server.requestedByProfPic.shift();
            if(server.queue[server.shuffleind]){
                return play(msg, bt);
            }
            else{
                msg.channel.send(new Discord.RichEmbed()
                    .setColor("#DABC12")
                    .setTitle('Üres a lejátszási lista!'));
                server.dispatcher = null;
                if(msg.guild.voiceConnection){
                    server.playTimeout = setTimeout(()=>{
                        if(msg.guild.voiceConnection && !server.queue[server.shuffleind]) return bt.commands.get("fuckoff").run(bt,msg,ar);
                    },300000);
                }
            }
        }
    }
    else{
        var stream;
        if(server.information[server.shuffleind] === null){
            await msg.channel.send(new Discord.RichEmbed().setColor("#DABC12").setTitle("A videó nem elérhető!"));
            server.dispatcher.end();
        }
        if(server.information[server.shuffleind].player_response.videoDetails.isLiveContent && server.information[server.shuffleind].player_response.videoDetails.isLive){
            await new Promise((resolve, reject)=>{
                const format = ytdl.chooseFormat(server.information[server.shuffleind].formats, { quality: [128,127,120,93] , highWaterMark: 1<<25});
                stream = ytdl.downloadFromInfo(server.information[server.shuffleind], format);
                resolve(stream);
            }).then(async()=>{
                if(msg.guild.voiceConnection){
                    server.dispatcher = await msg.guild.voiceConnection.playStream(stream);
                    if(!server.looped)
                        msg.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle("Jelenlegi zeneszám")
                        .setURL(server.queue[server.shuffleind])
                        .setDescription(servers[msg.guild.id].information[server.shuffleind].title)
                        .setFooter(
                            `Kérte: ${server.requestedBy[server.shuffleind]}`,
                            server.requestedByProfPic[server.shuffleind]
                        )
                        .setThumbnail(server.information[server.shuffleind].player_response.videoDetails.thumbnail.thumbnails[0].url)
                        .setAuthor(
                            "Vizsgamunka Bot",
                            "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
                        ));
                }
            });
            server.looped = true;
        }
        else{
            await new Promise((resolve, reject)=>{
                stream = ytdl.downloadFromInfo(server.information[server.shuffleind], {filter: 'audioonly', quality: 'highestaudio', highWaterMark:1<<25});
                resolve(stream);
            }).then(async()=>{
                if(msg.guild.voiceConnection){
                    server.dispatcher = await msg.guild.voiceConnection.playStream(stream);
                    if(!server.looped)
                        msg.channel.send(new Discord.RichEmbed()
                            .setColor("#DABC12")
                            .setTitle("Jelenlegi zeneszám")
                            .setURL(server.queue[server.shuffleind])
                            .setDescription(servers[msg.guild.id].information[server.shuffleind].title)
                            .setFooter(
                                `Kérte: ${server.requestedBy[server.shuffleind]}`,
                                server.requestedByProfPic[server.shuffleind]
                            )
                            .setThumbnail(server.information[server.shuffleind].player_response.videoDetails.thumbnail.thumbnails[0].url)
                            .setAuthor(
                                "Vizsgamunka Bot",
                                "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
                            ));
                }
            });
        }
        server.dispatcher.on('start', ()=> {
            msg.guild.voiceConnection.player.streamingData.pausedTime = 0;
            clearTimeout(server.playTimeout);
        });
        server.dispatcher.on("end", ()=>{
            server.dispatcher.end();
            setTimeout(() => {
            if(msg.guild.voiceConnection && server){
                server.skips = 0;
                server.skippedBy = [];
                
                if(!server.looped && !server.shuffled){
                    server.queue.shift();
                    server.information.shift();
                    server.requestedBy.shift();
                    server.requestedByProfPic.shift();
                }
                if(server.shuffled) server.shuffleind = Math.floor(Math.random() * (server.queue.length));
                if(server.lastMessage) server.lastMessage.clearReactions();
                if(server.reactionCollectorOnLastMessage) server.reactionCollectorOnLastMessage.stop();
                if(server.queue[server.shuffleind]){
                    return play(msg, bt);
                }
                else{
                    msg.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle('Üres a lejátszási lista!'));
                    server.dispatcher = null;
                    if(msg.guild.voiceConnection){
                        server.playTimeout = setTimeout(()=>{
                            if(msg.guild.voiceConnection && !server.queue[server.shuffleind]) return bt.commands.get("fuckoff").run(bt,msg,ar);
                        },300000);
                    }
                }
            }
            }, 1000);
        });
    }
    
}

var play = async function (msg, bt, ar){
    server = index.servers[msg.guild.id];
    if(!server.voltLejatszvaZene) server.voltLejatszvaZene = true;
    if(server.information[server.shuffleind] === null && server.queue[server.shuffleind] && msg.guild.voiceConnection){
        await new Promise((resolve, reject)=>{
            ytdl.getInfo(server.queue[server.shuffleind], async(err,info)=>{
                resolve(info);
                server.information[server.shuffleind] = info;
            });
        }).then(async()=>{
            functionInPlay(msg,bt,ar);
        });
    }
    else if(server.information[server.shuffleind] && server.queue[server.shuffleind] && msg.guild.voiceConnection){
        functionInPlay(msg,bt,ar);
    }
}

var playlistRequest = async function (url, page, msg, bt, ar){
    request(url, async(error, response, body)=>{
        if(!response) message.channel.send(new Discord.RichEmbed()
                                            .setColor('#DABC12')
                                            .setTitle('Váratlan hiba történt!'));
        if(response.statusCode === 200){
            newUrl = url.replace(('&pageToken='+page),'');
            if(!msg.guild.voiceConnection) await bt.commands.get("summon").run(bt,msg,ar);
            server = index.servers[msg.guild.id];
            server.queueCanBeCalled = false;
            data = JSON.parse(response.body);
            if(!data.prevPageToken) msg.channel.send(new Discord.RichEmbed()
                                                    .setColor('#DABC12')
                                                    .setTitle(`${data.pageInfo.totalResults} szám lett hozzáadva a lejátszási listához!`));
            data.items.forEach(element => { 
                server.queue.push('https://www.youtube.com/watch?v=' + element.snippet.resourceId.videoId);
                server.information.push(null);
                server.requestedBy.push(msg.member.user.username);
                server.requestedByProfPic.push(`https://cdn.discordapp.com/avatars/${msg.member.user.id}/${msg.member.user.avatar}.png`);
            });
            if(!url.includes('&pageToken='+page) && !server.dispatcher) play(msg,bt,ar);
            if(data.nextPageToken){
                playlistRequest(newUrl+"&pageToken="+data.nextPageToken,data.nextPageToken,msg,bt,ar);
            }
            else{
                server.queueCanBeCalled = true;
            }
        }
        else if(response.statusCode === 404){
            return msg.channel.send(new Discord.RichEmbed()
                .setColor('#DABC12')
                .setTitle("Nem volt találat!"));
        }
        else{
            return msg.channel.send(new Discord.RichEmbed()
                .setColor('#DABC12')
                .setTitle("Nem volt találat!"));
        }
    })
}

async function afterPromise(msg,bt,ar,lnk){
    servers = index.servers;
    var info = servers[msg.guild.id].information[servers[msg.guild.id].information.length-1];
    var thumbnail = info.player_response.videoDetails.thumbnail.thumbnails;
    await msg.channel.send(new Discord.RichEmbed()
            .setTitle("Kért zeneszám")
            .setDescription(`${info.title}\n\nJelenlegi pozíciója a lejátszási listában: ${index.servers[msg.guild.id].queue.length}`)
            .setURL(lnk)
            .setColor("#DABC12")
            .setFooter(
                `Kérte: ${servers[msg.guild.id].requestedBy[servers[msg.guild.id].requestedBy.length-1]}`,
                servers[msg.guild.id].requestedByProfPic[servers[msg.guild.id].requestedByProfPic.length-1]
            )
            .setThumbnail(thumbnail[0].url)
            .setAuthor(
                "Vizsgamunka Bot",
                "https://cdn.discordapp.com/avatars/666067588039704599/8487d8b9ed665f8398151fe3c187f976.png"
            ));
    if(!servers[msg.guild.id].dispatcher){
        play(msg, bt, ar);
        if(!servers[msg.guild.id].summonedVoiceConnection) servers[msg.guild.id].summonedVoiceConnection = msg.guild.voiceConnection;
        voice = msg.member.voiceChannel;
        connection = msg.guild.voiceConnection;
    }
}

module.exports.run = async (bot, message, args) => {
    if(!message.guild.me.hasPermission('CONNECT')) return message.channel.send(new Discord.RichEmbed()
                                                            .setColor("#DABC12")
                                                            .setTitle("Nincs jogom csatlakozni a voice-hoz!"));
    if(message.content.split(' ').length==1){
        return message.channel.send(new Discord.RichEmbed()
            .setColor("#DABC12")
            .setTitle("Üres argumentum!"))
    }
    else{
        var servers = index.servers;
        if(!message.member.voiceChannel) return message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle("Voice channelben kell lenned, hogy tudj zenét lejátszani!"));
        if(servers[message.guild.id]){
            if(servers[message.guild.id].summonedChannel){
                if(!servers[message.guild.id].summonedChannel || !message.guild.voiceConnection) servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;

                if(servers[message.guild.id].summonedChannel !== message.member.voiceChannel.id && message.member.voiceChannel.members.get('666067588039704599'))
                    if(message.member.voiceChannel.id === message.member.voiceChannel.members.get('666067588039704599').voiceChannelID)
                        servers[message.guild.id].summonedChannel = message.member.voiceChannel.id;
            }
        }
        else{
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
        }
        if(servers[message.guild.id].summonedChannel === message.member.voiceChannel.id){
            var link = message.content.split(' ')[1];
            if(link.startsWith('https://www.youtube.com/playlist?')){ //HA PLAYLISTET AD MEG A USE)R
                if(!message.guild.voiceConnection) await bot.commands.get("summon").run(bot,message,args).then(()=>{
                    message.guild.voiceConnection.player.streamingData.pausedTime = 0;
                });
                var listID = link.split('?')[1].substr(5);
                if(listID.match(/[a-zA-Z0-9_-]/g)){
                    playlistRequest(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${listID}&key=${botconfig.ytAPIKEY}`,
                    '',
                    message,
                    bot,
                    args);
                } 
            }
            else if(link.startsWith("https://www.youtube.com/watch?") || link.startsWith('https://youtu.be/')){ //HA LINKET AD MEG A USER
                if(message.content.split(' ').length > 2){
                    return message.channel.send(new Discord.RichEmbed()
                        .setColor("#DABC12")
                        .setTitle("Az argumentum több elemet tartalmaz!"));
                }
                var vidID;
                if(link.startsWith("https://www.youtube.com/watch?")) vidID = link.split("?")[1].split('&')[servers[message.guild.id].shuffleind].substr(2);
                else if(link.startsWith("https://youtu.be/")) vidID = link.split('/')[3];
                if(vidID.match(/[a-zA-Z0-9_-]{11}/g)){ //HA video id formátum változna, át kellesz majd írni
                    if(!message.guild.voiceConnection)  await bot.commands.get("summon").run(bot,message,args).then(()=>{ 
                        message.guild.voiceConnection.player.streamingData.pausedTime = 0;
                    });
                    servers = index.servers;
                    servers[message.guild.id].queue.push(link);
                    servers[message.guild.id].requestedBy.push(message.member.user.username);
                    servers[message.guild.id].requestedByProfPic.push(`https://cdn.discordapp.com/avatars/${message.member.user.id}/${message.member.user.avatar}.png`);
                    await new Promise((resolve, reject)=>{
                        ytdl.getInfo(link,{downloadURL: true}, async(err,info)=>{
                            if(err) console.log(err);
                            if(!servers) reject();
                            resolvable = servers[message.guild.id].information.push(info);
                            resolve(resolvable);
                        });
                    })
                    .then(()=>{
                        if(servers[message.guild.id].information[servers[message.guild.id].shuffleind]) afterPromise(message,bot,args,link);
                        else{
                            if(servers[message.guild.id] && message.guild.voiceConnection){
                                servers[message.guild.id].skips = 0;
                                servers[message.guild.id].skippedBy = [];
                                servers[message.guild.id].queue.shift();
                                servers[message.guild.id].information.shift();
                                servers[message.guild.id].requestedBy.shift();
                                servers[message.guild.id].requestedByProfPic.shift();
                                if(servers[message.guild.id].queue[server.shuffleind]){
                                    return play(message, bot);
                                }
                                else{
                                    message.channel.send(new Discord.RichEmbed()
                                        .setColor("#DABC12")
                                        .setTitle('Üres a lejátszási lista!'));
                                        servers[message.guild.id].dispatcher = null;
                                    if(message.guild.voiceConnection){
                                        server.playTimeout = setTimeout(()=>{
                                            if(message.guild.voiceConnection && !servers[message.guild.id].queue[server.shuffleind]) return bot.commands.get("fuckoff").run(bot,message,args);
                                        },300000);
                                    }
                                }
                            }
                            return message.channel.send(new Discord.RichEmbed()
                                        .setColor('#DABC12')
                                        .setTitle("A videó nem elérhető!"));
                        } 
                    })
                    .catch((error)=>{
                        console.log(error);
                    });
                }
            }
            else{ //HA NEM LINKET AD MEG A USER
                arg = message.content.split(' ');
                let query = [];
                for(var i = 1; i<arg.length; i++){
                    query[i] = arg[i];
                }
                request(`https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(query.join('+'))}&type=video&key=${botconfig.ytAPIKEY}&maxResults=1`,
                    async(error, response, body) =>{
                        if(!response) message.channel.send(new Discord.RichEmbed()
                                            .setColor('#DABC12')
                                            .setTitle('Váratlan hiba történt!'));
                        console.log(response.statusCode);
                        if(response.statusCode === 200){
                            let data = JSON.parse(response.body);
                            let count = Object.keys(data.items).length;
                            if(count>0){
                                if(!message.guild.voiceConnection) await bot.commands.get("summon").run(bot,message,args).then(()=>{
                                    message.guild.voiceConnection.player.streamingData.pausedTime = 0;
                                });
                                let vidID = data.items[servers[message.guild.id].shuffleind].id.videoId;
                                index = require("../index.js");
                                servers = index.servers;
                                servers[message.guild.id].queue.push(`https://www.youtube.com/watch?v=${vidID}`);
                                servers[message.guild.id].requestedBy.push(message.member.user.username);
                                servers[message.guild.id].requestedByProfPic.push(`https://cdn.discordapp.com/avatars/${message.member.user.id}/${message.member.user.avatar}.png`);
                                index.servers = servers;
                                await new Promise((resolve, reject)=>{
                                    ytdl.getInfo(`https://www.youtube.com/watch?v=${vidID}`, {downloadURL: true}, async(err,info)=>{
                                        resolvable = servers[message.guild.id].information.push(info);
                                        resolve(resolvable);
                                    });
                                })
                            .then(()=>{
                                if(servers[message.guild.id].queue[servers[message.guild.id].queue.length-1]) afterPromise(message,bot,args,servers[message.guild.id].queue[servers[message.guild.id].queue.length-1]);
                                else{
                                    if(servers[message.guild.id] && message.guild.voiceConnection){
                                        servers[message.guild.id].skips = 0;
                                        servers[message.guild.id].skippedBy = [];
                                        servers[message.guild.id].queue.shift();
                                        servers[message.guild.id].information.shift();
                                        servers[message.guild.id].requestedBy.shift();
                                        servers[message.guild.id].requestedByProfPic.shift();
                                        if(servers[message.guild.id].queue[server.shuffleind]){
                                            return play(message, bot);
                                        }
                                        else{
                                            message.channel.send(new Discord.RichEmbed()
                                                .setColor("#DABC12")
                                                .setTitle('Üres a lejátszási lista!'));
                                                servers[message.guild.id].dispatcher = null;
                                            if(message.guild.voiceConnection){
                                                server.playTimeout = setTimeout(()=>{
                                                    if(message.guild.voiceConnection && !servers[message.guild.id].queue[server.shuffleind]) return bot.commands.get("fuckoff").run(bot,message,args);
                                                },300000);
                                            }
                                        }
                                    }
                                    return message.channel.send(new Discord.RichEmbed()
                                                .setColor('#DABC12')
                                                .setTitle("A videó nem elérhető!"));
                                }
                            })
                            .catch((error)=>{
                                console.log(error);
                            });
                                
                            }
                            else{
                                return message.channel.send(new Discord.RichEmbed()
                                    .setColor('#DABC12')
                                    .setTitle('Nem volt találat!'));
                            }
                        }
                        else{
                            return message.channel.send(new Discord.RichEmbed()
                                .setColor('#DABC12')
                                .setTitle('Hiba történt a szerverrel való kommunikációval!'));
                        }
                    });
            }
        }
        else{
            return message.channel.send(new Discord.RichEmbed()
                .setColor("#DABC12")
                .setTitle("Nem vagyunk ugyanabban a szobában!"));
        }
        
    }
}
module.exports.help = {
    name: "play",
    type: "music",
    alias: ["p"]
}

module.exports.play = play;