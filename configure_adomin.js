#!/usr/bin/env node
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const removeCms = process.argv.includes('--with-cms') === false
const tmpDir = fs.mkdtempSync('adomin-clone-')

const REMOVE_CMS_COMMAND = `rm -rf ${tmpDir}/adomin-sparse/app/adomin/cms`
const CMS_COMMAND = removeCms ? REMOVE_CMS_COMMAND : ''

const COMMAND = `
cd ${tmpDir}
git clone -n --depth=1 --filter=tree:0 https://github.com/galadrimteam/adomin.git adomin-sparse -q
cd adomin-sparse
git sparse-checkout set --no-cone app/adomin
git checkout > /dev/null 2> /dev/null
cd ../..
mkdir -p app

${CMS_COMMAND}
cp -r ${tmpDir}/adomin-sparse/app/adomin app/adomin && echo "✅ Adomin files copied into ./app/adomin"
rm -rf ${tmpDir}`

const alreadyCloned = fs.existsSync('app/adomin')

if (!alreadyCloned) {
  execSync(COMMAND, { stdio: 'inherit', shell: true })
} else {
  console.log('⏩ Adomin files already exist in ./app/adomin skipping cloning.')
}

const packageJson = fs.readFileSync('package.json', { encoding: 'utf-8' })
let packageLines = packageJson.split('\n')

const importsIndex = packageLines.findIndex((l) => l.includes('"imports":'))

if (importsIndex === -1) {
  console.error('❌ Could not find the imports section in the package.json')
  process.exit(1)
}

const ADOMIN_IMPORT_LINE = `    "#adomin/*": "./app/adomin/*.js",`

packageLines.splice(importsIndex + 1, 0, ADOMIN_IMPORT_LINE)

const newPackageJson = packageLines.join('\n')

const isPackageConfigured = packageJson.includes(`"#adomin/*":`)

if (!isPackageConfigured) {
  fs.writeFileSync('package.json', newPackageJson)
  console.log('✅ Modified ./package.json')
} else {
  console.log('⏩ package.json already configured')
}

const FULL_ADOMIN_PATH_OPTION = `"paths": {
      "#adomin/*": ["./app/adomin/*.js"]
    },`
const ADOMIN_PATH_OPTION = `      "#adomin/*": ["./app/adomin/*.js"],`

const tsconfigJson = fs.readFileSync('tsconfig.json', { encoding: 'utf-8' })

const tsconfigLines = tsconfigJson.split('\n')

const pathsIndex = tsconfigLines.findIndex((l) => l.includes('"paths":'))

if (pathsIndex === -1) {
  const fullPathIndex = tsconfigLines.findIndex((l) => l.includes(`"compilerOptions":`))

  if (fullPathIndex === -1) {
    console.error('❌ Could not find the compilerOptions section in the tsconfig.json')
    process.exit(1)
  }

  tsconfigLines.splice(fullPathIndex + 1, 0, FULL_ADOMIN_PATH_OPTION)
} else {
  tsconfigLines.splice(pathsIndex + 1, 0, ADOMIN_PATH_OPTION)
}

const newTsconfigJson = tsconfigLines.join('\n')

const isTsconfigConfigured = tsconfigJson.includes(`"#adomin/*":`)

if (!isTsconfigConfigured) {
  fs.writeFileSync('tsconfig.json', newTsconfigJson)
  console.log('✅ Modified ./tsconfig.json')
} else {
  console.log('⏩ tsconfig.json already configured')
}

const routesFile = fs.readFileSync('start/routes.ts', { encoding: 'utf-8' })
const routesLines = routesFile.split('\n')
const IMPORT_LINE = `import '#adomin/routes/adomin_router'`
const isRoutesConfigured = routesFile.includes('#adomin/routes/adomin_router')
const routerIndex = routesLines.findIndex((l) => l.includes('import router from'))

if (routerIndex === -1) {
  console.error('❌ Could not find the router import in the routes.ts')
  process.exit(1)
}

routesLines.splice(routerIndex, 0, IMPORT_LINE)

if (!isRoutesConfigured) {
  fs.writeFileSync('start/routes.ts', routesLines.join('\n'))
  console.log('✅ Modified ./start/routes.ts')
} else {
  console.log('⏩ routes.ts already configured')
}

console.log('🎉 Adomin is now ready to be used in your project.')
console.log(
  '📚 next steps: https://galadrimteam.github.io/adomin/guides/installation/#backend-deps'
)
