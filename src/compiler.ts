import { Token, matchType, matchToken, returnsValue } from './token'
import { getOperator} from './operators'
import { getCompilerType, CompilerType, VOID, FUNCTION } from './types'
import { Block, Stack, DefinitionBlock, SetVariableBlock, AddToListBlock, RemoveFromListBlock, LengthOfListBlock, ItemOfListBlock, ReplaceInListBlock, RepeatUntilBlock, EqualsBlock, CallBlock, IfBlock, Reference, StopThisBlock, FlagBlock, ForeverBlock } from './scratch'
const util = require('util') //// console.log(util.inspect(tokens, false, null, true))
import * as fs from 'fs'
import * as path from 'path'
import { tokenize } from './tokenizer'
import { buildTree } from './tree'
import { compute, ComputeResult } from './compute'
import * as crypto from 'crypto'
const AdmZip = require('adm-zip')
import { loadImage } from 'canvas'

function compileExpression(context: CompileContext, token: Token, stack: Stack) : Block | string | Reference {
    if(token.type == 'operation'){
        // console.log(context.path + '/ (operation in expression) ' + token.content.operator.content)

        if(token.content.operator.type === 'operator'){
            const operator = getOperator(token.content.operator.content)
    
            const aResult = compileExpression({
                path: context.path + '/' + token.content.operator.content,
                reference: context.reference
            }, token.content.values[0], stack)
            
            if(operator.mono) return operator.operate(aResult, token.content.values[0].computedType, '', new VOID(), stack)
    
            const bResult = compileExpression({
                path: context.path + '/' + token.content.operator.content,
                reference: context.reference
            }, token.content.values[1], stack)
            
            return operator.operate(aResult, token.content.values[0].computedType, bResult, token.content.values[1].computedType, stack)
        } else {
            const type = getCompilerType(token.content.operator.content)

            const result = compileExpression({
                path: context.path + '/' + token.content.operator.content,
                reference: context.reference
            }, token.content.values[0], stack)

            return type.castFrom(result, token.content.values[0].computedType, stack)
        }
    } else if(token.type == 'name') {
        // console.log(context.path + '/ (name in expression) ' + token.content)

        const path = context.reference.names[token.content].path

        return new ItemOfListBlock(`${path} Stack`, new LengthOfListBlock(`${path} Stack`))
    } else if (token.type == 'call') {
        // console.log(context.path + '/ (call in expression) ' + token.content.name.content)

        const result = compileCall({
            path: context.path,
            reference: context.reference
        }, token, stack)
        
        return new Reference('Transfer Buffer')
    } else {
        // console.log(context.path + '/ (value in expression) ' + token.content)
        
        return token.content
    }
}

function compileFunctionDefinition(context: CompileContext, token: Token, json: any, target: number) {
    const path = context.path + '/' + token.content.name.content

    // console.log(context.path + '/ (function defintion) ' + token.content.name.content)
    
    for(const param of token.content.value.content.params) {
        // console.log(path + '/ (function param definition)' + param.content.name.content)
        
        json.targets[0].lists[path + '/' + param.content.name.content + ' Stack'] = [
            path + '/' + param.content.name.content + ' Stack',
            []
        ]
        
        context.reference.names[param.content.name.content] = {
            path: path + '/' + param.content.name.content,
            type: getCompilerType(param.content.type.content)
        }
    }

   json = compileScope({
        path,
        reference: context.reference
    }, token.content.value.content.content, json, target, false)
    
    context.reference.names[token.content.name.content] = {
        path,
        type: token.computedType,
        paramPaths: []
    }

    context.reference.definitionPaths[path] = token.computedType!

    for(const param of token.content.value.content.params) {
        context.reference.names[token.content.name.content].paramPaths.push(path + '/' + param.content.name.content)
        
        delete context.reference.names[param.content.name.content]
    }

    return json
}

function compileDefinition(context: CompileContext, token: Token, stack: Stack, json: any, target: number) {
    const path = context.path + '/' + token.content.name.content

    // console.log(context.path + '/ (Definition) ' + token.content.name.content)

    json.targets[target].lists[path + ' Stack'] = [
        path + ' Stack',
        []
    ]

    context.reference.names[token.content.name.content] = {
        path,
        type: getCompilerType(token.content.type.content)
    }
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content.value, stack)

    stack.add(new AddToListBlock(`${path} Stack`, 
         context.reference.names[token.content.name.content].type.castFrom(expression, token.content.value.computedType, stack)
    ))

    return json
}

