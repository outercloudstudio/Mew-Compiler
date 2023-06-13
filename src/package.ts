import { CompilerType } from './types'
import { Token } from './token'
import { CompileContext } from './compiler'

export type Member = {
    macro: boolean,
    type: CompilerType
    add?(context: CompileContext, json: any, target: number): any
    tree?: Token[],
    additionalNameData?: (context: CompileContext) => any
}

export type Package = {
    [key: string]: Member
}