import { Token, matchType, matchToken, returnsValue } from './token'
import { getOperator } from './operators'
import { getCompilerType, CompilerType, VOID, FUNCTION } from './types'
import {
	Block,
	Stack,
	DefinitionBlock,
	SetVariableBlock,
	AddToListBlock,
	RemoveFromListBlock,
	LengthOfListBlock,
	ItemOfListBlock,
	ReplaceInListBlock,
	RepeatUntilBlock,
	EqualsBlock,
	CallBlock,
	IfBlock,
	Reference,
	StopThisBlock,
	FlagBlock,
	ForeverBlock,
} from './scratch'
const util = require('util') //// console.log(util.inspect(tokens, false, null, true))
import * as fs from 'fs'
import * as path from 'path'
import { tokenize } from './tokenizer'
import { buildTree } from './tree'
import { compute, ComputeResult } from './compute'
import Native from './native'
import * as crypto from 'crypto'
const AdmZip = require('adm-zip')
import { loadImage } from 'canvas'
import { syntaxCheck } from './syntaxCheck'
import { dependencyCheck } from './dependencyCheck'
import { compilerError } from './error'

function compileExpression(
	context: CompileContext,
	token: Token,
	stack: Stack
): Block | string | Reference {
	if (token.type == 'operation') {
		// console.log(context.path + '/ (operation in expression) ' + token.content.operator.content)

		if (token.content.operator.type === 'operator') {
			const operator = getOperator(token.content.operator.content)

			const aResult = compileExpression(
				{
					path: context.path + '/' + token.content.operator.content,
					reference: context.reference,
				},
				token.content.values[0],
				stack
			)

			if (operator.mono)
				return operator.operate(aResult, token.content.values[0].computedType, '', new VOID(), stack)

			const bResult = compileExpression(
				{
					path: context.path + '/' + token.content.operator.content,
					reference: context.reference,
				},
				token.content.values[1],
				stack
			)

			return operator.operate(
				aResult,
				token.content.values[0].computedType,
				bResult,
				token.content.values[1].computedType,
				stack
			)
		} else {
			const type = getCompilerType(token.content.operator.content)

			const result = compileExpression(
				{
					path: context.path + '/' + token.content.operator.content,
					reference: context.reference,
				},
				token.content.values[0],
				stack
			)

			return type.castFrom(result, token.content.values[0].computedType, stack)
		}
	} else if (token.type == 'name') {
		// console.log(context.path + '/ (name in expression) ' + token.content)

		const path = context.reference.names[token.content].path

		return new ItemOfListBlock(`${path} Stack`, new LengthOfListBlock(`${path} Stack`))
	} else if (token.type == 'call') {
		// console.log(context.path + '/ (call in expression) ' + token.content.name.content)

		const result = compileCall(
			{
				path: context.path,
				reference: context.reference,
			},
			token,
			stack
		)

		return new Reference('Transfer Buffer')
	} else {
		// console.log(context.path + '/ (value in expression) ' + token.content)

		return token.content
	}
}

function compileFunctionDefinition(
	context: CompileContext,
	token: Token,
	json: any,
	target: number
) {
	const path = context.path + '/' + token.content.name.content

	// console.log(context.path + '/ (function defintion) ' + token.content.name.content)

	for (const param of token.content.value.content.params) {
		// console.log(path + '/ (function param definition)' + param.content.name.content)

		json.targets[0].lists[path + '/' + param.content.name.content + ' Stack'] = [
			path + '/' + param.content.name.content + ' Stack',
			[],
		]

		context.reference.names[param.content.name.content] = {
			path: path + '/' + param.content.name.content,
			type: getCompilerType(param.content.type.content),
		}
	}

	json = compileScope(
		{
			path,
			reference: context.reference,
		},
		token.content.value.content.content,
		json,
		target,
		false
	)

	context.reference.names[token.content.name.content] = {
		path,
		type: token.computedType,
		paramPaths: [],
	}

	context.reference.definitionPaths[path] = token.computedType!

	for (const param of token.content.value.content.params) {
		context.reference.names[token.content.name.content].paramPaths.push(
			path + '/' + param.content.name.content
		)

		delete context.reference.names[param.content.name.content]
	}

	return json
}

