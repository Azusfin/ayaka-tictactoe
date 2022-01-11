import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommandSuccessPayload, Listener, ListenerOptions } from "@sapphire/framework";

@ApplyOptions<ListenerOptions>({
    name: "chatInputCommandSuccess"
})
export class CommandSuccessEvent extends Listener {
    public override run({ interaction, command }: ChatInputCommandSuccessPayload): void {
        this.container.logger.info(
            "Command Success:", command.name,
            "-", "User:", interaction.user.id,
            "-", "Channel:", interaction.channel?.id ?? "DM",
            "-", "Guild:", interaction.guild?.id ?? "N/A"
        )
    }
}
