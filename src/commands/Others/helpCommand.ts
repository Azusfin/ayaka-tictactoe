import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { ApplicationCommandOptionChoice, AutocompleteInteraction, Collection, CommandInteraction, EmbedFieldData, MessageEmbed } from "discord.js";
import { embedColor } from "../../config";
import { register } from "../../utils/Util";

@ApplyOptions<CommandOptions>({
    name: "help",
    description: "Show a list of commands and specific info of a command",
    detailedDescription: "[command]"
})
export class HelpCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const cmdName = interaction.options.getString("command")
        const cmdStore = this.container.stores.get("commands")

        if (!cmdName) {
            const categories = new Collection<string, Command[]>()

            for (const cmd of cmdStore.values()) {
                const category = cmd.category ?? "No Category"

                const cmds = categories.get(category) ?? []
                cmds.push(cmd)

                categories.set(category, cmds)
            }

            const fields: EmbedFieldData[] = categories.map(
                (cmds, category) => ({
                    name: category,
                    value: `\`${cmds.map(cmd => cmd.name).join("`, `")}\``
                })
            )

            const embed = new MessageEmbed()
                .setTitle("Commands List")
                .setDescription(
                    "You can type `/<command-name>` to use the command\n" +
                    "`/help <command-name>` to show more info about a command"
                )
                .addFields(fields)
                .setColor(embedColor)

            await interaction.reply({
                ephemeral: true,
                embeds: [embed]
            })

            return
        }

        const lowercaseCmd = cmdName.toLowerCase()
        const cmd = cmdStore.find(cmd => cmd.name === lowercaseCmd)

        if (!cmd) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTitle("Not Found")
                        .setDescription(`No command found with name \`${cmdName}\``)
                        .setColor(embedColor)
                ]
            })
            return
        }

        const name = cmd.name
        const description = cmd.description
        const usage = `/${name}${cmd.detailedDescription ? ` ${cmd.detailedDescription}` : ""}`

        const embed = new MessageEmbed()
            .setTitle(name)
            .setDescription(description)
            .addFields({
                name: "Usage",
                value: usage
            })
            .setColor(embedColor)

        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        })
    }

    public override autocompleteRun(interaction: AutocompleteInteraction): void {
        const partialCmd = interaction.options.getString("command") ?? ""
        const lowercasePartialCmd = partialCmd.toLowerCase()

        const commandStore = this.container.stores.get("commands")
        const choices: ApplicationCommandOptionChoice[] = []

        for (const cmd of commandStore.values()) {
            if (cmd.name.includes(lowercasePartialCmd)) {
                choices.push({
                    name: cmd.name,
                    value: cmd.name
                })
            }

            if (choices.length >= 25) return
        }

        void interaction.respond(choices)
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        register(
            registry,
            builder => {
                builder.addStringOption(
                    option => option
                        .setName("command")
                        .setDescription("The command to show the info to")
                        .setRequired(false)
                        .setAutocomplete(true)
                )

                return builder
                    .setName(this.name)
                    .setDescription(this.description)
            }
        )
    }
}
