const fs = require('fs')
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
  const pathFrom = path.join(__dirname, 'build/templates/Adomin')
  const pathTo = path.join(projectRoot, 'app/Adomin')

  copyDir(pathFrom, pathTo)

  sink.logger.success('Adomin files created')
  sink.logger.info(
    'Please check https://github.com/galadrimteam/adomin#readme for configuration instructions'
  )
}

module.exports = instructions
