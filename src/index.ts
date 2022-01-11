import "@sapphire/plugin-logger/register"
import { AyakaClient } from "./structures/AyakaClient"
import { token } from "./config"

const client = new AyakaClient()
void client.login(token)
