const Discord = require('discord.js');
const client = new Discord.Client();

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-').replace(/(^-+|-+$)/g, '');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const walkSessions = {};

client.on('message', message => {
  if(message.guild.available) {
    if(message.member.roles.find(k => slug(k.name) === 'woodsm-n')) {
      let cmd = /^%walkwith\s(.+)/.exec(message.content)
      if(cmd && cmd.length === 2) {
        if(walkSessions[message.member.id]) {
          return message.reply(`You are already on a walk with ${walkSessions[message.member.id].user.displayName}. Please \`%return\` before starting another.`);
        }

        const username = slug(cmd[1].trim());
        const user = message.guild.members.find(m => slug(`${m.displayName}`).indexOf(username) > -1 || slug(m.user.username).indexOf(username) > -1);
        if(user) {
          const caterpillarRole = message.guild.roles.find(k => slug(k.name) === 'hungry-caterpillar');
          user.addRole(caterpillarRole);
          walkSessions[message.member.id] = {
            user: user,
            role: caterpillarRole,
            timeout: setTimeout(() => {
              user.removeRole(caterpillarRole);
              delete walkSessions[message.member.id];
            }, 3600000)
          };

          return message.reply(`Enjoy your walk with ${user.displayName}. Don't forget to \`%return\` when you are done.`);
        }
      }

      cmd = /^%return/.exec(message.content);
      if(cmd) {
        if(!walkSessions[message.member.id]) {
          return message.reply(`You are not on a walk. You'll need to \`%walkwith someone\` before trying to return.`);
        }

        const user = walkSessions[message.member.id].user;
        user.removeRole(walkSessions[message.member.id].role);
        clearTimeout(walkSessions[message.member.id].timeout);
        delete walkSessions[message.member.id];
        return message.reply(`I hope you enjoyed your walk with ${user.displayName}.`);
      }
    }
  }
});

client.on('guildMemberAdd', (member) => {
  if(member.guild.available) {
    const larvaRole = member.guild.roles.find(k => slug(k.name) === 'li-l-larva');
    if(larvaRole) {
      member.addRole(larvaRole);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);