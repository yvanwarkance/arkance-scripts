const fs = require("fs");
const path = require("path");
const console = require("console");
const process = require("process");
const dispatcherManifest = JSON.parse(fs.readFileSync("./buildFolder/dispatcher_manifest.json", "utf8"));

// Loop through the dispatcherManifest and create a new object with the dispatcher name as the key and the script name and units as the value
try {
    
} catch (err){
    console.error("Something went wrong creating deploy files: ", err);
    process.exit(1);
}
