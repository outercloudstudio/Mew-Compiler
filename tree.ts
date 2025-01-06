import { Token, TokenType, matchType, match, returnsValue, combineRange } from './token'

let DEBUG = false

const tokenClassificationRules: Map<(token: Token) => boolean, TokenType> = new Map()

function contentMatchRule(matches: string[], condition: (token: Token) => boolean): (token: Token) => boolean {
    return (token: Token) => {
        if (!condition(token)) return false

        return matches.includes(token.content)
    }
}

tokenClassificationRules.set(contentMatchRule([
    'use',
    'sprite',
    'if',
    'costume',
    'backdrop',
    'global',
    'forever',
    'return',
], token => token.tokenType === TokenType.Unkown), TokenType.Keyword)
tokenClassificationRules.set(token => /^[0-9]+$/.test(token.content) && token.tokenType === TokenType.Unkown, TokenType.Number)
tokenClassificationRules.set(contentMatchRule(['true', 'false'], token => token.tokenType === TokenType.Unkown), TokenType.Boolean)
tokenClassificationRules.set(contentMatchRule(['int', 'float', 'string', 'void', 'bool'], token => token.tokenType === TokenType.Unkown), TokenType.Type)
tokenClassificationRules.set(contentMatchRule(['&', '|', '<', '=', '>', '+', '-', '+', '/', '*', '%'], token => token.tokenType === TokenType.Symbol), TokenType.Operator) // make ignore unkown check
tokenClassificationRules.set(token => token.tokenType === TokenType.Unkown, TokenType.Name)

function classifyTokens(tokens: Token[]) {
    for (const token of tokens) {
        for (const [rule, tokenType] of tokenClassificationRules.entries()) {
            if (!rule(token)) continue

            token.tokenType = tokenType

            break
        }
    }
}

function buildCommands(rootTokens: Token[]) {
    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!match(tokens[index], 'use', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.String)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 2, {
                tokenType: TokenType.Use,
                content: tokens[index + 1],
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )

    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!match(tokens[index], 'sprite', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.String)) return false 

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 2, {
                tokenType: TokenType.Sprite,
                content: tokens[index + 1],
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )

    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!match(tokens[index], 'backdrop', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.String)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 2, {
                tokenType: TokenType.Backdrop,
                content: tokens[index + 1],
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )

    build(
        (index, tokens) => {
            if(index >= tokens.length - 5) return false

            if(!match(tokens[index], 'costume', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.String)) return false
            if(!match(tokens[index + 2], ',', TokenType.Symbol)) return false
            if(!matchType(tokens[index + 3], TokenType.Number)) return false
            if(!match(tokens[index + 4], ',', TokenType.Symbol)) return false
            if(!matchType(tokens[index + 5], TokenType.Number)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 6, {
                tokenType: TokenType.Costume,
                content: {
                    path: tokens[index + 1],
                    x: tokens[index + 3],
                    y: tokens[index + 5],
                },
                ...combineRange(tokens[index], tokens[index + 5])
            })
        },
        rootTokens
    )
}

function buildNumbers(tokens: Token[]) {
    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
        if (
            tokenIndex < tokens.length - 2
            && matchType(tokens[tokenIndex], TokenType.Number)
            && /^[0-9]+$/.test(tokens[tokenIndex].content)
            && match(tokens[tokenIndex + 1], '.', TokenType.Symbol)
            && matchType(tokens[tokenIndex + 2], TokenType.Number)
            && /^[0-9]+$/.test(tokens[tokenIndex + 2].content)
        ) tokens.splice(tokenIndex, 3, {
            content: tokens.slice(tokenIndex, tokenIndex + 3).map(token => token.content).join(''),
            tokenType: TokenType.Number,
            ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 2])
        })
    }
}

function buildMultiSymbolOperators(tokens: Token[]) {
    const symbols = [
        '&&',
        '||',
        '<=',
        '>=',
        '*=',
        '+=',
        '==',
        '!=',
        '/=',
        '*=',
        '++',
        '--'
    ]

    for (let tokenIndex = 0; tokenIndex < tokens.length - 1; tokenIndex++) {
        if (matchType(tokens[tokenIndex], TokenType.Operator)
            && matchType(tokens[tokenIndex + 1], TokenType.Operator)
            && symbols.includes(tokens[tokenIndex].content + tokens[tokenIndex + 1].content)) {
            const newOperator = tokens[tokenIndex].content + tokens[tokenIndex + 1].content

            tokens.splice(tokenIndex, 2, {
                content: newOperator,
                tokenType: TokenType.Operator,
                ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
            })
        }
    }
}

