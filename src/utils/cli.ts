type Command = [docs: string, fn: (args: Array<string>) => Promise<void>];
type Options = { [command: string]: Command };

export default async function cli(command: string, args: Array<string>, options: Options) {
    if (!options[command]) {
        throw new Error(`Unknown command: ${command}`);
    }
    const [docs, fn] = options[command];
    if (args.includes('help')) console.log(docs);
    else await fn(args);
}