function compileDefinition(
	context: CompileContext,
	token: Token,
	stack: Stack,
	json: any,
	target: number
) {
	const path = context.path + '/' + token.content.name.content

	// console.log(context.path + '/ (Definition) ' + token.content.name.content)

	json.targets[target].lists[path + ' Stack'] = [path + ' Stack', []]

	context.reference.names[token.content.name.content] = {
		path,
		type: getCompilerType(token.content.type.content),
	}

	const expression = compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content.value,
		stack
	)

	stack.add(
		new AddToListBlock(
			`${path} Stack`,
			context.reference.names[token.content.name.content].type.castFrom(
				expression,
				token.content.value.computedType,
				stack
			)
		)
	)

	return json
}

function compileAssignment(context: CompileContext, token: Token, stack: Stack, json: any) {
	const path = context.path + '/' + token.content.name.content

	// console.log(path + ' (assignment)')

	const expression = compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content.content,
		stack
	)

	const namePath = context.reference.names[token.content.name.content].path

	stack.add(
		new ReplaceInListBlock(
			`${namePath} Stack`,
			'last',
			context.reference.names[token.content.name.content].type.castFrom(
				expression,
				token.content.content.computedType,
				stack
			)
		)
	)
}

function compileCall(context: CompileContext, token: Token, stack: Stack) {
	const path = context.path + '/' + token.content.name.content

	// console.log(context.path + '/ (call) ' + token.content.name.content)

	const paramPaths = context.reference.names[token.content.name.content].paramPaths

	let paramIndex = 0
	for (const param of token.content.params) {
		const realParam = param[0]
		const paramPath = paramPaths[paramIndex]

		const expression = compileExpression(
			{
				path: paramPath,
				reference: context.reference,
			},
			realParam,
			stack
		)

		const paramType = context.reference.names[token.content.name.content].type.paramTypes[paramIndex]

		stack.add(
			new AddToListBlock(
				`${paramPath} Stack`,
				paramType.castFrom(expression, realParam.computedType, stack)
			)
		)

		paramIndex++
	}

	stack.add(new CallBlock(context.reference.names[token.content.name.content].path))

	for (const path of paramPaths) {
		stack.add(new RemoveFromListBlock(`${path} Stack`, 'last'))
	}

	stack.add(new SetVariableBlock('Returning', 'false'))
}

function compileReturn(context: CompileContext, token: Token, stack: Stack) {
	const path = context.path + '/' + 'return'

	// console.log(path)

	const expression = compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content,
		stack
	)

	stack.add(new SetVariableBlock('Transfer Buffer', expression))
	stack.add(new SetVariableBlock('Returning', 'true'))

	context.reference.breakingScope = true
}

function compileIf(
	context: CompileContext,
	token: Token,
	stack: Stack,
	json: any,
	previousNames: any,
	target: number
) {
	const path = context.path + `/if ${token.lines.start}-${token.columns.start}`

	// console.log(path)

	const expression = compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content.content.params[0][0],
		stack
	)

	const ifBlock = stack.add(new IfBlock(new EqualsBlock(expression, 'true')))

	ifBlock.stack.add(new CallBlock(path))

	const returnIfBlock = ifBlock.stack.add(
		new IfBlock(new EqualsBlock(new Reference('Returning'), 'true'))
	)

	for (const name of Object.keys(context.reference.names)) {
		if (previousNames[name] != undefined) continue

		if (!(context.reference.names[name].type instanceof FUNCTION))
			returnIfBlock.stack.add(
				new RemoveFromListBlock(`${context.reference.names[name].path} Stack`, 'last')
			)
	}

	returnIfBlock.stack.add(new StopThisBlock())

	json = compileScope(
		{
			path,
			reference: context.reference,
		},
		token.content.content.content,
		json,
		target,
		false
	)

	return json
}

