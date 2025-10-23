//import * as fs from "fs";
import * as toml from "toml";
//import * as process from "process";
//export const conf;
/* const fs = require('fs');
const process = require('process');
const toml = require('toml'); */
//export {get};

//export function get(){
//const tomlFileString = fs.readFileSync(process.argv[2], "utf-8");
//const tomlFileString = await fetch("check.toml");
// this kicks off the fetch immediately, and gives you back a Promise<Config>
const qs = Object.fromEntries(new URLSearchParams(location.search));
console.log(qs);

export const confP = fetch(`${qs["baseurl"]}WebRTCInfo/?session=${qs["session"]}`, { cache: 'no-store' })
  .then(res => res.text())
  .then(txt => {console.log(`GOT TOML: ${txt}`); return toml.parse(txt)});

//export const conf = toml.parse(tomlFileString);
console.log(confP);
//}
