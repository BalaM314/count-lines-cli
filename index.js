#!/usr/bin/env node
//@ts-check

import fs from "fs";
import { Application, arg } from "@balam314/cli-app";
import glob from "glob";
import chalk from "chalk";


const countlines = new Application("count-lines", "A small script to count lines of files in a directory.");
countlines.onlyCommand().args({
	namedArgs: {
		ignoreEmptyLines: arg().description("Whether to ignore empty lines when counting.")
			.valueless().aliases("e")
	},
	positionalArgs: [{
		name: "pattern",
		description: "Only file names that match this glob pattern are counted",
		default: "*.*"
	}]
}).impl(async (opts, app) => {
	process.stdout.write("\n");
	const lines = await countLines(opts.positionalArgs[0], {
		ignoreEmptyLines: opts.namedArgs.ignoreEmptyLines
	});
	console.log(chalk.blueBright(`\t${lines} lines.`));
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

countlines.run(process.argv);