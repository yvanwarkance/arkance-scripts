// The purpose of this file is just to add the content of the deployfile generated via the CI process consisting of creating dispatchers
// Into the deploy.xml file so that it can be deployed via SDF

const fs = require('fs')
const console = require('console')
const process = require('process')
const deployfile = JSON.parse(fs.readFileSync('./buildFolder/deployfile.json', 'utf8'))

const deployPathsPrep = (modifiedFilePaths) => {
    return modifiedFilePaths.map((nsFile) => {
        const extensionScriptPath = nsFile.scriptPath.split('.').pop()
        const extensionObjectPath = nsFile.objectPath.split('.').pop()
        const listModulesToLoad = nsFile.dispatcherFilesContentsPath.map((singleModuleContent) => ({
            path: `<path>~/FileCabinet/${singleModuleContent.replace('./', '')}</path>`,
            type: 'js',
        }))
        return [
            ...listModulesToLoad,
            {
                path: `<path>~/FileCabinet/${nsFile.scriptPath.replace('/', '')}</path>`,
                type: extensionScriptPath,
            },
            {
                path: `<path>~/${nsFile.objectPath.replace('./', '')}</path>`,
                type: extensionObjectPath,
            },
        ]
    })
}

const createDeployFile = async (filesToDeploy) => {
    const filesMarkup = filesToDeploy.filter((file) => file.type === 'js').map((file) => file.path)
    const objectsMarkup = filesToDeploy.filter((file) => file.type === 'xml').map((file) => file.path)
    const deployContent = `<deploy>
    <configuration>
        <path>~/AccountConfiguration/*</path>
    </configuration>
    <files>
        ${filesMarkup.join('\n        ')}
    </files>
    <objects>
        ${objectsMarkup.join('\n       ').length > 0 ? objectsMarkup.join('\n       ') : '<path>~/Objects/*</path>'}
    </objects>
    <translationimports>
        <path>~/Translations/*</path>
    </translationimports>
</deploy>`

    try {
        // create the deploy.xml file
        fs.writeFileSync('deploy.xml', deployContent, 'utf8')
        console.log('deploy.xml file created successfully')
    } catch (err) {
        console.error('Error creating deploy file:', err)
        throw err
    }
}

let filesToDeploy = []

try {
    console.log('3/3 - Generating the deploy.xml file...')

    // if the deploy.xml file exists, remove it first before creating a new one if necessary
    if (fs.existsSync('deploy.xml')) {
        fs.unlinkSync('deploy.xml')
    }

    filesToDeploy = deployPathsPrep(deployfile)
    const flattenedFilesToDeploy = filesToDeploy.flat()

    if (!flattenedFilesToDeploy.length) {
        console.log('No objects to deploy, abandoning...')
        process.exit(0)
    }

    createDeployFile(flattenedFilesToDeploy)
} catch (err) {
    console.error('Something went wrong creating deploy files: ', err)
    process.exit(1)
}
