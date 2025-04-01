const fs = require('fs')
const path = require('path')
const console = require('console')
const process = require('process')
const governanceLimitFiles = JSON.parse(fs.readFileSync('./buildFolder/governance_limit_files.json', 'utf8'))

// Recursively get all contents from every manifest.json file In the suiteScripts folder
const getAllManifests = (dir) => {
    const manifestFiles = []
    const findManifestFiles = (dir) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                findManifestFiles(filePath)
            } else if (file === 'manifest.json') {
                manifestFiles.push(filePath)
            }
        }
    }
    findManifestFiles(dir)
    return manifestFiles
}

try {
    console.log('1/3 - Generating the dispatcher manifest...')
    const baseScriptsPath = 'FileCabinet/SuiteScripts/'
    const baseObjectsPath = 'Objects/'

    const manifestFiles = getAllManifests(baseScriptsPath)
    const manifestContents = []

    for (const manifestFile of manifestFiles) {
        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
        // Get the directory containing the manifest file
        const manifestDir = path.dirname(manifestFile)

        // For each manifest file, get the script name and path, then get the script content
        manifest.forEach((script) => {
            let scriptName = path.join(manifestDir, script.name)

            // Make sure to remove FileCabinet/SuiteScripts/ from the script name
            scriptName = scriptName.replace('FileCabinet\\SuiteScripts\\', '')

            manifestContents.push({
                ...script,
                name: scriptName,
            })
            return true
        })
    }

    // Regroup the manifest contents by record type
    const groupedByRecordType = manifestContents.reduce((acc, script) => {
        const recordType = script.recordType
        if (!acc[recordType]) {
            acc[recordType] = []
        }
        acc[recordType].push(script)
        return acc
    }, {})

    // For each record type, regroup the scripts by type
    const groupedByRecordTypeAndScriptType = Object.entries(groupedByRecordType).reduce(
        (acc, [recordType, scripts]) => {
            acc[recordType] = scripts.reduce((typeAcc, script) => {
                const scriptType = script.type
                if (!typeAcc[scriptType]) {
                    typeAcc[scriptType] = []
                }
                typeAcc[scriptType].push({
                    name: script.name,
                    units: script.units,
                })
                return typeAcc
            }, {})
            return acc
        },
        {}
    )

    // Group scripts by dispatchers based on governance limits
    const groupedWithDispatchers = Object.entries(groupedByRecordTypeAndScriptType).reduce(
        (acc, [recordType, scriptTypes]) => {
            acc[recordType] = Object.entries(scriptTypes).reduce((typeAcc, [scriptType, scripts]) => {
                const governanceLimit = governanceLimitFiles[scriptType] - 100 // Subtract 100 from limit to account for a margin of error
                let currentDispatcher = []
                let currentUnits = 0
                let dispatcherIndex = 1

                typeAcc[scriptType] = scripts.reduce((dispatchers, script) => {
                    if (currentUnits + script.units > governanceLimit) {
                        // Current dispatcher is full, create new one
                        if (currentDispatcher.length > 0) {
                            dispatchers[`dispatcher${dispatcherIndex}`] = currentDispatcher
                            dispatcherIndex++
                            currentDispatcher = []
                            currentUnits = 0
                        }
                    }

                    currentDispatcher.push(script)
                    currentUnits += script.units

                    return dispatchers
                }, {})

                // Add remaining scripts to last dispatcher
                if (currentDispatcher.length > 0) {
                    typeAcc[scriptType][`dispatcher${dispatcherIndex}`] = currentDispatcher
                }

                return typeAcc
            }, {})
            return acc
        },
        {}
    )

    // Write the result to a file or process further as needed
    fs.writeFileSync('./buildFolder/dispatcher_manifest.json', JSON.stringify(groupedWithDispatchers, null, 2))

    console.log('The dispatcher manifest has been generated successfully!\n')
} catch (error) {
    console.error('Something went wrong creating deploy files: ', error)
    process.exit(1)
}
