const Discord = require("discord.js");
const db = require("quick.db");
const config = require("../../../config.json")
const limit = new Map()
const moment = require("moment")
moment.locale("tr")

module.exports = {
    name: "jail",
    aliases: ["temp-jail", "tjail", "karantina"],
    execute: async (client, message, args, embed, author, channel, guild) => {
        if (!message.member.roles.cache.has(config.penals.jail.staff) && !message.member.hasPermission("BAN_MEMBERS")) return channel.send("Komutu kullanabilmek için geçerli yetkin olmalı.");
        let member = message.mentions.members.first() || guild.members.cache.get(args[0]);
        if (!member) return channel.send("Geçerli bir kullanıcı belirtmelisin!")
        if (!message.member.hasPermission(8) && member && member.roles.highest.position >= message.member.roles.highest.position) return channel.send("Aynı veya yüksek yetki!")
        let sebep = args.slice(1).join(' ') || `Sebep girilmemiş.`
        db.set(`roles.${member.id}`, member.roles.cache.map(x => x.id))
        db.set(`isim.${member.id}`, member.displayName)
        member.setNickname(`[CEZALI] ${member.displayName}`)
        member.roles.set([config.penals.jail.roles])
        message.channel.send((`**${member}** **(${member.id})**kullanıcısı "**${sebep}**" sebebiyle jail'e atıldı! (Ceza Numarası: \`#${db.fetch(`ceza_${guild.id}`)}\`)`))
        db.add(`ceza_${guild.id}`, 1)
        const log = new Discord.MessageEmbed()
            .setColor("RED")
            .setTimestamp()
            .setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
            .setFooter("atia'S 💙 ONSRA")
            .setDescription(`
            ${member ? member.toString(): member.username} kullanıcısı karantinaya atıldı!
            
    Kullanıcı: ${member ? member.toString: member.username} - ${member.id}
    Yetkili: ${author} - ${author.id}
    Tarih: ${moment(Date.now).format("LLL")}
            `);
                  message.react(config.emojis.accept)
        client.channels.cache.get(config.penals.jail.log).send(log);
        db.push(`sicil_${member.id}`, `${message.author} Tarafından ${moment(Date.now()).format("LLL")} tarihinde **${sebep}** sebebiyle **JAIL** cezası almış.`)
        db.add(`points_${member}`, config.penals.points.jailpoints);
        if (config.penals.jail.limit > 0) {
            if (!limit.has(message.author.id)) limit.set(message.author.id, 1);
            else limit.set(message.author.id, limit.get(message.author.id) + 1);
            setTimeout(() => {
                if (limit.has(message.author.id)) limit.delete(message.author.id);
            }, 1000 * 60 * 60)
        };
    }
}