function build(condition: (index: number, tokens: Token[]) => boolean, transform: (index: number, tokens: Token[]) => void, tokens: Token[]) {
    for (let index = 0; index < tokens.length; index++) {
        if (!condition(index, tokens)) {
            const originalTokenType = tokens[index].tokenType
            
            if (tokens[index].tokenType === TokenType.Group) {
                for(const group of tokens[index].content) build(condition, transform, group)
            }

            if (tokens[index].tokenType === TokenType.Call) {
                for(const parameter of tokens[index].content.parameters) build(condition, transform, parameter)
            }
            
            if (tokens[index].tokenType === TokenType.Block) build(condition, transform, tokens[index].content)

            if (tokens[index].tokenType === TokenType.FunctionDefinition) build(condition, transform, tokens[index].content.value)

            if (tokens[index].tokenType === TokenType.Operation) {
                for(let valueIndex = 0; valueIndex < tokens[index].content.values.length; valueIndex++) {
                    const valueGroup = [tokens[index].content.values[valueIndex]]
                    build(condition, transform, valueGroup)

                    tokens[index].content.values[valueIndex] = valueGroup[0]
                }
            }

            if(originalTokenType !== tokens[index].tokenType) index--

            continue
        }

        transform(index, tokens)

        index--
    }
}

function buildGroups(tokens: Token[]) {
    const indexStack = []

    for (let index = 0; index < tokens.length; index++) {
        if (match(tokens[index], '(', TokenType.Symbol)) {
            indexStack.push(index)
        }

        if (match(tokens[index], ')', TokenType.Symbol) && indexStack.length > 0) {
            const openGroupIndex = indexStack[indexStack.length - 1]

            const ungroupedContent = tokens.slice(openGroupIndex + 1, index)
            const groupedContent = []

            let groupStartIndex = 0
            for(let groupIndex = 0; groupIndex < ungroupedContent.length; groupIndex++) {
                if (!match(ungroupedContent[groupIndex], ',', TokenType.Symbol)) continue
                groupedContent.push(ungroupedContent.slice(groupStartIndex, groupIndex))
                
                groupStartIndex = groupIndex + 1
            }

            groupedContent.push(ungroupedContent.slice(groupStartIndex, ungroupedContent.length))

            tokens.splice(openGroupIndex, index - openGroupIndex + 1, {
                content: groupedContent,
                tokenType: TokenType.Group,
                ...combineRange(tokens[openGroupIndex], tokens[index])
            })

            index = openGroupIndex

            indexStack.pop()
        }
    }
}

function twoSidedOperationCondition(operationSymbols: string[]): (tokenIndex: number, tokens: Token[]) => boolean {
    return (tokenIndex: number, tokens: Token[]) => {
        if (tokenIndex >= tokens.length - 2) return false

        let found = false
        for (const operationSymbol of operationSymbols) {
            if (!match(tokens[tokenIndex + 1], operationSymbol, TokenType.Operator)) continue

            found = true
        }

        if (!found) return false

        if (!returnsValue(tokens[tokenIndex])) return false
        if (!returnsValue(tokens[tokenIndex + 2])) return false

        return true
    }
}

function twoSidedOperationBuilder(): (tokenIndex: number, tokens: Token[]) => void {
    return (tokenIndex: number, tokens: Token[]) => tokens.splice(tokenIndex, 3, {
        content: {
            operation: tokens[tokenIndex + 1],
            values: [
                tokens[tokenIndex],
                tokens[tokenIndex + 2]
            ]
        },
        tokenType: TokenType.Operation,
        ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 2])
    })
}