function compileWhile(
	context: CompileContext,
	token: Token,
	stack: Stack,
	json: any,
	previousNames: any,
	target: number
) {
	const path = context.path + `/while ${token.lines.start}-${token.columns.start}`

	// console.log(path)

	const expression = compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content.content.params[0][0],
		stack
	)

	const repeatBlock = stack.add(new RepeatUntilBlock(new EqualsBlock(expression, 'false')))

	repeatBlock.stack.add(new CallBlock(path))

	const returnIfBlock = repeatBlock.stack.add(
		new IfBlock(new EqualsBlock(new Reference('Returning'), 'true'))
	)

	for (const name of Object.keys(context.reference.names)) {
		if (previousNames[name] != undefined) continue

		if (!(context.reference.names[name].type instanceof FUNCTION))
			returnIfBlock.stack.add(
				new RemoveFromListBlock(`${context.reference.names[name].path} Stack`, 'last')
			)
	}

	returnIfBlock.stack.add(new StopThisBlock())

	compileExpression(
		{
			path,
			reference: context.reference,
		},
		token.content.content.params[0][0],
		repeatBlock.stack
	)

	json = compileScope(
		{
			path,
			reference: context.reference,
		},
		token.content.content.content,
		json,
		target,
		false
	)

	return json
}

export function compileScope(
	context: CompileContext,
	tree: Token[],
	json: any,
	target: number,
	preserveValues: boolean
): any {
	// console.log(context.path + ' (scope)')

	const previousNames: any = {}

	for (const name of Object.keys(context.reference.names)) {
		previousNames[name] = context.reference.names[name].path
	}

	const stack = new Stack()

	stack.add(new DefinitionBlock(context.path))

	for (let tokenIndex = 0; tokenIndex < tree.length; tokenIndex++) {
		const token = tree[tokenIndex]

		// console.log(token.type)

		if (matchType(token, 'definition')) {
			if (matchToken(token.content.word, 'descriptor', 'function')) {
				json = compileFunctionDefinition(context, token, json, target)
			} else {
				json = compileDefinition(context, token, stack, json, target)
			}
		}

		if (matchType(token, 'assignment')) compileAssignment(context, token, stack, json)

		if (matchType(token, 'call')) compileCall(context, token, stack)

		if (matchType(token, 'return')) compileReturn(context, token, stack)

		if (matchType(token, 'if')) {
			json = compileIf(context, token, stack, json, previousNames, target)
		}

		if (matchType(token, 'while')) {
			json = compileWhile(context, token, stack, json, previousNames, target)
		}

		if (context.reference.breakingScope) {
			context.reference.breakingScope = false

			break
		}
	}

	if (!preserveValues) {
		const newNames: any = {}

		for (const name of Object.keys(context.reference.names)) {
			if (previousNames[name] != undefined) continue

			if (!(context.reference.names[name].type instanceof FUNCTION))
				newNames[name] = context.reference.names[name].path

			delete context.reference.names[name]
		}

		for (const name of Object.keys(newNames)) {
			stack.add(new RemoveFromListBlock(`${newNames[name]} Stack`, 'last'))
		}
	}

	json.targets[target].blocks = {
		...json.targets[target].blocks,
		...stack.convert(),
	}

	return json
}

export type CompileContext = {
	path: string
	reference: {
		names: any
		breakingScope: boolean
		definitionPaths: {
			[key: string]: CompilerType
		}
	}
}

function addNativeNames(context: CompileContext, json: any, target: number): any {
	for (const name of Object.keys(Native)) {
		context.reference.names[name] = {
			type: (<any>Native)[name].type,
			path: context.path + '/' + name,
		}

		if ((<any>Native)[name].additionalNameData !== undefined) {
			context.reference.names[name] = {
				...context.reference.names[name],
				...(<any>Native)[name].additionalNameData(context),
			}
		}

		if ((<any>Native)[name].add !== undefined) (<any>Native)[name].add(context, json, target)
	}

	return json
}

type Dependency = {
	path: string
	dependants: Dependency[]
	dependencies: Dependency[]
	sprites: string[]
	costumes: string[]
}

