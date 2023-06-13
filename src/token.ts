import { CompilerType } from './types'
import { Input } from './block'

export type Token = {
    content: any,
    type: string,
    computedType?: CompilerType
    lines: {
        start: number,
        end: number
    }
    columns: {
        start: number,
        end: number
    }
}

export function matchToken(token: Token, type: string, content: string) {
    return token.type == type && token.content == content
}

export function matchType(token: Token, type: string) {
    return token.type == type
}

export function returnsValue(token: Token) {
    if(matchToken(token, 'type', 'void')) return true

    return [
        'bool',
        'float',
        'string',
        'name',
        'int',
        'operation',
        'group',
        'array',
        'void',
        'call'
    ].includes(token.type)
}

export function runInContexts(func: Function, tokens: Token[] | Token, context?: string) {
    if(Array.isArray(tokens)){
        for (let i = 0; i < tokens.length; i++) {
            if (matchType(tokens[i], 'block')) {
                tokens[i].content.content = runInContexts(func, tokens[i].content.content, 'block')

                for(let paramIndex = 0; paramIndex < tokens[i].content.params.length; paramIndex++) {
                    tokens[i].content.params[paramIndex] = runInContexts(func, tokens[i].content.params[paramIndex], 'block param')
                }
            } else if (matchType(tokens[i], 'call')) {
                for(let j = 0; j < tokens[i].content.params.length; j++){
                    tokens[i].content.params[j] = runInContexts(func, tokens[i].content.params[j], 'call')
                }
            } else if (matchType(tokens[i], 'group')) {
                tokens[i].content = runInContexts(func, tokens[i].content, 'group')
            } else if (matchType(tokens[i], 'operation') && tokens[i].content.operator == '[]') {
                tokens[i].content.values[1] = runInContexts(func, tokens[i].content.values[1], 'indexer')
            } else if (matchType(tokens[i], 'array')) {
                for(let j = 0; j < tokens[i].content.length; j++){
                    tokens[i].content[j] = runInContexts(func, tokens[i].content[j], 'array')
                }
            } else if (matchType(tokens[i], 'definition') && matchToken(tokens[i].content.word, 'descriptor', 'function')) {
                tokens[i].content.value.content.content = runInContexts(func, tokens[i].content.value.content.content, 'function')
            } else if (matchType(tokens[i], 'if')) {
                tokens[i].content = runInContexts(func, tokens[i].content, 'if')
            }  else if (matchType(tokens[i], 'while')) {
                tokens[i].content = runInContexts(func, tokens[i].content, 'while')
            }  else if (matchType(tokens[i], 'for')) {
                tokens[i].content = runInContexts(func, tokens[i].content, 'for')
            }
        }
    } else {
        if (matchType(tokens, 'block')) {
            tokens.content.content = runInContexts(func, tokens.content.content, 'block')
        }
    }

    tokens = func(tokens, context || 'global')

    return tokens
}