function buildOperations(tokens: Token[]) {
    build(
        (tokenIndex: number, tokens: Token[]) => {
            if (tokenIndex >= tokens.length - 1) return false

            if(tokens[tokenIndex + 1].tokenType !== TokenType.Operator) return false
            
            if(!['++', '--'].includes(tokens[tokenIndex + 1].content)) return false

            if (!matchType(tokens[tokenIndex], TokenType.Name)) return false

            return true
        },
        (tokenIndex: number, tokens: Token[]) => tokens.splice(tokenIndex, 2, {
            content: {
                operation: tokens[tokenIndex + 1],
                values: [
                    tokens[tokenIndex]
                ]
            },
            tokenType: TokenType.Operation,
            ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
        }),
        tokens
    )

    build(
        (tokenIndex: number, tokens: Token[]) => {
            if (tokenIndex >= tokens.length - 2) return false

            if(tokens[tokenIndex + 1].tokenType !== TokenType.Operator) return false

            if(!['+=', '-=', '*=', '/='].includes(tokens[tokenIndex + 1].content)) return false

            if (!matchType(tokens[tokenIndex], TokenType.Name)) return false

            if (!returnsValue(tokens[tokenIndex + 2])) return false

            return true
        },
        (tokenIndex: number, tokens: Token[]) => tokens.splice(tokenIndex, 3, {
            content: {
                operation: tokens[tokenIndex + 1],
                values: [
                    tokens[tokenIndex],
                    tokens[tokenIndex + 2],
                ]
            },
            tokenType: TokenType.Operation,
            ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 2])
        }),
        tokens
    )
    
    build(twoSidedOperationCondition(['*', '/']), twoSidedOperationBuilder(), tokens)

    build(twoSidedOperationCondition(['+', '-', '%']), twoSidedOperationBuilder(), tokens)
    
    build(
        (tokenIndex: number, tokens: Token[]) => {
          if (tokenIndex >= tokens.length - 1) return false

          if (!match(tokens[tokenIndex], '-', TokenType.Operator)) return false

          if (!returnsValue(tokens[tokenIndex + 1])) return false

          return true
        },
        (tokenIndex: number, tokens: Token[]) => tokens.splice(tokenIndex, 2, {
            content: {
                operation: tokens[tokenIndex],
                values: [
                    {
                        content: 0,
                        tokenType: TokenType.Number,
                        ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
                    },
                    tokens[tokenIndex + 1]
                ]
            },
            tokenType: TokenType.Operation,
            ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
        }),
        tokens
    )

    build(twoSidedOperationCondition(['<', '>', '<=', '>=']), twoSidedOperationBuilder(), tokens)

    build(
        (tokenIndex: number, tokens: Token[]) => {
          if (tokenIndex >= tokens.length - 1) return false

          if (!match(tokens[tokenIndex], '!', TokenType.Operator)) return false

          if (!returnsValue(tokens[tokenIndex + 1])) return false

          return true
        },
        (tokenIndex: number, tokens: Token[]) => tokens.splice(tokenIndex, 2, {
            content: {
                operation: tokens[tokenIndex],
                values: [
                    {
                        content: 0,
                        tokenType: TokenType.Number,
                        ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
                    },
                    tokens[tokenIndex + 1]
                ]
            },
            tokenType: TokenType.Operation,
            ...combineRange(tokens[tokenIndex], tokens[tokenIndex + 1])
        }),
        tokens
    )

    build(twoSidedOperationCondition(['!=', '==']), twoSidedOperationBuilder(), tokens)

    build(twoSidedOperationCondition(['&&']), twoSidedOperationBuilder(), tokens)
    
    build(twoSidedOperationCondition(['||']), twoSidedOperationBuilder(), tokens)
}

function buildAssignments(rootTokens: Token[]) {
    build(
        (index, tokens) => {
            if(index >= tokens.length - 2) return false

            if(!matchType(tokens[index], TokenType.Name)) return false
            if(!match(tokens[index + 1], '=', TokenType.Operator)) return false
            if(!returnsValue(tokens[index + 2])) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 3, {
                tokenType: TokenType.Assignment,
                content: {
                    name: tokens[index],
                    value: tokens[index + 2]
                },
                ...combineRange(tokens[index], tokens[index + 2])
            })
        },
        rootTokens
    )
}

function buildBlocks(tokens: Token[]) {
    const indexStack = []

    for (let index = 0; index < tokens.length; index++) {
        if (match(tokens[index], '{', TokenType.Symbol)) {
            indexStack.push(index)
        }

        if (match(tokens[index], '}', TokenType.Symbol) && indexStack.length > 0) {
            const openGroupIndex = indexStack.pop()

            if(!openGroupIndex) continue
            
            tokens.splice(openGroupIndex, index - openGroupIndex + 1, {
                content: tokens.slice(openGroupIndex + 1, index),
                tokenType: TokenType.Block,
                ...combineRange(tokens[openGroupIndex], tokens[index])
            })

            index = openGroupIndex
        }
    }
}

