const fs = require('fs')
const path = require('path')
const console = require('console')
const process = require('process')
const currentFolderPath = './buildFolder/'
const dispatcherManifest = JSON.parse(fs.readFileSync(`${currentFolderPath}dispatcher_manifest.json`, 'utf8'))
const entrypointsFolderFiles = JSON.parse(fs.readFileSync(`${currentFolderPath}entrypoints_folderfiles.json`, 'utf8'))

// Custom function that truncates the text to the 40 characters limit
const truncateText = (text, limit = 40) => {
    return text.length > limit ? text.substring(0, limit) : text
}

// Create dynamically dispatcher files and host the endpoints from each files into them
try {
    console.log('2/3 - Generating dispatchers files...')

    const dispatcherFiles = []
    const basePath = './FileCabinet/SuiteScripts'
    const basePathOutputFolder = `${basePath}/Codes/Scripts/Records`

    // Iterate over each record type in the manifest to determine with dispatcher files needs to be created
    Object.entries(dispatcherManifest).forEach(([recordType, scriptTypes]) => {
        // The key is the record type, the value is the script types
        Object.entries(scriptTypes).forEach(([scriptType, dispatchers]) => {
            // Map first the script type to the correct script type folder
            const matchingScriptTypeFolder = entrypointsFolderFiles.find(
                (singleEntryPoint) => singleEntryPoint.type === scriptType
            )

            // Then we need to build the path for creating each dispatcher file
            Object.entries(dispatchers).forEach(([dispatcher, dispatcherContent]) => {
                const singleDispatcher = {
                    path: `${basePathOutputFolder}/${recordType}/${matchingScriptTypeFolder.folderName}/${matchingScriptTypeFolder.fileNomenclature}_${recordType.substring(0, 3)}_${dispatcher}`,
                    dispatcherContent: dispatcherContent,
                    recordType: recordType,
                    scriptType: scriptType,
                    version: '2.1',
                }
                dispatcherFiles.push(singleDispatcher)
            })
        })
    })

    // Iterate over each dispatcherFile and prepare the headers and body to be written into the file
    const dispatchersData = []
    dispatcherFiles.forEach((singleDispatcher) => {
        const dispatcherHeaderPaths = []
        const dispatcherBodyFunctions = []
        const dispatcherFilesContentsPath = []

        // At the dispatcher level, we need to intelligently scan for the dispatcher contents
        // To get the headers & the entry points to be added into the dispatcher
        for (const singleDispatcherContent of singleDispatcher.dispatcherContent) {
            let singleDispatcherContentPath = singleDispatcherContent.name
            const unitsDispatcherContent = singleDispatcherContent.units
            const tableSingleDispatcherContent = singleDispatcherContent.name.split('\\')
            let singleDispatcherContentModuleName = tableSingleDispatcherContent[
                tableSingleDispatcherContent.length - 1
            ].replace('.js', '')
            if (singleDispatcherContent.name.includes('Codes\\')) {
                singleDispatcherContentPath = '../../../../' + singleDispatcherContentPath.replace('Codes\\', '')
            } else {
                singleDispatcherContentPath = '../../../../../' + singleDispatcherContentPath
            }

            // Access through the contents
            const singleDispatcherContentFile = fs.readFileSync(`${basePath}/${singleDispatcherContent.name}`, 'utf8')

            // Then try to look up the content of that file, append the entrypoints that have been declared in that content
            // In the list of dipatcherBodyFunctions
            const availableEntryPointForScriptType = entrypointsFolderFiles.filter(
                (singleEntryPoint) => singleEntryPoint.type === singleDispatcher.scriptType
            )

            // List for entry points and append them (If any) in the dispatcherBodyFunctions array
            for (const singleEntryPoint of availableEntryPointForScriptType[0].entrypoints) {
                if (singleDispatcherContentFile.includes(singleEntryPoint)) {
                    dispatcherBodyFunctions.push(singleEntryPoint)
                }
            }

            // Append the path to the dispatcherHeaderPaths array
            // Buf if the headerModuleName already exists, we need to append the moduleName with the index number
            if (
                dispatcherHeaderPaths.find(
                    (singleDispatcherHeaderPath) =>
                        singleDispatcherHeaderPath.headerModuleName === singleDispatcherContentModuleName
                )
            ) {
                throw new Error(`
                    The file name ${singleDispatcherContentModuleName} already exists in the dispatcherHeaderPaths array
                    Please change the name of the file to avoid conflicts when compiling
                `)
            }

            // Get as well the absolute path of the files (Relative to the SuiteScripts folder)
            const headerAbsolutePath = `./SuiteScripts/${singleDispatcherContent.name.replace(/\\/g, '/')}`

            dispatcherHeaderPaths.push({
                headerPath: singleDispatcherContentPath.replace(/\\/g, '/'),
                headerModuleName: singleDispatcherContentModuleName,
                headerAbsolutePath: headerAbsolutePath,
                unitsModule: unitsDispatcherContent,
            })
        }

        const isLocal = process.argv.includes('--local')

        // Remove duplicates from dispatcherBodyFunctions
        const filteredDispatcherBodyFunctions = [...new Set(dispatcherBodyFunctions)]

        // Build the dispatcher files based on the script type and the version
        let dispatcherFile = `
            /**
             * @NApiVersion ${singleDispatcher.version}
             * @NScriptType ${singleDispatcher.scriptType}
             * @NModuleScope SameAccount
             * 
             * This file has been autogenerated ${isLocal ? 'in a local CI environment' : 'in a CI environment'}
             * @governance ${dispatcherHeaderPaths.reduce((acc, singleDispatcherHeaderPath) => acc + singleDispatcherHeaderPath.unitsModule, 0)} Units
             */
            define([
                ${dispatcherHeaderPaths.map((singleDispatcherHeaderPath) => `"${singleDispatcherHeaderPath.headerPath}"`).join(',')}
            ],

            (
                ${dispatcherHeaderPaths.map((singleDispatcherHeaderPath) => singleDispatcherHeaderPath.headerModuleName).join(',')}
            ) => {
                
                // Display simply entry points detected as functions
                ${filteredDispatcherBodyFunctions
                    .map(
                        (singleDispatcherBodyFunction) =>
                            `
                    const ${singleDispatcherBodyFunction} = async (scriptContext) => {
                        try {
                            log.debug({
                                title: '${singleDispatcher.scriptType}',
                                details: {
                                    title: 'Running the ${singleDispatcherBodyFunction} entrypoint from the dispatcher file ${singleDispatcher.path}',
                                    scriptsLoaded: [${dispatcherHeaderPaths.map((singleDispatcherHeaderPath) => `"${singleDispatcherHeaderPath.headerModuleName}"`).join(', ')}],
                                    },
                            })
                            ${singleDispatcherBodyFunction === 'validateLine' || singleDispatcherBodyFunction === 'validateField' || singleDispatcherBodyFunction === 'validateDelete' || singleDispatcherBodyFunction === 'validateInsert' || singleDispatcherBodyFunction === 'saveRecord' ? `let result = true;` : ''}
                            ${dispatcherHeaderPaths
                                .map(
                                    (singleDispatcherHeaderPath) =>
                                        `
                                        if (typeof ${singleDispatcherHeaderPath.headerModuleName}.${singleDispatcherBodyFunction} === 'function') {
                                            ${singleDispatcherBodyFunction === 'validateLine' || singleDispatcherBodyFunction === 'validateField' || singleDispatcherBodyFunction === 'validateDelete' || singleDispatcherBodyFunction === 'validateInsert' || singleDispatcherBodyFunction === 'saveRecord' ? `result = result && ` : ''}await ${singleDispatcherHeaderPath.headerModuleName}.${singleDispatcherBodyFunction}(scriptContext);
                                        }`
                                )
                                .join('')}
                            ${singleDispatcherBodyFunction === 'validateLine' || singleDispatcherBodyFunction === 'validateField' || singleDispatcherBodyFunction === 'validateDelete' || singleDispatcherBodyFunction === 'validateInsert' || singleDispatcherBodyFunction === 'saveRecord' ? `return result;` : ''}
                        } catch (err) {
                            // On error catch, send message to all developpers
                            log.error({
                                title: '${singleDispatcher.scriptType}',
                                details: {
                                    title: 'Error running the ${singleDispatcherBodyFunction} entrypoint from the dispatcher file ${singleDispatcher.path}',
                                    error: err,
                                },
                            });
                        }
                    };`
                    )
                    .join('\n')}

                return {
                    ${filteredDispatcherBodyFunctions
                        .map(
                            (singleDispatcherBodyFunction, index) =>
                                `${singleDispatcherBodyFunction}: ${singleDispatcherBodyFunction}${index < filteredDispatcherBodyFunctions.length - 1 ? ',' : ''}`
                        )
                        .join('\n                    ')}
                }
            });
        `

        const finalPath = `${singleDispatcher.path}.js`

        // Append the dispatcher file to the respective path
        fs.writeFileSync(finalPath, dispatcherFile)

        // Also create the dispatcher object relative to the script type
        const baseObjectsPath = './Objects'
        const filename = singleDispatcher.path.split('/').pop()
        const scriptDeploymentId = `customdeploy${truncateText(filename.replace('ARKA', '').replace('.js', '').toLowerCase(), 20)}`
        const scriptId = `customscript${truncateText(filename.replace('ARKA', '').replace('.js', '').toLowerCase(), 25)}`

        const dispatcherObjectFile = `
            <${singleDispatcher.scriptType.toLowerCase()} 
                scriptid="${scriptId}"
            >
                <name>${filename}</name>
                <notifyowner>T</notifyowner>
                <scriptfile>[${singleDispatcher.path.replace('./FileCabinet', '')}.js]</scriptfile>
                <description>This is a ${singleDispatcher.scriptType} dispatcher for the ${singleDispatcher.recordType.toLowerCase()} record. It's purpose is to combine the scripts: ${dispatcherHeaderPaths.map((singleDispatcherHeaderPath) => singleDispatcherHeaderPath.headerModuleName).join(', ')} onto a single file for performance improvements. Please refer to each individual file to see how they works</description>
                <scriptdeployments>
                    <scriptdeployment scriptid="${scriptDeploymentId}">
                        <isdeployed>T</isdeployed>
                        <loglevel>DEBUG</loglevel>
                        <recordtype>${singleDispatcher.recordType.replace(' ', '_').toUpperCase()}</recordtype>
                        <status>RELEASED</status>
                        ${singleDispatcher.scriptType.toLowerCase() !== 'clientscript' && `<runasrole>ADMINISTRATOR</runasrole>`}
                        <allroles>T</allroles>
                    </scriptdeployment>
                </scriptdeployments>
            </${singleDispatcher.scriptType.toLowerCase()}>       
        `

        // Upload as well the dispatcher object file
        const objectPath = `${baseObjectsPath}/${singleDispatcher.recordType}/${scriptId}.xml`
        fs.writeFileSync(objectPath, dispatcherObjectFile)

        // Push the dispatcher data into the dispatchersData array
        dispatchersData.push({
            scriptPath: `${finalPath.replace('./FileCabinet', '')}`,
            objectPath: objectPath,
            recordType: singleDispatcher.recordType,
            scriptType: singleDispatcher.scriptType,
            dispatcherFilesContents: dispatcherHeaderPaths.map(
                (singleDispatcherHeaderPath) => singleDispatcherHeaderPath.headerModuleName
            ),
            dispatcherFilesContentsPath: dispatcherHeaderPaths.map(
                (singleDispatcherHeaderPath) => singleDispatcherHeaderPath.headerAbsolutePath
            ),
        })
    })

    // Create a new deploy.json file that contains the dispatcher files & objects to be deployed
    fs.writeFileSync(`${currentFolderPath}/deployfile.json`, JSON.stringify(dispatchersData, null, 2))

    // Write stats about the dispatcher files
    console.log('Summary of the dispatcher files to be uploaded:')
    for (const [index, singleDispatcher] of dispatchersData.entries()) {
        console.log(
            `- ${index + 1}/${dispatchersData.length} dispatcher file of type ${singleDispatcher.scriptType} will be uploaded for the ${singleDispatcher.recordType} record (${singleDispatcher.dispatcherFilesContents.length} file${singleDispatcher.dispatcherFilesContents.length > 1 ? 's' : ''} included)`
        )
    }
} catch (err) {
    console.error('Something went wrong creating dispatcher files: ', err)
    process.exit(1)
}
