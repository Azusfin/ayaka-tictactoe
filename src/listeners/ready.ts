import { ApplyOptions } from "@sapphire/decorators"
import { ListenerOptions, Listener } from "@sapphire/framework"
import { Team } from "discord.js"
import { owners } from "../config"

@ApplyOptions<ListenerOptions>({
    name: "ready",
    once: true
})
export class ReadyEvent extends Listener {
    public override async run(): Promise<void> {
        this.container.logger.info("Configurations Loaded")

        const developerID = await this.container.client.application!.fetch()

        if (developerID.owner instanceof Team) {
            for (const ownerID of developerID.owner.members.keys()) {
                if (!owners.includes(ownerID)) owners.push(ownerID)
            }
        } else if (!owners.includes(developerID.owner!.id)) {
            owners.push(developerID.owner!.id)
        }

        await Promise.all(
            owners.map(
                ownerID => this.container.client.users.fetch(ownerID, { cache: true }).catch(() => null)
            )
        )

        this.container.logger.info("Application Info Fetched")

        this.container.client.user!.setActivity({
            name: "💙 /help",
            type: "WATCHING"
        })

        this.container.logger.info("Activity Has Been Set")

        this.container.logger.info(`Logged In Client ${this.container.client.user!.tag}`)

        this.container.logger.info("Connecting To Mongo Database...")

        const before = Date.now()

        await this.container.client.db.connect()

        this.container.logger.info(
            "Connected To Mongo Database",
            "-", `Took ${Date.now() - before}ms to connect`
        )
    }
}