function buildDefinitions(rootTokens: Token[]) {
    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!matchType(tokens[index], TokenType.Type)) return false
            if(!matchType(tokens[index + 1], TokenType.Assignment)) return false

            return true    
        },
        (index, tokens) => {            
            tokens.splice(index, 2, {
                tokenType: TokenType.Definition,
                content: {
                    type: tokens[index],
                    name: tokens[index + 1].content.name,
                    value: tokens[index + 1].content.value,
                    modifiers: [],
                },
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )

     build(
        (index, tokens) => {
            if(index >= tokens.length - 3) return false

            if(!matchType(tokens[index], TokenType.Type)) return false
            if(!matchType(tokens[index + 1], TokenType.Name)) return false
            if(!matchType(tokens[index + 2], TokenType.Group)) return false
            if(!matchType(tokens[index + 3], TokenType.Block)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 4, {
                tokenType: TokenType.FunctionDefinition,
                content: {
                    type: tokens[index],
                    name: tokens[index + 1],
                    parameters: tokens[index + 2].content,
                    value: tokens[index + 3].content,
                    modifiers: [],
                },
                ...combineRange(tokens[index], tokens[index + 3])
            })
        },
        rootTokens
    )

    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!match(tokens[index], 'global', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.Definition)) return false

            return true    
        },
        (index, tokens) => {            
            tokens.splice(index, 2, {
                tokenType: TokenType.Definition,
                content: {
                    type: tokens[index + 1].content.type,
                    name: tokens[index + 1].content.name,
                    value: tokens[index + 1].content.value,
                    modifiers: [
                        tokens[index],
                        ...tokens[index + 1].content.modifiers
                    ]
                },
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )
}

function buildControls(rootTokens: Token[]) {
    build(
        (index, tokens) => {
            if(index > tokens.length - 2) return false

            if(!match(tokens[index], 'return', TokenType.Keyword)) return false
            if(!returnsValue(tokens[index + 1])) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 3, {
                tokenType: TokenType.Return,
                content: tokens[index + 1],
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )
    
     build(
        (index, tokens) => {
            if(index >= tokens.length - 2) return false

            if(!match(tokens[index], 'if', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.Group)) return false
            if(!matchType(tokens[index + 2], TokenType.Block)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 3, {
                tokenType: TokenType.If,
                content: {
                    parameters: tokens[index + 1].content,
                    value: tokens[index + 2].content
                },
                ...combineRange(tokens[index], tokens[index + 2])
            })
        },
        rootTokens
    )

    build(
        (index, tokens) => {
            if(index > tokens.length - 2) return false

            if(!match(tokens[index + 0], 'forever', TokenType.Keyword)) return false
            if(!matchType(tokens[index + 1], TokenType.Block)) return false

            return true    
        },
        (index, tokens) => {
            tokens.splice(index, 2, {
                tokenType: TokenType.Forever,
                content: tokens[index + 1].content,
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )
}

function buildCalls(rootTokens: Token[]) {
    build(
        (index, tokens) => {
            if(index >= tokens.length - 1) return false

            if(!matchType(tokens[index], TokenType.Name)) return false
            if(!matchType(tokens[index + 1], TokenType.Group)) return false

            return true
        },
        (index, tokens) => {            
            tokens.splice(index, 2, {
                tokenType: TokenType.Call,
                content: {
                    name: tokens[index].content,
                    parameters: tokens[index + 1].content,
                },
                ...combineRange(tokens[index], tokens[index + 1])
            })
        },
        rootTokens
    )
}

export function buildTree(tokens: Token[]): Token[] {
    classifyTokens(tokens)
    
    buildCommands(tokens)
    buildNumbers(tokens)
    buildMultiSymbolOperators(tokens)
    
    buildGroups(tokens)
    buildBlocks(tokens)
    buildCalls(tokens)

    buildOperations(tokens)
    
    buildAssignments(tokens)
    buildDefinitions(tokens)
    buildControls(tokens)

    return tokens
}