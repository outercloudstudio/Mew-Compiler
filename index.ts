import { compile } from './compile'
import * as fs from 'fs'
import * as archiver from 'archiver'

// const compiledProject = compile({
//     'project.mew': `
// backdrop "backdrop.svg"
// sprite "bird.mew"
// sprite "pipe.mew"
// `,
//     'bird.mew': `
// costume "cat.svg", 50, 50

// goTo(-100, 0)

// float velocity = 10

// forever {
//     if(touching("pipe.mew")) {
//         goTo(-100, 0)

//         if(getX() <= -100) {
//             goTo(100, 0)
//         }
        
//         velocity = 0
//     }

//     if(keyPressed("space")) {
//         velocity = 10
//     }

//     changeY(velocity)

//     velocity = velocity - 1
// }
// `,
//     'pipe.mew': `
//     costume "pipe.svg", 50, 240

//     forever {
//         changeX(-10)

//         if(getX() < -200) {
//             goTo(240, 0)
//         }
//     }
//     `
// })

const compiledProject = compile({
    'project.mew': `
    backdrop "backdrop.svg"
    sprite "bird.mew"
    `,
    'bird.mew': `
    costume "cat.svg", 50, 50

    int counter = 0

    forever {
        counter += 1
    }
    `
})

function exists(path: string) {
    try {
        fs.accessSync(path)
    } catch(error) {
        return false
    }

    return true
}

if(!exists('playground')) fs.mkdirSync('playground')
if(exists('playground/build')) fs.rmSync('playground/build', { recursive: true })
fs.mkdirSync('playground/build')

Bun.write('playground/build/project.json', JSON.stringify(compiledProject.project))

const outputZipFile = fs.createWriteStream('playground/build.sb3')
const archive = archiver.create('zip', {
    zlib: { level: 9 }
})
archive.pipe(outputZipFile)

archive.append(JSON.stringify(compiledProject.project), { name: 'project.json' })

for(const [outputPath, path] of Object.entries(compiledProject.filesToCopy)) {
    archive.append(fs.createReadStream('playground/' + path), { name: outputPath })
}

archive.finalize()

// const hasher = Bun.CryptoHasher("md5")
// hasher.update("project")
// hasher.digest("hex")

// const writeStream = fs.createWriteStream('playground/build/' + outputPath)
// fs.createReadStream('playground/' + path).pipe(writeStream)