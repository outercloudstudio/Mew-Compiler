import { Token, TokenType, match } from './token'

export class ComputedType {
    name = 'Unkown'    
}

class Integer extends ComputedType {
    name = 'Integer'
}

class Float extends ComputedType {
    name = 'Float'
}

class Void extends ComputedType {
    name = 'Void'
}

let nameTable: { [key: string]: ComputedType } = {}

type ValidationError = {
    message: string,
    lines: number[],
    character: number[]
}

const validationRules: Map<TokenType, (token: Token) => ValidationError | null> = new Map()
const computeRules: Map<TokenType, (token: Token) => void> = new Map()

validationRules.set(TokenType.Definition, token => null)
computeRules.set(TokenType.Definition, token => {
    computeToken(token.content.value)
    computeToken(token.content.type)

    token.computedType = new Void()

    nameTable[token.content.name.content] = token.content.type.computedType
})

validationRules.set(TokenType.FunctionDefinition, token => null)
computeRules.set(TokenType.FunctionDefinition, token => {
    const namesOutsideOfScope = Object.keys(nameTable)
    
    computeToken(token.content.type)
    
    for(const childToken of token.content.value) {
        computeToken(childToken)
    }

    token.computedType = new Void()

    for(const name of Object.keys(nameTable)) {
        if(namesOutsideOfScope.includes(name)) continue

        delete nameTable[name]
    }
})

validationRules.set(TokenType.Assignment, token => null)
computeRules.set(TokenType.Assignment, token => {
    computeToken(token.content.value)

    token.computedType = new Void()
})

validationRules.set(TokenType.Literal, token => null)
computeRules.set(TokenType.Literal, token => {
    if(/^[0-9]+$/.test(token.content)) {
        token.computedType = new Integer()

        return
    }
})

validationRules.set(TokenType.Type, token => null)
computeRules.set(TokenType.Type, token => {
    if(match(token, 'float', TokenType.Type)) token.computedType = new Float()
    if(match(token, 'int', TokenType.Type)) token.computedType = new Integer()
    if(match(token, 'void', TokenType.Type)) token.computedType = new Void()
})

function computeToken(token: Token) {
    const validationRule = validationRules.get(token.tokenType)

    if(validationRule === undefined) return
    
    let validationError = validationRule(token)

    if(validationError !== null) throw new Error(validationError.message)
    
    const computeRule = computeRules.get(token.tokenType)

    if(computeRule === undefined) return

    computeRule(token)
}

export function compute(tree: Token[], sourceExportedNames: { [key: string]: { [key: string]: ComputedType } }): { tree: Token[], exportedNames: { [key: string]: ComputedType } } {
    nameTable = {}
    
    for(const token of tree) {
        computeToken(token)
    }
    
    return { tree: tree, exportedNames: {} }
}