import { ComputedType } from './compute'

export enum TokenType {
    WhiteSpace = 'White Space',
    Seperator = 'Seperator',
    Symbol = 'Symbol',
    String = 'String',
    Unkown = 'Unkown',

    Keyword = 'Keyword',
    Control = 'Control',
    Type = 'Type',
    Operator = 'Operator',
    Number = 'Number',
    Boolean = 'Boolean',
    Name = 'Name',

    Operation = 'Operation',
    Group = 'Group',
    Assignment = 'Assignment',
    Definition = 'Definition',
    FunctionDefinition = 'Function Definition',
    Block = 'Block',
    Use = 'Use',
    Sprite = 'Sprite',
    Backdrop = 'Backdrop',
    Costume = 'Costume',
    If = 'If',
    Call = 'Call',
    Forever = 'Forever',
    Return = 'Return',
}

export function returnsValue(token: Token): boolean {
    return [
        TokenType.Number,
        TokenType.Boolean,
        TokenType.String,
        TokenType.Name,
        TokenType.Operation,
        TokenType.Group,
        TokenType.Call
    ].includes(token.tokenType)
}

const tokenRules: { [key: string]: TokenType } = {}

function registerTokenType(tokens: string[], tokenType: TokenType) {
    for(const key of tokens) {
        tokenRules[key] = tokenType
    }
}

registerTokenType([ ' ', '\t' ], TokenType.WhiteSpace)
registerTokenType([ '\n', '\r', ';' ], TokenType.Seperator)
registerTokenType([ '+', '-', '/', '*', '=', '(', ')', ',', '"' , '<', '>', '{', '}', '&', '|', '.', '%'], TokenType.Symbol)

export type Token = {
    content: any
    tokenType: TokenType
    lines: number[]
    characters: number[],
    computedType?: ComputedType
}

export function tokenize(code: string): Token[] {
    let tokens: Token[] = []

    let line = 1
    let character = 1

    for(let characterIndex = 0; characterIndex < code.length; characterIndex++) {
        const currentCharacter = code[characterIndex]
        
        if(tokenRules[currentCharacter] === TokenType.WhiteSpace) {
            if(characterIndex !== 0) tokens.push({
                content: code.substring(0, characterIndex),
                tokenType: TokenType.Unkown,
                lines: [line, line],
                characters: [character, character + characterIndex - 1]
            })

            tokens.push({
                content: code[characterIndex],
                tokenType: TokenType.WhiteSpace,
                lines: [line, line],
                characters: [character + characterIndex, character + characterIndex]
            })

            code = code.substring(characterIndex + 1)

            character += characterIndex + 1

            characterIndex = -1

            continue
        }

        if(tokenRules[currentCharacter] === TokenType.Seperator) {
            if(characterIndex !== 0) tokens.push({
                content: code.substring(0, characterIndex),
                tokenType: TokenType.Unkown,
                lines: [line, line],
                characters: [character, character + characterIndex - 1]
            })

            tokens.push({
                content: code[characterIndex],
                tokenType: TokenType.Seperator,
                lines: [line, line],
                characters: [character + characterIndex, character + characterIndex]
            })

            line++
            
            code = code.substring(characterIndex + 1)

            character = 1

            characterIndex = -1

            continue
        }

        if(tokenRules[currentCharacter] === TokenType.Symbol) {
            if(characterIndex !== 0) tokens.push({
                content: code.substring(0, characterIndex),
                tokenType: TokenType.Unkown,
                lines: [line, line],
                characters: [character, character + characterIndex - 1]
            })

            tokens.push({
                content: code[characterIndex],
                tokenType: TokenType.Symbol,
                lines: [line, line],
                characters: [character + characterIndex, character + characterIndex]
            })

            code = code.substring(characterIndex + 1)

            character += characterIndex + 1

            characterIndex = -1

            continue
        }
    }

    if(code.length > 0) {
        tokens.push({
            content: code,
            tokenType: TokenType.Unkown,
            lines: [line, line],
            characters: [character, character + code.length - 1]
        })
    }

    buildStringLiterals(tokens)

    tokens = tokens.filter(token => ![TokenType.WhiteSpace, TokenType.Seperator].includes(token.tokenType))

    return tokens
}

function buildStringLiterals(tokens: Token[]) {
    let inString = false
    let openStringIndex = -1

    for(let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
        const token = tokens[tokenIndex]

        if(!match(token, '"', TokenType.Symbol)) continue
        
        if(inString) {
            const tokensToCombine = tokens.slice(openStringIndex + 1, tokenIndex)
            const openStringToken = tokens[openStringIndex]
            const closeStringToken = tokens[tokenIndex]
            
            tokens.splice(
                openStringIndex,
                tokenIndex - openStringIndex + 1, 
                {
                    content: tokensToCombine.map(token => token.content).join(''),
                    tokenType: TokenType.String,
                    lines: [
                        openStringToken.lines[0],
                        closeStringToken.lines[1]
                    ],
                    characters: [
                        openStringToken.characters[0], 
                        closeStringToken.characters[1]
                    ],
                }
            )

            inString = false

            tokenIndex = openStringIndex
        } else {
            openStringIndex = tokenIndex
            inString = true
        }
    }
}

export function matchType(token: Token, tokenType: TokenType): boolean {
    return token.tokenType === tokenType
}

export function matchTokens(token: Token, otherToken: Token): boolean {
    return token.tokenType === otherToken.tokenType && token.content === otherToken.content
}

export function match(token: Token, content: any, tokenType: TokenType): boolean {
    return token.content === content && token.tokenType === tokenType 
}

export function combineRange(token: Token, otherToken: Token): { lines: number[], characters: number[] } {
    return {
        lines: [ token.lines[0], otherToken.lines[1] ],
        characters: [ token.characters[0], otherToken.characters[1] ]
    }
}