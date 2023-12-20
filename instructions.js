const fs = require('fs-extra')
const path = require('path')

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * Instructions to be executed when setting up the package.
 */
async function instructions(projectRoot, app, sink) {
  const pathWithFilesToCopy = path.join(__dirname, 'build/templates/Adomin')
  const userAdominFiles = path.join(projectRoot, 'app/Adomin')

  const configPath = path.join(projectRoot, 'app/Adomin/config')
  const configExists = fs.existsSync(configPath)

  const tmpDir = fs.mkdtempSync('ADOMIN')
  const tmpPath = path.join(tmpDir, 'config')

  if (configExists) {
    fs.moveSync(configPath, tmpPath)
    fs.rmSync(userAdominFiles, { recursive: true, force: true })
  }

  copyDir(pathWithFilesToCopy, userAdominFiles)

  if (configExists) {
    fs.moveSync(tmpPath, configPath)
  }

  sink.logger.success('Adomin files created')
  sink.logger.info(
    'Please check https://github.com/galadrimteam/adomin#readme for configuration instructions'
  )
}

module.exports = instructions
