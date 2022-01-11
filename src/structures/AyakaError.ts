export class AyakaError extends Error {
    constructor(name: string, message: string) {
        super(message)
        this.name = `AyakaError [${name}]`
    }
}
