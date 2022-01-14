import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "noBot"
})
export class NoBot extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const user = interaction.options.getUser("user", true)

        return user.bot
            ? this.error({ message: "Bots are too smart to play tictactoe" })
            : this.ok()
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        noBot: never
    }
}
