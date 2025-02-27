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
    Client,
    EmbedBuilder,
    ChatInputCommandInteraction,
    time,
    ApplicationCommandType
} from 'discord.js'

import pkg from '../../../../package.json' assert { type: "json" };

import { Command } from '../../../../types/command';
import config from '../../../files/config.js';
import os from 'node:os';

function niceBytes(a: Number) { let b = 0, c = parseInt((a as unknown as string), 10) || 0; for (; 1024 <= c && ++b;)c /= 1024; return c.toFixed(10 > c && 0 < b ? 1 : 0) + " " + ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][b] }

export const command: Command = {
    name: 'status',

    description: 'Get the bot status! (Only for the bot owner)',
    description_localizations: {
        "fr": "Obtenez le statut du bot ! (Uniquement pour le propriétaire du bot)"
    },

    category: 'bot',
    thinking: false,
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        let data = await client.functions.getLanguageData(interaction.guild?.id);

        if (interaction.user.id != config.owner.ownerid1 && config.owner.ownerid2) {
            await interaction.reply({ content: data.status_be_bot_dev });
            return;
        };

        let embed = new EmbedBuilder()
            .setColor("#82cda8")
            .setFields(
                { name: "Cpu", value: `${os.cpus()[0].model} (${os.machine()})`, inline: false },
                { name: "Memory", value: `${niceBytes(os.freemem())}/${niceBytes(os.totalmem())}`, inline: false },
                { name: "Machine Uptime", value: `${time(new Date(Date.now() - os.uptime() * 1000), 'd')}`, inline: false },
                { name: "OS", value: `${os.platform()} ${os.type()} ${os.release()}`, inline: false },
                { name: "Bot Version", value: `${pkg.version}`, inline: false },
            )
            .setThumbnail(interaction.guild?.iconURL() as string)
            .setFooter({ text: 'iHorizon', iconURL: "attachment://icon.png" })

        await interaction.reply({
            embeds: [embed],
            files: [{ attachment: await client.functions.image64(client.user?.displayAvatarURL()), name: 'icon.png' }]
        });
        return;
    },
};