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

/*
・ ElektraBots Discord Bot (https://github.com/belugafr/ElektraBots)

・ Mainly developed by NayaWeb (https://github.com/belugafr)

・ Copyright © 2021-2023 ElektraBots
*/

import {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    User,
} from 'discord.js'

import axios, { AxiosResponse } from 'axios';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {

        let entry = interaction.options.getString('comment');
        let args = entry!.split(' ');

        let user: User = interaction.options.getUser('user') || interaction.user;

        if (args.length < 1) {
            await interaction.editReply({ content: 'Please, send a good sentence!' });
            return;
        };

        let username = user?.globalName;

        if (username && username.length > 15) {
            username = username.substring(0, 15);
        };

        let link = `https://some-random-api.com/canvas/misc/youtube-comment?avatar=${encodeURIComponent((user.displayAvatarURL({ extension: 'png' }) as string))}&username=${encodeURIComponent((username as string))}&comment=${encodeURIComponent(args.join(' '))}`;

        let embed = new EmbedBuilder()
            .setColor('#000000')
            .setImage('attachment://all-human-have-rights-elektra.png')
            .setTimestamp()
            .setFooter({ text: 'iHorizon x ElektraBots', iconURL: "attachment://icon.png" });

        let imgs: AttachmentBuilder;

        await axios.get(link, { responseType: 'arraybuffer' }).then((response: AxiosResponse) => {
            imgs = new AttachmentBuilder(Buffer.from(response.data, 'base64'), { name: 'youtube-elektra.png' });
            embed.setImage(`attachment://youtube-elektra.png`);
        });

        await interaction.editReply({ embeds: [embed], files: [imgs!, { attachment: await interaction.client.functions.image64(interaction.client.user?.displayAvatarURL()), name: 'icon.png' }] });
        return;
    },
};