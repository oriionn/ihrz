const { 
    Client, 
    Intents, 
    Collection, 
    EmbedBuilder,
    Permissions, 
    ApplicationCommandType, 
    PermissionsBitField, 
    ApplicationCommandOptionType 
  } = require('discord.js');
  
const { QueryType, Player} = require('discord-player');

module.exports = {
    name: 'p',
    description: '(music) play a music',
    options: [
        {
            name: 'title',
            type: ApplicationCommandOptionType.String,
            description: 'The track title you want (you can put URL as you want)',
            required: true
        }
    ],
    run: async (client, interaction) => {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
          return interaction.reply({content: "You must be connected to a voice channel to use this command!"});
        }
        try {
            const check = interaction.options.getString("title")
            
           const result = await interaction.client.player.search(check, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        })


        const results = new EmbedBuilder()
        .setTitle(`No results`)
        .setColor(`#ff0000`)
        .setTimestamp()

        if (!result.hasTracks()) {
            return interaction.reply({embeds: [results]})
        }

        await interaction.deferReply()
        await interaction.editReply({ content: `⏲️ Loading an : ${result.playlist ? 'playlist' : 'track' }`})

        const yes = await interaction.client.player.play(interaction.member.voice.channel?.id, result, {
            nodeOptions: {
                metadata: {
                    channel: interaction.channel,
                    client: interaction.guild?.members.me,
                    requestedBy: interaction.user.username
                },
                volume: 20,
                bufferingTimeout: 3000,
                leaveOnEnd: true
              },
            
        })
        
        const embed = new EmbedBuilder()
        function yess() {
            const totalDurationMs = yes.track.playlist.tracks.reduce((a, c) => c.durationMS + a, 0)
            const totalDurationSec = Math.floor(totalDurationMs / 1000);
            const hours = Math.floor(totalDurationSec / 3600);
            const minutes = Math.floor((totalDurationSec % 3600) / 60);
            const seconds = totalDurationSec % 60;
            const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            return durationStr
        }
        
        embed
            .setDescription(`${yes.track.playlist ? `**multiple tracks** from: **${yes.track.playlist.title}**` : `**${yes.track.title}**`}`)
            .setThumbnail(`${yes.track.playlist ? `${yes.track.playlist.thumbnail.url}` : `${yes.track.thumbnail}`}`)
            .setColor(`#d0ff00`)
            .setTimestamp()
            .setFooter({ text: `Duration: ${yes.track.playlist ? `${yess()}` : `${yes.track.duration}`}` })
            return interaction.editReply({ embeds: [embed ]})
        }catch (error) {
            console.log(error)
        }
}}