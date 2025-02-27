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

import { Client, Collection } from "discord.js";
import { opendir } from "fs/promises";
import { join as pathJoin } from "node:path";
import logger from "../logger.js";
import { Command } from "../../../types/command.js";
import db from '../functions/DatabaseModel.js';
import config from "../../files/config.js";
import { EltType } from "../../../types/eltType.js";
import { Option } from "../../../types/option.js";

async function buildDirectoryTree(path: string): Promise<(string | object)[]> {
    let result = [];
    let dir = await opendir(path);
    for await (let dirent of dir) {
        if (!dirent.name.startsWith('!')) {
            if (dirent.isDirectory()) {
                result.push({ name: dirent.name, sub: await buildDirectoryTree(pathJoin(path, dirent.name)) });
            } else {
                result.push(dirent.name);
            }
        }
    }
    return result;
};

function buildPaths(basePath: string, directoryTree: (string | object)[]): string[] {
    let paths = [];
    for (let elt of directoryTree) {
        switch (typeof elt) {
            case "object":
                for (let subElt of buildPaths((elt as EltType).name, (elt as EltType).sub)) {
                    paths.push(pathJoin(basePath, subElt));
                }
                break;
            case "string":
                paths.push(pathJoin(basePath, elt));
                break;
            default:
                throw new Error('Invalid element type');
        }
    }
    return paths;
};

async function processOptions(options: Option[], category: string, parentName: string = "") {
    for (let option of options) {
        let fullName = parentName ? `${parentName} ${option.name}` : option.name;

        if (option.type === 1) {
            var table_1 = db.table("BOT");
            await table_1.push(`CONTENT.${category}`,
                {
                    cmd: fullName, desc: { desc: option.description, lang: option.description_localizations, message_command: false }
                }
            );
        };
        if (option.options) {
            await processOptions(option.options, category, fullName);
        };
    };
};

export default async function loadCommands(client: Client, path: string = `${process.cwd()}/dist/src/Interaction/SlashCommands`): Promise<void> {

    let directoryTree = await buildDirectoryTree(path);
    let paths = buildPaths(path, directoryTree);
    var table_1 = client.db.table("BOT");

    client.commands = new Collection<string, Command>();

    var i = 0;
    for (let path of paths) {
        if (!path.endsWith('.js')) continue;
        i++;

        let module = await import(path).then((module) => module);

        if (module && module.command) {
            const { command } = module;

            if (command.options) {
                await processOptions(command.options, command.category, command.name);
            };

            await table_1.push(`CONTENT.${command.category}`,
                {
                    cmd: command.name, desc: { desc: command.description, lang: command.description_localizations }, message_command: false
                }
            );

            client.commands.set(command.name, command);
        }
    };

    logger.log(`${config.console.emojis.OK} >> Loaded ${i} Slash commands.`);
};
