/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import {
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
} from 'discord.js';

import { useQueue } from 'discord-player';
import { LanguageData } from '../../../../types/languageData';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction, data: LanguageData) => {

        let queue = useQueue(interaction.guildId as string);

        if (!queue) {
            await interaction.editReply({ content: data.queue_iam_not_voicec });
            return;
        };

        if (!queue.tracks || !queue.currentTrack) {
            await interaction.editReply({ content: data.queue_no_queue });
            return;
        };

        let tracks = queue.tracks
            .toArray()
            .map((track, idx) => `**${++idx})** [${track.title}](${track.url})`);

        if (tracks.length === 0) {
            await interaction.editReply({ content: data.queue_empty_queue });
            return;
        };

        let embeds: EmbedBuilder[] = [];
        let chunkSize = 10;
        let index = 0;
        while (tracks.length > 0) {
            let chunk = tracks.slice(0, chunkSize);
            let embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle(data.queue_embed_title)
                .setDescription(chunk.join('\n') || data.queue_embed_description_empty)
                .setFooter({
                    text: data.queue_embed_footer_text
                        .replace("{index}", index + 1 as unknown as string)
                        .replace("{track}", queue.tracks.size as unknown as string)
                });

            embeds.push(embed);
            tracks.splice(0, chunkSize);
            index++;
        };

        let message = await interaction.editReply({ embeds: [embeds[0]] });

        if (embeds.length === 1) return;

        message.react('⬅️');
        message.react('➡️');

        let collector = message.createReactionCollector({
            filter: (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name as string) && user.id === interaction.user.id,
            time: 60000
        });

        let currentIndex = 0;
        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case '⬅️':
                    if (currentIndex === 0) return;
                    currentIndex--;
                    break;
                case '➡️':
                    if (currentIndex === embeds.length - 1) return;
                    currentIndex++;
                    break;
                default:
                    break;
            }
            reaction.users.remove(user.id).catch(() => { });
            message.edit({ embeds: [embeds[currentIndex]] });
        });

        collector.on('end', () => {
            message.reactions.removeAll().catch(() => { });
        });
    },
};