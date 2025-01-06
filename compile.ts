import { buildTree } from './tree'
import { compute, ComputedType } from './compute'
import { Token, TokenType, tokenize } from './token'
import { scanForDependencies, resolveCompilationOrder } from './dependency'
import { Stack, DefinitionBlock, AddToListBlock, SubtractBlock, ReplaceInListBlock, Block, Reference, AddBlock, ItemOfListBlock, LengthOfListBlock, IfBlock, CallBlock, EqualsBlock, RemoveFromListBlock, FlagBlock, ChangeXBlock, ChangeYBlock, ForeverBlock, WaitBlock, GoToBlock, SetVariableBlock, StopThisBlock , KeyPressedBlock, TouchingBlock, LessThanBlock, XPositionBlock, YPositionBlock, GreaterThanBlock, MultiplyBlock, DivideBlock, OrBlock, NotBlock, AndBlock, ModuloBlock } from './scratch'
import { randomUUID } from 'crypto'

interface NameLookup {
    [key: string]: {
        path: string,
        [key: string]: any
    }
}

function compileAddOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new AddBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileSubtractOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new SubtractBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileMultiplyOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new MultiplyBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileModuloOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new ModuloBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileDivideOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new DivideBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new DivideBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileLessThanOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new LessThanBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileGreaterThanOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new GreaterThanBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileEqualsOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new EqualsBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileNotEqualsOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new NotBlock(
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileNotOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new EqualsBlock(
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            ),
            'false'
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileOrOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new OrBlock(
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                'true'
            ),
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                ),
                'true'
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileAndOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new AndBlock(
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                'true'
            ),
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                ),
                'true'
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileLessThanOrEqualToOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new OrBlock(
            new LessThanBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ),
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileGreaterThanOrEqualToOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    for(const value of token.content.values) {
        stack.add(new AddToListBlock(
            'Operation Stack',
            compileExpression(stack, value, parentPath, target, names)
        ))
    }

    stack.add(new SetVariableBlock(
        'Return',
        new OrBlock(
            new GreaterThanBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ),
            new EqualsBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(new LengthOfListBlock('Operation Stack'), 1)
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            )
        )
    ))

    for(const value of token.content.values) {
        stack.add(new RemoveFromListBlock(
            'Operation Stack',
            'last'
        ))
    }

    return new Reference('Return')
}

function compileIncrementOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {   
    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new AddBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            1
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    return new Reference('Return')
}

function compileDecrementOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {   
    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new SubtractBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            1
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    return new Reference('Return')
}

function compileAddAssignmentOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    stack.add(new AddToListBlock(
        'Operation Stack',
        compileExpression(stack, token.content.values[1], parentPath, target, names)
    ))
    
    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new AddBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    stack.add(new RemoveFromListBlock(
        'Operation Stack',
        'last'
    ))

    return new Reference('Return')
}

function compileSubtractAssignmentOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    stack.add(new AddToListBlock(
        'Operation Stack',
        compileExpression(stack, token.content.values[1], parentPath, target, names)
    ))

    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new SubtractBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    stack.add(new RemoveFromListBlock(
        'Operation Stack',
        'last'
    ))

    return new Reference('Return')
}

function compileMultiplyAssignmentOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    stack.add(new AddToListBlock(
        'Operation Stack',
        compileExpression(stack, token.content.values[1], parentPath, target, names)
    ))

    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new MultiplyBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    stack.add(new RemoveFromListBlock(
        'Operation Stack',
        'last'
    ))

    return new Reference('Return')
}

function compileDivideAssignmentOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    stack.add(new AddToListBlock(
        'Operation Stack',
        compileExpression(stack, token.content.values[1], parentPath, target, names)
    ))

    const variablePath = `${names[token.content.values[0].content].path} Stack`

    stack.add(new ReplaceInListBlock(
        variablePath,
        'last',
        new DivideBlock(
            new ItemOfListBlock(
                variablePath,
                new LengthOfListBlock(variablePath)
            ),
            new ItemOfListBlock(
                'Operation Stack',
                new LengthOfListBlock('Operation Stack')
            )
        )
    ))

    stack.add(new SetVariableBlock(
        'Return',
        new ItemOfListBlock(
            variablePath,
            new LengthOfListBlock(variablePath)
        ),
    ))

    stack.add(new RemoveFromListBlock(
        'Operation Stack',
        'last'
    ))

    return new Reference('Return')
}

function compileOperation(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    if(token.content.operation.content === '+') {
        return compileAddOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '-') {
        return compileSubtractOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '*') {
        return compileMultiplyOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '/') {
        return compileDivideOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '<') {
        return compileLessThanOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '>') {
        return compileGreaterThanOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '<=') {
        return compileLessThanOrEqualToOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '>=') {
        return compileGreaterThanOrEqualToOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '==') {
        return compileEqualsOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '!=') {
        return compileNotEqualsOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '!') {
        return compileNotOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '||') {
        return compileOrOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '&&') {
        return compileAndOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '%') {
        return compileModuloOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '++') {
        return compileIncrementOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '--') {
        return compileDecrementOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '+=') {
        return compileAddAssignmentOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '-=') {
        return compileSubtractAssignmentOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '*=') {
        return compileMultiplyAssignmentOperation(stack, token, parentPath, target, names)
    }

    if(token.content.operation.content === '/=') {
        return compileDivideAssignmentOperation(stack, token, parentPath, target, names)
    }

    throw new Error('Unkown Operator ' + token.content.operation.content)
}

function compileExpression(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup): string | Block | Reference {
    if(token.tokenType === TokenType.Operation) return compileOperation(stack, token, parentPath, target, names)
    
    if(token.tokenType === TokenType.Number) return token.content

    if(token.tokenType === TokenType.Boolean) return token.content

    if(token.tokenType === TokenType.String) return token.content

    if(token.tokenType === TokenType.Name) {
        const path = names[token.content].path

        return new ItemOfListBlock(`${path} Stack`, new LengthOfListBlock(`${path} Stack`))
    }

    if(token.tokenType === TokenType.Call) {
        const path = names[token.content.name].path

        compileCall(stack, token, path, target, names)
        
        return new Reference('Return')
    }

    if(token.tokenType === TokenType.Group) return compileExpression(stack, token.content[0][0], parentPath + '/group', target, names)

    return ''
}

function compileDefinition(stack: Stack, token: Token, parentPath: string, target: any, project: any, names: NameLookup) {
    const path = `${parentPath}/${token.content.name.content}`
    
    if(token.content.modifiers.find((modifier: any) => modifier.content === 'global')) {
        project.targets[0].lists[path + ' Stack'] = [
            path + ' Stack',
            []
        ]
    } else {
        target.lists[path + ' Stack'] = [
            path + ' Stack',
            []
        ]
    }
    
    stack.add(new AddToListBlock(`${path} Stack`, 
         compileExpression(stack, token.content.value, path, target, names)
    ))

    names[token.content.name.content] = { path }
}

function compileFunctionDefinition(token: Token, parentPath: string, target: any, project: any, names: NameLookup, sources: any, filesToCopy: any) {
    const path = `${parentPath}/${token.content.name.content}`

    compileScope(token.content.value, path, target, project, names, sources, filesToCopy, {})

    names[token.content.name.content] = { path, parameters: [] }
}

function compileCall(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    const path = `${parentPath}/call ${token.lines[0]}:${token.characters[0]}`
    
    const name = names[token.content.name]

    for(let parameterIndex = 0; parameterIndex < name.parameters.length; parameterIndex++) {
        stack.add(
            new AddToListBlock(
                `${name.path}/${name.parameters[parameterIndex]} Stack`,
                compileExpression(stack, token.content.parameters[parameterIndex][0], `${path}/${name.parameters[parameterIndex]}`, target, names)
            )
        )
    }
    
   stack.add(new CallBlock(name.path))

    for(let parameterIndex = 0; parameterIndex < name.parameters.length; parameterIndex++) {
        stack.add(
            new RemoveFromListBlock(
                `${name.path}/${name.parameters[parameterIndex]} Stack`,
                'last'
            )
        )
    }
}

