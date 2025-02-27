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

import config from '../files/config.js';
import logger from '../core/logger.js';

import { Client, CommandInteractionOptionResolver, EmbedBuilder, GuildChannel, Interaction } from 'discord.js';
import fs from 'fs';

var timeout: number = 1000;

export default async (client: Client, interaction: Interaction) => {

    async function commandExecutor() {
        if (!interaction.isContextMenuCommand()
            || !interaction.guild?.channels
            || interaction.user.bot) return;

        let cmd = client.applicationsCommands.get(interaction.commandName);
        if (cmd && cmd.thinking) { await interaction.deferReply(); };
        if (cmd) { cmd.run(client, interaction) };
    };

    async function buttonExecutor() {
        if (!interaction.isButton()
            || !interaction.guild?.channels
            || interaction.user.bot) return;

        let get = client.buttons.get(interaction.customId);
        if (get) get(interaction);
    };

    async function selectMenuExecutor() {
        if (!interaction.isUserSelectMenu()
            || !interaction.guild?.channels
            || interaction.user.bot) return;

        let get = client.selectmenu.get(interaction.customId);
        if (get) get(interaction);
    };

    async function slashExecutor() {
        if (!interaction.isChatInputCommand()
            || !interaction.guild?.channels
            || interaction.user.bot) return;

        let command = client.commands?.get(interaction.commandName);

        if (!command) {
            return interaction.reply({ content: "Connection error.", ephemeral: true });
        };

        if (await cooldDown()) {
            let data = await client.functions.getLanguageData(interaction.guild.id);

            await interaction.reply({ content: data.Msg_cooldown, ephemeral: true });
            return;
        };

        try {
            if (await client.db.get(`GLOBAL.BLACKLIST.${interaction.user.id}.blacklisted`)) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#0827F5").setTitle(":(")
                            .setImage(config.core.blacklistPictureInEmbed)
                    ], ephemeral: true
                });
                return;
            };

            if (command.thinking) {
                await interaction.deferReply();
            };

            await command.run(client, interaction);
        } catch (e: any) {
            logger.err(e);
        };
    };

    async function logsCommands(): Promise<void> {
        if (!interaction.isCommand()
            || !interaction.guild?.channels
            || interaction.user.bot) return;

        let optionsList: string[] = (interaction.options as CommandInteractionOptionResolver)["_hoistedOptions"].map(element => `${element.name}:"${element.value}"`)
        let subCmd: string = '';

        if ((interaction.options as CommandInteractionOptionResolver)["_subcommand"]) {
            if ((interaction.options as CommandInteractionOptionResolver).getSubcommandGroup()) subCmd += (interaction.options as CommandInteractionOptionResolver).getSubcommandGroup()! + " ";
            subCmd += (interaction.options as CommandInteractionOptionResolver).getSubcommand()
        };
        
        let logMessage = `[${(new Date()).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}}] "${interaction.guild?.name}" #${interaction.channel ? (interaction.channel as GuildChannel).name : 'Unknown Channel'}:\n` +
            `${interaction.user.username}:\n` +
            `/${interaction.commandName} ${subCmd} ${optionsList?.join(' ')}\n\n`;

        fs.appendFile(`${process.cwd()}/src/files/slash.log`, logMessage, (err) => {
            if (err) {
                logger.warn('Error writing to slash.log');
            };
        });
    };

    async function cooldDown() {
        let tn = Date.now();
        let table = client.db.table("TEMP");
        var fetch = await table.get(`COOLDOWN.${interaction.user.id}`);
        if (fetch !== null && timeout - (tn - fetch) > 0) return true;

        await table.set(`COOLDOWN.${interaction.user.id}`, tn);
        return false;
    };

    slashExecutor(), buttonExecutor(), selectMenuExecutor(), commandExecutor(), logsCommands();
};