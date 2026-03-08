import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import settings from "../../settings.js";
import * as Mindcraft from "../mindcraft/mindcraft.js";

function parseArguments() {
	return yargs(hideBin(process.argv))
		.option("mindserver_port", {
			type: "number",
			describe: "Mindserver port",
			default: settings.mindserver_port,
		})
		.help()
		.alias("help", "h")
		.parse();
}

const args = parseArguments();

settings.mindserver_port = args.mindserver_port;

Mindcraft.init(settings.mindserver_port);

console.log(`Mindcraft initialized with MindServer at localhost:${settings.mindserver_port}`);
