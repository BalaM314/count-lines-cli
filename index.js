#!/usr/bin/env node


import fs from "fs";
import { Application } from "cli-app";
import glob from "glob";
import chalk from "chalk";


const countlines = new Application("count-lines", "A small script to count lines of files in a directory.");
countlines.command("count", "Counts lines.", async (opts, app) => {
	console.log("");
	const lines = await countLines(opts.positionalArgs[0] ?? "*.*", {
		ignoreEmptyLines: "ignoreEmptyLines" in opts.namedArgs
	});
	console.log(chalk.blueBright(`\t${lines} lines.`));
}, true, {
	namedArgs: {
		ignoreEmptyLines: {
			default: "false",
			description: "Whether to ignore empty lines when counting.",
			needsValue: false,
			aliases: []
		}
	},
	positionalArgs: [{
		name: "pattern",
		description: "Only file names that match this glob pattern are counted"
	}]
});

function countLines(pattern, options){
	return new Promise((resolve, reject) => {
		glob(pattern, {
			nodir: true
		}, (err, files) => {
			if(err) reject(err.message);
			console.log(chalk.blueBright(`\tCounting lines in ${files.length} files...`));
			resolve(
				files
					.map(file => fs.readFileSync(file, "utf-8"))
					.map(file => countLinesInText(file, options))
					.reduce((count, lines) => count + lines, 0)
			);
		});
	});
}

function countLinesInText(text, options){
	if(options.ignoreEmptyLines){
		return text.split(/\r?\n/g).map(line => line.replace(/[ \t]/g, "")).filter(line => line != "").length;
	} else {
		return text.split(/\r?\n/g).length;
	}
}

function main(argv){
	countlines.run(argv);
}

main(process.argv);