function compileReturn(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    const path = `${parentPath}/return ${token.lines[0]}:${token.characters[0]}`
    
    stack.add(new SetVariableBlock(
        'Return',
        compileExpression(stack, token.content, path, target, names)
    ))

    stack.add(new StopThisBlock())
}

function compileAssignment(stack: Stack, token: Token, parentPath: string, target: any, names: NameLookup) {
    const path = names[token.content.name.content].path

    stack.add(new ReplaceInListBlock(`${path} Stack`, 'last', 
        compileExpression(stack, token.content.value, path, target, names)
    ))
}

function compileIf(stack: Stack, token: Token, parentPath: string, target: any, project: any, names: NameLookup, sources: { [key: string]: Token[] }, filesToCopy: any) {
    const path = `${parentPath}/if ${token.lines[0]}:${token.characters[0]}`

    const ifBlock = stack.add(new IfBlock(
        new EqualsBlock(
            compileExpression(stack, token.content.parameters[0][0], path, target, names),
            'true'
        )
    ))

    ifBlock.stack.add(new CallBlock(path))

    compileScope(token.content.value, path, target, project, names, sources, filesToCopy, {})
}

function compileForever(stack: Stack, token: Token, parentPath: string, target: any, project: any, names: NameLookup, sources: { [key: string]: Token[] }, filesToCopy: any) {
    const path = `${parentPath}/forever ${token.lines[0]}:${token.characters[0]}`

    const foreverBlock = stack.add(new ForeverBlock())

    foreverBlock.stack.add(new CallBlock(path))

    compileScope(token.content, path, target, project, names, sources, filesToCopy, {})
}

function compileCostume(token: Token, target: any, filesToCopy: any) {
    const { path, x, y } = token.content
    
    const id = randomUUID().replaceAll('-', '')
    const format = path.content.endsWith('.png') ? 'png' : 'svg'

    target.costumes.push({
        name: path.content,
        dataFormat: format,
        assetId: id,
        md5ext: id + '.' + format,
        rotationCenterX: parseInt(x.content),
        rotationCenterY: parseInt(y.content),
    })

    filesToCopy[id + '.' + format] = path.content
}

function compileBackdrop(token: Token, target: any, filesToCopy: any) {
    const id = randomUUID().replaceAll('-', '')
    const format = token.content.content.endsWith('.png') ? 'png' : 'svg'

    target.costumes.push({
        name: token.content.content,
        dataFormat: format,
        assetId: id,
        md5ext: id + '.' + format,
        rotationCenterX: 240,
        rotationCenterY: 180,
    })

    filesToCopy[id + '.' + format] = token.content.content
}

function compileNativeFunction(name: string, path: string, parameters: string[], builder: (stack: Stack) => void, names: NameLookup, target: any) {
    for(const parameter of parameters) {
        target.lists[`${path}/${parameter} Stack`] = [
            `${path}/${parameter} Stack`,
            []
        ]
    }

    const stack = new Stack()
    stack.add(new DefinitionBlock(path))

    builder(stack)

    const convertedStack = stack.convert()

    for(const block of Object.keys(convertedStack)) {
        target.blocks[block] = convertedStack[block]
    }

    names[name] = {
        path,
        parameters,
    }
}

