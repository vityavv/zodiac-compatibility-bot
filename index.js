const Discord = require("discord.js")
const client = new Discord.Client();
//TODO switch to better DB
const db = require("better-sqlite3")("app.db")
db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, sign STRING)").run()

const COMPATIBILITY = require("./compatibility.json")

const SIGNS = ["aries", "leo", "cancer", "pisces", "scorpio", "taurus", "sagittarius", "gemini", "virgo", "libra", "capricorn", "aquarius"]

client.on("ready", () => {
	console.log("Logged in!")
})

client.on("message", msg => {
	if (msg.content.startsWith("z!")) {
		if (msg.content.toLowerCase().startsWith("z!set")) {
			const sign = SIGNS.find(sign => msg.content.toLowerCase().includes(sign))
			if (sign) {
				if (db.prepare("SELECT * FROM users WHERE id=?").get(msg.author.id)) {
					db.prepare("UPDATE users SET sign=? WHERE id=?").run(sign, msg.author.id)
					msg.reply("Updated your sign to " + sign)
					return
				}
				db.prepare("INSERT INTO users (id, sign) VALUES (?, ?)").run(msg.author.id, sign)
				msg.reply("Set your sign to " + sign)
				return
			}
			msg.reply("The name of a zodiac sign was not found in your message. The zodiac signs are: " + SIGNS.join(", ") + ".")
			return
		}
		if (msg.content.toLowerCase().startsWith("z!get")) {
			const sign = db.prepare("SELECT sign FROM users WHERE id=?").get(msg.author.id).sign
			if (sign) {
				msg.reply("Your sign in our system is " + sign)
				return
			}
			msg.reply("You don't have a sign in our system! Set one with z!set")
			return
		}
		if (msg.content.toLowerCase().startsWith("z!compat")) {
			const mentions = msg.mentions.users
			if (mentions.size === 1) {
				const mentioned = mentions.values().next().value;
				const sign1 = db.prepare("SELECT sign FROM users WHERE id=?").get(msg.author.id).sign
				if (!sign1) {
					msg.reply("You do not have a sign in our system! Set one with z!set <sign>")
					return
				}
				const sign2 = db.prepare("SELECT sign FROM users WHERE id=?").get(mentioned.id).sign
				if (!sign2) {
					msg.reply("The user whose compatibility you want to check doesn't have a sign in our system! Tell them to set one with z!set <sign>")
					return
				}
				const embed = new Discord.MessageEmbed()
					.setTitle(`Compatibility of ${msg.author.tag} and ${mentioned.tag}`, msg.author.avatarURL())
					.setDescription(`${msg.author.tag}'s sign is ${sign1} and ${mentioned.tag}'s is ${sign2}. Press the link above to find out more about their compatibility.`)
					.setURL(`https://www.astrology-zodiac-signs.com/compatibility/${sign1}-${sign2}`)
				;
				["Sexual & Intimacy Compatibility", "Trust", "Communication and Intellect", "Emotions", "Values", "Shared Activities", "Summary"].forEach((field, i) => {
					embed.addField(field, COMPATIBILITY[sign1][sign2][i])
				})
				msg.channel.send(embed)
				return
			}
			msg.reply("You must mention exactly one person when finding your compatibility with others")
			return
		}
		const embed = new Discord.MessageEmbed()
			.setAuthor("How to use the Zodiac Compatibility Bot")
			.setDescription("This is a bot made by Victor. It's [open source!](https://github.com/vityavv/zodiac-compatibility-bot)")
			.addFields([
				{name: "z!set <sign>", value: "Sets your sign in the system"},
				{name: "z!get", value: "Gets your sign"},
				{name: "z!compat <user>", value: "Checks your compatibility with someone. Make sure to mention exactly one person."},
				{name: "z!<anything else>", value: "Opens up this dialog"}
			])
		msg.channel.send(embed)
	}
})

client.login(require("./config").token)