function compileSharedDefinition(context: CompileContext, token: Token, stack: Stack, json: any, target: number) {
    const path = 'shared/' + token.content.name.content

    // console.log(context.path + '/ (Definition) ' + token.content.name.content)

    json.targets[target].lists[path + ' Stack'] = [
        path + ' Stack',
        []
    ]
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content.value, stack)

    stack.add(new AddToListBlock(`${path} Stack`, 
         context.reference.names[token.content.name.content].type.castFrom(expression, token.content.value.computedType, stack)
    ))

    return json
}

function compileAssignment(context: CompileContext, token: Token, stack: Stack, json: any) {
    const path = context.path + '/' + token.content.name.content

    // console.log(path + ' (assignment)')
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content.content, stack)

    const namePath = context.reference.names[token.content.name.content].path

    stack.add(new ReplaceInListBlock(`${namePath} Stack`, 'last' , 
         context.reference.names[token.content.name.content].type.castFrom(expression, token.content.content.computedType, stack)
    ))
}

function compileCall(context: CompileContext, token: Token, stack: Stack) {
    const path = context.path + '/' + token.content.name.content

    // console.log(context.path + '/ (call) ' + token.content.name.content)

    const paramPaths = context.reference.names[token.content.name.content].paramPaths

    let paramIndex = 0
    for(const param of token.content.params) {
        const realParam = param[0]
        const paramPath = paramPaths[paramIndex]

        const expression = compileExpression({
            path: paramPath,
            reference: context.reference
        }, realParam, stack)

        const paramType = context.reference.names[token.content.name.content].type.paramTypes[paramIndex]

        stack.add(new AddToListBlock(`${paramPath} Stack`, 
            paramType.castFrom(expression, realParam.computedType, stack)
        ))

        paramIndex++
    }

    stack.add(new CallBlock(context.reference.names[token.content.name.content].path))

    for(const path of paramPaths) {
        stack.add(new RemoveFromListBlock(`${path} Stack`, 'last'))
    }

    stack.add(new SetVariableBlock('Returning', 'false'))
}

function compileReturn(context: CompileContext, token: Token, stack: Stack) {
    const path = context.path + '/' + 'return' 
    
    // console.log(path)
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content, stack)

    stack.add(new SetVariableBlock('Transfer Buffer', expression))
    stack.add(new SetVariableBlock('Returning', 'true'))

    context.reference.breakingScope = true
}

function compileIf(context: CompileContext, token: Token, stack: Stack, json: any, previousNames: any, target: number) {
    const path = context.path + `/if ${token.lines.start}-${token.columns.start}`

    // console.log(path)
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content.content.params[0][0], stack)

    const ifBlock = stack.add(new IfBlock(
        new EqualsBlock(
            expression,
            'true'
        )
    ))

    ifBlock.stack.add(new CallBlock(path))

    const returnIfBlock = ifBlock.stack.add(new IfBlock(
        new EqualsBlock(
            new Reference('Returning'),
            'true'
        )
    ))

    for(const name of Object.keys(context.reference.names)){
        if(previousNames[name] != undefined) continue

        if(!(context.reference.names[name].type instanceof FUNCTION)) returnIfBlock.stack.add(new RemoveFromListBlock(`${context.reference.names[name].path} Stack`, 'last'))
    }

    returnIfBlock.stack.add(new StopThisBlock())

    json = compileScope({
        path,
        reference: context.reference
    }, token.content.content.content, json, target, false)

    return json
}

function compileWhile(context: CompileContext, token: Token, stack: Stack, json: any, previousNames: any, target: number) {
    const path = context.path + `/while ${token.lines.start}-${token.columns.start}`

    // console.log(path)
    
    const expression = compileExpression({
        path,
        reference: context.reference
    }, token.content.content.params[0][0], stack)

    const repeatBlock = stack.add(new RepeatUntilBlock(
        new EqualsBlock(expression, 'false')
    ))

    repeatBlock.stack.add(new CallBlock(path))

    const returnIfBlock = repeatBlock.stack.add(new IfBlock(
        new EqualsBlock(
            new Reference('Returning'),
            'true'
        )
    ))

    for(const name of Object.keys(context.reference.names)){
        if(previousNames[name] != undefined) continue

        if(!(context.reference.names[name].type instanceof FUNCTION)) returnIfBlock.stack.add(new RemoveFromListBlock(`${context.reference.names[name].path} Stack`, 'last'))
    }

    returnIfBlock.stack.add(new StopThisBlock())
    
    compileExpression({
        path,
        reference: context.reference
    }, token.content.content.params[0][0], repeatBlock.stack)
    
    json = compileScope({
        path,
        reference: context.reference
    }, token.content.content.content, json, target, false)

    return json
}