function compileSprite(token: Token, project: any, sources: { [key: string]: Token[] }, filesToCopy: any) {
    project.targets.push(JSON.parse(JSON.stringify(defaultSpriteTarget)))

    const target = project.targets[project.targets.length - 1]

    const path = token.content.content

    target.name = path
    target.layerOrder = project.targets.length - 1

    const names = {}

    compileNativeFunction('changeX', 'Sprite/changeX', [ 'x' ], stack => {
        stack.add(
            new ChangeXBlock(
                new ItemOfListBlock(`Sprite/changeX/x Stack`, new LengthOfListBlock(`Sprite/changeX/x Stack`))
            )
        )
    }, names, target)

    compileNativeFunction('changeY', 'Sprite/changeY', [ 'y' ], stack => {
        stack.add(
            new ChangeYBlock(
                new ItemOfListBlock(`Sprite/changeY/y Stack`, new LengthOfListBlock(`Sprite/changeY/y Stack`))
            )
        )
    }, names, target)

    compileNativeFunction('wait', 'Sprite/wait', [ 'time' ], stack => {
        stack.add(
            new WaitBlock(
                new ItemOfListBlock(`Sprite/wait/time Stack`, new LengthOfListBlock(`Sprite/wait/time Stack`))
            )
        )
    }, names, target)

    compileNativeFunction('goTo', 'Sprite/goTo', [ 'x', 'y' ], stack => {
        stack.add(
            new GoToBlock(
                new ItemOfListBlock(`Sprite/goTo/x Stack`, new LengthOfListBlock(`Sprite/goTo/x Stack`)),
                new ItemOfListBlock(`Sprite/goTo/y Stack`, new LengthOfListBlock(`Sprite/goTo/y Stack`))
            )
        )
    }, names, target)

    compileNativeFunction('keyPressed', 'Sprite/keyPressed', [ 'key' ], stack => {
        stack.add(
            new SetVariableBlock(
                'Return',
                new KeyPressedBlock(new ItemOfListBlock(`Sprite/keyPressed/key Stack`, new LengthOfListBlock(`Sprite/keyPressed/key Stack`)))
            )
        )
    }, names, target)

    compileNativeFunction('touching', 'Sprite/touching', [ 'sprite' ], stack => {
        stack.add(
            new SetVariableBlock(
                'Return',
                new TouchingBlock(new ItemOfListBlock(`Sprite/touching/sprite Stack`, new LengthOfListBlock(`Sprite/touching/sprite Stack`)))
            )
        )
    }, names, target)

    compileNativeFunction('getX', 'Sprite/getX', [], stack => {
        stack.add(
            new SetVariableBlock(
                'Return',
                new XPositionBlock()
            )
        )
    }, names, target)

    compileNativeFunction('getY', 'Sprite/getY', [], stack => {
        stack.add(
            new SetVariableBlock(
                'Return',
                new YPositionBlock()
            )
        )
    }, names, target)

    console.log(JSON.stringify(sources[path], null, 2))

    compileScope(sources[path], path, target, project, names, sources, filesToCopy, {
        inline: true,
        callGlobalOnFlag: true
    })
}

function compileUse(stack: Stack, token: Token, parentPath: string, target: any, project: any, names: NameLookup, sources: { [key: string]: Token[] }, filesToCopy: any) {
    const path = token.content.content
    
    compileScope(sources[token.content.content], path, target, project, names, sources, filesToCopy, {
        inline: true
    })

    stack.add(new CallBlock(path))
}

