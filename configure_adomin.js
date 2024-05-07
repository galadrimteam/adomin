#!/usr/bin/env node
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const tmpDir = fs.mkdtempSync('adomin-clone-')

const COMMAND = `
cd ${tmpDir}
git clone -n --depth=1 --filter=tree:0 https://github.com/galadrimteam/adomin.git adomin-sparse > /dev/null
cd adomin-sparse
git sparse-checkout set --no-cone app/adomin > /dev/null
git checkout > /dev/null
cd ../..
mkdir -p app
cp -r ${tmpDir}/adomin-sparse/app/adomin app/adomin
rm -rf ${tmpDir}`

execSync(COMMAND, { stdio: 'inherit', shell: true })