export function compileScope(context: CompileContext, tree: Token[], json: any, target: number, preserveValues: boolean) : any {
    // console.log(context.path + ' (scope)')

    const previousNames: any = {}

    for(const name of Object.keys(context.reference.names)){
        previousNames[name] = context.reference.names[name].path
    }

    const stack = new Stack()

    stack.add(new DefinitionBlock(context.path))

    for (let tokenIndex = 0; tokenIndex < tree.length; tokenIndex++) {
        const token = tree[tokenIndex]

        // console.log(token.type)

        if(matchType(token, 'definition')) {
            if(matchToken(token.content.word, 'descriptor', 'function')) {
                json = compileFunctionDefinition(context, token, json, target)
            } else if(matchToken(token.content.word, 'tag', 'shared')) {
                json = compileSharedDefinition(context, token, stack, json, target)
            }else {
                json = compileDefinition(context, token, stack, json, target)
            }
        }

        if(matchType(token, 'assignment')) compileAssignment(context, token, stack, json)
        
        if(matchType(token, 'call')) compileCall(context, token, stack)

        if(matchType(token, 'return')) compileReturn(context, token, stack)

        if(matchType(token, 'if')) {
            json  = compileIf(context, token, stack, json, previousNames, target)
        }

        if(matchType(token, 'while')) {
            json = compileWhile(context, token, stack, json, previousNames, target)
        }

        if(context.reference.breakingScope){
            context.reference.breakingScope = false

            break
        }
    }

    if(!preserveValues) {
        const newNames: any = {}

        for(const name of Object.keys(context.reference.names)){
            if(previousNames[name] != undefined) continue
    
            if(!(context.reference.names[name].type instanceof FUNCTION)) newNames[name] = context.reference.names[name].path
    
            delete context.reference.names[name]
        }
    
        for(const name of Object.keys(newNames)) {
            stack.add(new RemoveFromListBlock(`${newNames[name]} Stack`, 'last'))
        }
    }

    json.targets[target].blocks = {
        ...(json.targets[target].blocks),
        ...(stack.convert())
    }
    
    return json
}

export type CompileContext = {
    path: string
    reference: {
        names: any
        breakingScope: boolean,
        definitionPaths: {
            [key: string]: CompilerType
        }
    }
}

function addPackageNames(computeResult: ComputeResult, context: CompileContext, json: any, target: number): any {
    for(const packageName of Object.keys(computeResult.packages)) {
        for(const name of Object.keys(computeResult.packages[packageName])) {
            context.reference.names[packageName + '.' + name] = {
                type: computeResult.packages[packageName][name].type,
                path: context.path + '/' + packageName + '/' + name,
            }

            if(computeResult.packages[packageName][name].additionalNameData !== undefined) {
                context.reference.names[packageName + '.' + name] = {
                 ...(context.reference.names[packageName + '.' + name]),
                 ...(computeResult.packages[packageName][name].additionalNameData!(context))
                }
            }

            if(computeResult.packages[packageName][name].add !== undefined) computeResult.packages[packageName][name].add!(context, json, target)
        }
    }

    return json
}

function addSharedNames(computeResult: ComputeResult, context: CompileContext, json: any, target: number): any {
    for(const sharedName of Object.keys(computeResult.shared)) {
        context.reference.names[sharedName] = {
            type: computeResult.shared[sharedName],
            path: 'shared/' + sharedName,
        }
    }

    return json
}