function compileScope(tokens: Token[], path: string, target: any, project: any, names: NameLookup, sources: { [key: string]: Token[] }, filesToCopy: any, options: any){
    const stack = new Stack()

    stack.add(new DefinitionBlock(path))

    const outOfScopeNames = Object.keys(names)

    for(let i = 0; i < tokens.length; i++){
        const token = tokens[i]

        if(token.tokenType === TokenType.Sprite) compileSprite(token, project, sources, filesToCopy)

        if(token.tokenType === TokenType.Use) compileUse(stack, token, path, target, project, names, sources, filesToCopy)

        if(token.tokenType === TokenType.Definition) compileDefinition(stack, token, path, target, project, names)

        if(token.tokenType === TokenType.FunctionDefinition) compileFunctionDefinition(token, path, target, project, names, sources, filesToCopy)

        if(token.tokenType === TokenType.Call) compileCall(stack, token, path, target, names)

        if(token.tokenType === TokenType.Return) compileReturn(stack, token, path, target, names)
        
        if(token.tokenType === TokenType.Assignment) compileAssignment(stack, token, path, target, names)

        if(token.tokenType === TokenType.If) compileIf(stack, token, path, target, project, names, sources, filesToCopy)

        if(token.tokenType === TokenType.Forever) compileForever(stack, token, path, target, project, names, sources, filesToCopy)

        if(token.tokenType === TokenType.Costume) compileCostume(token, target, filesToCopy)

        if(token.tokenType === TokenType.Backdrop) compileBackdrop(token, target, filesToCopy)

        if(token.tokenType === TokenType.Operation) compileOperation(stack, token, path, target, names)
    }

    if(options.callGlobalOnFlag) {
        const flagStack = new Stack()

        flagStack.add(new FlagBlock())
        flagStack.add(new CallBlock(path))

        const convertedStack = flagStack.convert()

        for(const block of Object.keys(convertedStack)) {
            target.blocks[block] = convertedStack[block]
        }
    }

    if(!options.inline) {
        for(const name of Object.keys(names)) {
            if(outOfScopeNames.includes(name)) continue

            stack.add(new RemoveFromListBlock(`${names[name].path} Stack`, 'last'))

            delete names[name]
        }
    }

    const convertedStack = stack.convert()

    for(const block of Object.keys(convertedStack)) {
        target.blocks[block] = convertedStack[block]
    }
}

export interface CompiledProject {
    project: any,
    filesToCopy: { [key: string]: string }
}

export function compile(sources: { [key: string]: string }) : { project: any, filesToCopy: {[key: string]: string} } {
    const sourceDependencies: { [key: string]: string[] } = {}
    const sourceTrees: { [key: string]: Token[] } = {}
    
    for(const source of Object.keys(sources)) {
        const code = sources[source]
        const tokens = tokenize(code)
        const tree = buildTree(tokens)
        sourceTrees[source] = tree

        // console.log(JSON.stringify(tree, null, 2))
        
        const dependencies = scanForDependencies(tree)
        sourceDependencies[source] = dependencies
    }

    const order = resolveCompilationOrder(sourceDependencies)

    const sourceComputedTrees: { [key: string]: Token[] } = {}
    const sourceExportedNames: { [key: string]: { [key: string]: ComputedType } } = {}

    const project = JSON.parse(JSON.stringify(defaultProject))

    for(const source of order) {
        const computed = compute(sourceTrees[source], sourceExportedNames)

        sourceComputedTrees[source] = computed.tree
        sourceExportedNames[source] = computed.exportedNames
    }

    const filesToCopy = {}

    compileScope(sourceComputedTrees['project.mew'], 'project.mew', project.targets[0], project, {}, sourceComputedTrees, filesToCopy, {})

    return {
        project,
        filesToCopy
    }
}

const defaultProject = {
    targets: [
        {
            isStage: true,
            name: 'Stage',
            variables: {},
            lists: {},
            broadcasts: {},
            blocks: {},
            comments: {},
            currentCostume: 0,
            costumes: [],
            sounds: [],
            volume: 100,
            layerOrder: 0,
            tempo: 60,
            videoTransparency: 50,
            videoState: 'on',
            textToSpeechLanguage: null
        }
    ],
    monitors: [],
    extensions: [],
    meta: {
        semver: '3.0.0',
        vm: '1.2.52',
        agent: 'Mew/0.2.0'
    }
}

const defaultSpriteTarget = {
    isStage: false,
    name: 'Sprite',
    variables: {
        Return : [
            'Return',
            ''
        ]
    },
    lists: {
        'Operation Stack': [
            'Operation Stack',
            []
        ]
    },
    broadcasts: {},
    blocks: {},
    comments: {},
    currentCostume: 0,
    costumes: [],
    sounds: [],
    volume: 100,
    layerOrder: 0,
    visible: true,
    x: 0,
    y: 0,
    size: 100,
    direction: 90,
    draggable: false,
    rotationStyle: "all around"
}