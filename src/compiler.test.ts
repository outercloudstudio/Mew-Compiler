import { compile } from './compiler'
import * as path from 'path'

test('Compile (Expression)', () => {
    compile(path.join(__dirname, '../test/'))
})