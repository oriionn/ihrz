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

import { ClusterMethod, OwnIhrzCluster, PublishURL } from '../../../core/functions/apiUrlParser.js';
import { LanguageData } from '../../../../types/languageData';

import { Custom_iHorizon } from '../../../../types/ownihrz';
import { OwnIHRZ } from '../../../core/modules/ownihrzManager.js';
import config from '../../../files/config.js';
import axios, { AxiosResponse, all } from 'axios';
import logger from '../../../core/logger.js';
import path from 'path';
import wait from 'wait';
import fs from 'fs';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction, data: LanguageData) => {

        let cluster = interaction.options.getString("cluster");
        let id = interaction.options.getString('id');

        var table_1 = client.db.table("TEMP");
        let allData = await table_1.get(`OWNIHRZ`);

        function getData() {
            for (let ownerId in allData) {
                for (let botId in allData[ownerId]) {
                    if (botId !== id) continue;
                    return allData[ownerId][botId];
                }
            }
        }
        let id_2 = getData() as Custom_iHorizon;

        id_2.AdminKey = config.api.apiToken;
        id_2.Code = id as string;

        if ((interaction.user.id !== config.owner.ownerid1) && (interaction.user.id !== config.owner.ownerid2)) {
            await interaction.reply({ content: client.iHorizon_Emojis.icon.No_Logo, ephemeral: true });
            return;
        };

        if (!id_2) {
            await interaction.reply({ content: data.mybot_manage_accept_not_found });
            return;
        };

        let bot_1 = (await axios.get(`https://discord.com/api/v10/applications/@me`, {
            headers: {
                Authorization: `Bot ${id_2.Auth}`
            }
        }).catch(() => { }))?.data || 404;

        if (bot_1 === 404) {
            await interaction.reply({ content: data.mybot_manage_accept_token_error });
            await table_1.delete(`OWNIHRZ.${interaction.user.id}.${id}`);
            return;
        } else {

            let utils_msg = data.mybot_manage_accept_utils_msg
                .replace('${bot_1.bot.id}', bot_1.bot.id)
                .replace('${bot_1.bot.username}', bot_1.bot.username)
                .replace("${bot_1.bot_public ? 'Yes' : 'No'}",
                    bot_1.bot_public ? data.mybot_manage_accept_utiis_yes : data.mybot_manage_accept_utils_no
                );

            let embed = new EmbedBuilder()
                .setColor('#ff7f50')
                .setTitle(data.mybot_manage_accept_embed_title
                    .replace('${bot_1.bot.username}', bot_1.bot.username)
                    .replace('${bot_1.bot.discriminator}', bot_1.bot.discriminator)
                )
                .setDescription(data.mybot_manage_accept_embed_desc
                    .replace('${utils_msg}', utils_msg)
                )
                .setFooter({ text: 'iHorizon', iconURL: "attachment://icon.png" });

            await interaction.reply({
                embeds: [embed],
                ephemeral: false,
                files: [{ attachment: await interaction.client.functions.image64(interaction.client.user?.displayAvatarURL()), name: 'icon.png' }]
            });

            if (cluster) {
                try {
                    axios.post(OwnIhrzCluster(cluster as unknown as number, ClusterMethod.CreateContainer), id_2, { headers: { 'Accept': 'application/json' } })
                        .then(async (response: AxiosResponse) => {
                            if (cluster) {
                                var table_1 = client.db.table('OWNIHRZ');

                                await table_1.set(`CLUSTER.${id_2.OwnerOne}.${id_2.Code}`,
                                    {
                                        Path: (path.resolve(process.cwd(), 'ownihrz', id_2.Code)) as string,
                                        Auth: id_2.Auth,
                                        port: 0,
                                        Cluster: cluster,
                                        ExpireIn: id_2.ExpireIn,
                                        Bot: id_2.Bot,
                                        Code: id_2.Code,
                                    }
                                );
                            }
                        })
                        .catch(error => {
                            logger.err(error)
                        });
                } catch (error: any) {
                    return logger.err(error)
                };

            } else {
                return new OwnIHRZ().Create({
                    Auth: id_2.Auth,
                    OwnerOne: id_2.OwnerOne,
                    OwnerTwo: id_2.OwnerTwo,
                    Bot: {
                        Id: id_2.Bot.Id,
                        Name: id_2.Bot.Name,
                        Public: id_2.Bot.Public
                    },
                    ExpireIn: id_2.ExpireIn,
                    Code: id_2.Code,
                    AdminKey: ''
                });

            };

            await table_1.delete(`OWNIHRZ.${interaction.user.id}.${id}`);
            return;
        };
    },
};