export async function compile(projectPath: string) {
    const buildPath = path.join(projectPath, 'build')
    if(fs.existsSync(buildPath)) fs.rmSync(buildPath, { recursive: true })

    fs.mkdirSync(buildPath)

    const outPath = path.join(buildPath, 'out')

    fs.mkdirSync(outPath)
    
    let projectJSON: any = {
        targets: [
            {
                isStage: true,
                name: 'Stage',
                variables: {
                    'Transfer Buffer': [
                        'Transfer Buffer',
                        'void'
                    ],
                    'Returning': [
                        'Returning',
                        'false'
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
                costumes: [
                    {
                        name: 'backdrop1',
                        dataFormat: 'svg',
                        assetId: 'cd21514d0531fdffb22204e0ec5ed84a',
                        md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg',
                        rotationCenterX: 240,
                        rotationCenterY: 180
                    }
                ],
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
            agent: 'Mao/0.1.0'
        }
    }

    const projectContext: CompileContext = {
        path: 'project/global',
        reference: {
            names: {},
            breakingScope: false,
            definitionPaths: {}
        }
    }

    const projectFile = fs.readFileSync(path.join(projectPath, 'project.mao')).toString()
    const project = compute(buildTree(tokenize(projectFile)), true)

    addPackageNames(project, projectContext, projectJSON, 0)
    addSharedNames(project, projectContext, projectJSON, 0)
    
    projectJSON = compileScope(projectContext, project.tree, projectJSON, 0, true)

    const projectFlagStack = new Stack()
    projectFlagStack.add(new FlagBlock())
    projectFlagStack.add(new CallBlock('project/global'))

    if(projectContext.reference.definitionPaths['project/global/update'] !== undefined && projectContext.reference.definitionPaths['project/global/update'].signature() === new FUNCTION(new VOID(), []).signature()) {
        projectFlagStack.add(new ForeverBlock()).stack.add(new CallBlock('project/global/update'))
    }
    
    projectJSON.targets[0].blocks = {
        ...(projectJSON.targets[0].blocks),
        ...(projectFlagStack.convert())
    }

    const zip = new AdmZip()
    
    let spriteIndex = 1
    for(const spritePath of project.sprites) {
        const spriteFile = fs.readFileSync(path.join(projectPath, spritePath + '.mao')).toString()
        const sprite = compute(buildTree(tokenize(spriteFile)), false, project.shared)

        projectJSON.targets.push({
            isStage: false,
            name: spritePath,
            variables: {
                'Transfer Buffer': [
                    'Transfer Buffer',
                    'void'
                ],
                'Returning': [
                    'Returning',
                    'false'
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
            layerOrder: spriteIndex,
            visible: true,
            x: 0,
            y: 0,
            size: 100,
            direction: 90,
            draggable: false,
            rotationStyle: "all around"
        })

        for(const costume of sprite.costumes) {
            const costumePath = path.join(projectPath, path.dirname(spritePath), costume)
            const hash = crypto.createHash('md5').update(fs.readFileSync(costumePath)).digest('hex')
            const extension = costumePath.substring(costumePath.length - 3, costumePath.length)
            
            fs.copyFileSync(costumePath, path.join(outPath, hash + extension))

            zip.addLocalFile(path.join(outPath, hash + extension))

            const image = await loadImage(costumePath)
            
            projectJSON.targets[spriteIndex].costumes.push({
                name: costumePath,
                dataFormat: extension,
                assetId: hash,
                md5ext: hash + '.' + extension,
                rotationCenterX: image.width / 2,
                rotationCenterY: image.height / 2
            })
        }

        const context: CompileContext = {
            path: spritePath + '/global',
            reference: {
                names: {},
                breakingScope: false,
                definitionPaths: {}
            }
        }

        addPackageNames(sprite, context, projectJSON, spriteIndex)
        addSharedNames(project, context, projectJSON, spriteIndex)

        projectJSON = compileScope(context, sprite.tree, projectJSON, spriteIndex, true)

        const flagStack = new Stack()
        flagStack.add(new FlagBlock())
        flagStack.add(new CallBlock(spritePath + '/global'))

        if(context.reference.definitionPaths[spritePath + '/global/update'] !== undefined && context.reference.definitionPaths[spritePath + '/global/update'].signature() === new FUNCTION(new VOID(), []).signature()) {
            flagStack.add(new ForeverBlock()).stack.add(new CallBlock(spritePath + '/global/update'))
        }
    
        projectJSON.targets[spriteIndex].blocks = {
            ...(projectJSON.targets[spriteIndex].blocks),
            ...(flagStack.convert())
        }

        spriteIndex++
    }

    fs.writeFileSync(path.join(outPath, 'project.json'), JSON.stringify(projectJSON, null, 2))

    zip.addLocalFile(path.join(outPath, 'project.json'))

    const zipDest = path.join(buildPath, 'project.sb3')

    zip.writeZip(zipDest)
}