export async function compile(projectPath: string) {
	const buildPath = path.join(projectPath, 'build')
	if (fs.existsSync(buildPath)) fs.rmSync(buildPath, { recursive: true })
	fs.mkdirSync(buildPath)

	const outPath = path.join(buildPath, 'out')
	fs.mkdirSync(outPath)

	let projectJSON: any = {
		targets: [
			{
				isStage: true,
				name: 'Stage',
				variables: {
					'Transfer Buffer': ['Transfer Buffer', 'void'],
					Returning: ['Returning', 'false'],
				},
				lists: {
					'Operation Stack': ['Operation Stack', []],
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
						rotationCenterY: 180,
					},
				],
				sounds: [],
				volume: 100,
				layerOrder: 0,
				tempo: 60,
				videoTransparency: 50,
				videoState: 'on',
				textToSpeechLanguage: null,
			},
		],
		monitors: [],
		extensions: [],
		meta: {
			semver: '3.0.0',
			vm: '1.2.52',
			agent: 'Mao/0.1.0',
		},
	}

	const projectFilePath = path.join(projectPath, 'project.mao')

	const dependencies: {
		[key: string]: {
			tree: any
			dependencies: string[]
			sprites: string[]
			costumes: string[]
		}
	} = {}

	const filesCompiledStage1 = []
	const filesToCompileStage1 = [projectFilePath]

	while (filesToCompileStage1.length > 0) {
		const fileToCompile = filesToCompileStage1.shift()!
		filesCompiledStage1.push(fileToCompile)

		const tree = buildTree(tokenize(fs.readFileSync(fileToCompile).toString()))

		syntaxCheck(tree, fileToCompile === projectFilePath)

		const dependencyCheckResult = dependencyCheck(tree, fileToCompile)

		dependencies[fileToCompile] = {
			tree: tree,
			dependencies: dependencyCheckResult.dependencies,
			sprites: dependencyCheckResult.sprites,
			costumes: dependencyCheckResult.costumes,
		}

		for (const dependency of dependencyCheckResult.dependencies) {
			if (filesCompiledStage1.includes(dependency)) continue
			if (filesToCompileStage1.includes(dependency)) continue

			filesToCompileStage1.push(dependency)
		}
	}

	const shallowDependencies: {
		[key: string]: {
			tree: any
			dependencies: string[]
			sprites: string[]
			costumes: string[]
		}
	} = JSON.parse(JSON.stringify(dependencies))

	for (const filePath of Object.keys(dependencies)) {
		const dependenciesChecked = []
		const dependenciesToCheck = JSON.parse(JSON.stringify(dependencies[filePath].dependencies))

		while (dependenciesToCheck.length > 0) {
			const dependency = dependenciesToCheck.shift()!
			dependenciesChecked.push(dependencies)

			for (const deepDependency of dependencies[dependency].dependencies) {
				if (deepDependency === filePath) compilerError(`Circular dependency!`, 0, 0, 0, 0)

				if (dependencies[filePath].dependencies.includes(deepDependency)) continue

				dependencies[filePath].dependencies.push(deepDependency)

				dependenciesToCheck.push(deepDependency)
			}
		}
	}

	const filesToBeComputed = Object.keys(dependencies)
	const filesComputed: string[] = []
	const fileComputeResults: { [key: string]: ComputeResult } = {}

	while (filesToBeComputed.length > 0) {
		const fileToCompute = filesToBeComputed.splice(
			filesToBeComputed.findIndex(file => {
				for (const dependency of dependencies[file].dependencies) {
					if (!filesComputed.includes(dependency)) return false
				}

				return true
			}),
			1
		)[0]!

		filesComputed.push(fileToCompute)

		const fileDependencies: ComputeResult[] = []

		for (const dependency of dependencies[fileToCompute].dependencies) {
			fileDependencies.push(fileComputeResults[dependency])
		}

		const computeResult = compute(
			dependencies[fileToCompute].tree,
			fileToCompute === projectFilePath,
			fileDependencies
		)

		fileComputeResults[fileToCompute] = computeResult
	}

	const zip = new AdmZip()

	let spriteIndex = 0

	let filesToCompileStage2 = [projectFilePath].concat(dependencies[projectFilePath].sprites)

	for (const filePath of filesToCompileStage2) {
		const oldSpriteIndex = spriteIndex

		if (filePath !== projectFilePath) {
			spriteIndex++

			projectJSON.targets.push({
				isStage: false,
				name: path.relative(projectPath, filePath),
				variables: {
					'Transfer Buffer': ['Transfer Buffer', 'void'],
					Returning: ['Returning', 'false'],
				},
				lists: {
					'Operation Stack': ['Operation Stack', []],
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
				rotationStyle: 'all around',
			})
		} else {
			spriteIndex = 0
		}

		for (const costume of dependencies[filePath].costumes) {
			const hash = crypto.createHash('md5').update(fs.readFileSync(costume)).digest('hex')

			const extension = path.parse(costume).ext.slice(1)

			fs.copyFileSync(costume, path.join(outPath, hash + extension))

			zip.addLocalFile(path.join(outPath, hash + extension))

			const image = await loadImage(costume)

			projectJSON.targets[spriteIndex].costumes.push({
				name: path.basename(costume),
				dataFormat: extension,
				assetId: hash,
				md5ext: hash + '.' + extension,
				rotationCenterX: image.width / 2,
				rotationCenterY: image.height / 2,
			})
		}

		const scopesToCompile = [filePath].concat(dependencies[filePath].dependencies)

		while (scopesToCompile.length > 0) {
			const scopeFilePath = scopesToCompile.shift()!

			const context: CompileContext = {
				path: path.relative(projectPath, scopeFilePath) + '/global',
				reference: {
					names: {},
					breakingScope: false,
					definitionPaths: {},
				},
			}

			addNativeNames(context, projectJSON, spriteIndex)

			console.log(shallowDependencies)

			for (const dependency of shallowDependencies[scopeFilePath].dependencies) {
				console.log(dependency)

				for (const name of Object.keys(fileComputeResults[dependency].exportNames)) {
					console.log(name)
					console.log(fileComputeResults[dependency].exportNames[name].type)
					console.log(fileComputeResults[dependency].exportNames[name].type instanceof FUNCTION)

					if (fileComputeResults[dependency].exportNames[name].type instanceof FUNCTION) {
						context.reference.names[name] = {
							type: fileComputeResults[dependency].exportNames[name].type,
							path: context.path + '/' + name,
							paramPaths: fileComputeResults[dependency].exportNames[name].additionalData.params.map(
								(param: string) => context.path + '/' + name + '/' + param
							),
						}
					} else {
						context.reference.names[name] = {
							type: fileComputeResults[dependency].exportNames[name].type,
							path: context.path + '/' + name,
						}
					}
				}
			}

			console.log(context.reference.names)

			projectJSON = compileScope(
				context,
				fileComputeResults[scopeFilePath].tree,
				projectJSON,
				spriteIndex,
				scopeFilePath === projectFilePath
			)

			const flagStack = new Stack()
			flagStack.add(new FlagBlock())
			flagStack.add(new CallBlock(path.relative(projectPath, scopeFilePath) + '/global'))

			if (
				context.reference.definitionPaths[
					path.relative(projectPath, scopeFilePath) + '/global/update'
				] !== undefined &&
				context.reference.definitionPaths[
					path.relative(projectPath, scopeFilePath) + '/global/update'
				].signature() === new FUNCTION(new VOID(), []).signature()
			) {
				flagStack
					.add(new ForeverBlock())
					.stack.add(new CallBlock(path.relative(projectPath, scopeFilePath) + '/global/update'))
			}

			projectJSON.targets[spriteIndex].blocks = {
				...projectJSON.targets[spriteIndex].blocks,
				...flagStack.convert(),
			}
		}

		spriteIndex = oldSpriteIndex
	}

	fs.writeFileSync(path.join(outPath, 'project.json'), JSON.stringify(projectJSON, null, 2))
	zip.addLocalFile(path.join(outPath, 'project.json'))

	const zipDest = path.join(buildPath, 'project.sb3')
	zip.writeZip(zipDest)
}
