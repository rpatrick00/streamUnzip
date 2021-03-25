const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const fetch = require('node-fetch');
const unzip = require('unzip-stream');

async function main() {
  const url = 'https://github.com/oracle/weblogic-deploy-tooling/releases/download/release-1.9.10/weblogic-deploy.zip';
  const outputDir = path.join(__dirname, 'tools');
  const directoryToDelete = path.join(outputDir, 'weblogic-deploy');

  return new Promise((resolve, reject) => {
    resetOutputDirectory(outputDir, directoryToDelete)
      .then(() => {
        installZipFile(url, outputDir)
          .then(() => {
            resolve('WebLogic Deploy Tooling installed successfully');
          })
          .catch(err => reject(`Failed to install WebLogic Deploy Tooling: ${err}`));
      })
      .catch(err => reject(`Failed to reset output directory ${outputDir}: ${err}`));
  });
}

async function resetOutputDirectory(outputDir, dirToDelete) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fsPromises.mkdir(outputDir, {
          recursive: true
        })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        })
    } else if (fs.existsSync(dirToDelete)) {
      rmdirIfExists(dirToDelete)
        .then(() => resolve())
        .catch(err => reject(err));
    } else {
      resolve();
    }
  });
}

async function rmdirIfExists(directory) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(directory)) {
      fsPromises.rm(directory, {
          force: true,
          recursive: true
        })
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        })
    } else {
      resolve();
    }
  });
}

async function installZipFile(url, outputDir) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => {
        res.body.addListener('close', () => resolve());
        res.body.pipe(unzip.Extract({ path: outputDir }));
      })
      .catch(err => reject(err));
  });
}

main()
  .then(msg => console.log(msg))
  .catch(err => console.error(err));
