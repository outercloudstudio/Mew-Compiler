import { Token, matchType, matchToken } from './token'
import { getCompilerType } from './types'
import { Operator, getOperator } from './operators'
import { VOID, FUNCTION, BOOL, CompilerType } from './types'
import { compilerError } from './error'
import Native from './native'

type ComputeContext = {
	location: string
	reference: {
		names: {
			[key: string]: CompilerType
		}
		exportNames: {
			[key: string]: {
				type: CompilerType
				additionalData: any
			}
		}
		computeReturn: boolean
		definiteReturn: boolean
		missingDefiniteReturn: Token | null
		returningType: CompilerType
		project: boolean
	}
}

function validateReturn(token: Token, context: ComputeContext) {
	if (!context.reference.computeReturn)
		compilerError(
			`Unexpected return`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)

	if (token.content.computedType.signature() != context.reference.returningType.signature())
		compilerError(
			`Can not return value with type of '${token.content.computedType.signature()}'! Function expects type of '${context.reference.returningType.signature()}'`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)
}

function validateDefinition(token: Token, context: ComputeContext) {
	if (matchToken(token.content.word, 'descriptor', 'function')) {
		if (Object.keys(context.reference.names).includes(token.content.name.content))
			compilerError(
				`Can not define '${token.content.name.content}' multiple times`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)

		if (
			getCompilerType(token.content.type.content).signature() != new VOID().signature() &&
			!context.reference.definiteReturn
		)
			compilerError(
				`Function '${token.content.name.content}' must always return a value`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
	} else {
		if (Object.keys(context.reference.names).includes(token.content.name.content))
			compilerError(
				`Can not define '${token.content.name.content}' multiple times`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)

		const type = getCompilerType(token.content.type.content)

		if (!type.canCastFrom(token.content.value.computedType))
			compilerError(
				`Can not assign value of type '${token.content.value.computedType.signature()}' to variable '${
					token.content.name.content
				}' of type '${type.signature()}'`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
	}
}

function validateAssignment(token: Token, context: ComputeContext) {
	if (!Object.keys(context.reference.names).includes(token.content.name.content))
		compilerError(
			`Tried to assign value to '${token.content.name.content}' which has not been defined`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)

	const targetType = context.reference.names[token.content.name.content]
	const type = token.content.content.computedType

	if (!targetType.canCastFrom(type))
		compilerError(
			`Can not assign value of type '${type.signature()}' to variable '${
				token.content.signature().content
			}' of type '${targetType.signature()}'`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)
}

function validateOperation(token: Token, context: ComputeContext) {
	if (token.content.operator.type === 'operator') {
		const operator: Operator = getOperator(token.content.operator.content)

		if (
			!operator.canOperate(token.content.values[0].computedType, token.content.values[1]?.computedType)
		) {
			if (operator.mono) {
				compilerError(
					`Can not do operation '${
						token.content.operator.content
					}' on value of type '${token.content.values[0].computedType.signature()}'`,
					token.lines.start,
					token.lines.end,
					token.columns.start,
					token.columns.end
				)
			} else {
				compilerError(
					`Can not do operation '${
						token.content.operator.content
					}' on values of type '${token.content.values[0].computedType.signature()}' and '${token.content.values[1].computedType.signature()}'`,
					token.lines.start,
					token.lines.end,
					token.columns.start,
					token.columns.end
				)
			}
		}
	} else {
		const type = getCompilerType(token.content.operator.content)

		if (!type.canCastFrom(token.content.values[0].computedType)) {
			compilerError(
				`Can not cast a value of type '${token.content.values[0].computedType.signature()}' to '${type.signature()}'`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
		}
	}
}

function validateCall(token: Token, context: ComputeContext) {
	const type = <FUNCTION>context.reference.names[token.content.name.content]

	if (token.content.params.length != type.paramTypes.length)
		compilerError(
			`${token.content.name.content} expected ${type.paramTypes.length} parameter${
				type.paramTypes.length != 1 ? 's' : ''
			} but recieved ${token.content.params.length}`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)

	for (let paramIndex = 0; paramIndex < token.content.params.length; paramIndex++) {
		const param = token.content.params[paramIndex][0]
		const passedType = param.computedType
		const expectedType = type.paramTypes[paramIndex]

		if (!expectedType.canCastFrom(passedType))
			compilerError(
				`${
					token.content.name.content
				} expected paramter ${paramIndex} to be ${expectedType.signature()} but recieved ${passedType.signature()}`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
	}
}

function validateIf(token: Token, context: ComputeContext) {
	if (token.content.content.params[0][0].computedType.signature() != new BOOL().signature())
		compilerError(
			`If statement expected bool but recieved ${token.content.content.params[0][0].computedType.signature()}`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)
}

function validateWhile(token: Token, context: ComputeContext) {
	if (token.content.content.params[0][0].computedType.signature() != new BOOL().signature())
		compilerError(
			`While statement expected bool but recieved ${token.content.content.params[0][0].computedType.signature()}`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)
}

function validate(token: Token, context: ComputeContext) {
	if (matchType(token, 'assignment')) validateAssignment(token, context)

	if (matchType(token, 'definition')) validateDefinition(token, context)

	if (matchType(token, 'operation')) validateOperation(token, context)

	if (matchType(token, 'name')) {
		if (
			!Object.keys(context.reference.names).includes(token.content) &&
			(<any>Native)[token.content] === undefined
		)
			compilerError(
				`'${token.content}' has not been defined`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
	}

	if (matchType(token, 'return')) validateReturn(token, context)

	if (matchType(token, 'call')) validateCall(token, context)

	if (matchType(token, 'if')) validateIf(token, context)

	if (matchType(token, 'while')) validateWhile(token, context)
}

function earlyValidate(token: Token, context: ComputeContext) {
	if (matchType(token, 'definition') && matchToken(token.content.word, 'descriptor', 'function')) {
		if (Object.keys(context.reference.names).includes(token.content.name.content))
			compilerError(
				`'${token.content.name.content}' has already been defined`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)

		const blockParams = token.content.value.content.params

		for (let i = 0; i < blockParams.length; i++) {
			if (Object.keys(context.reference.names).includes(blockParams[i].content.name.content))
				compilerError(
					`The paramater '${blockParams[i].content.name.content}' has already been defined`,
					token.lines.start,
					token.lines.end,
					token.columns.start,
					token.columns.end
				)
		}
	}
}

function computeRecursive(token: Token, context: ComputeContext): Token {
	earlyValidate(token, context)

	if (matchType(token, 'assignment')) {
		token.content.content = computeRecursive(token.content.content, {
			location: token.type,
			reference: context.reference,
		})
	}

	if (matchType(token, 'definition')) {
		token.content.value = computeRecursive(token.content.value, {
			location: token.type,
			reference: context.reference,
		})

		if (matchToken(token.content.word, 'descriptor', 'function')) {
			context.reference.computeReturn = true
			context.reference.returningType = getCompilerType(token.content.type.content)

			const previousNames: any = {}

			for (const name of Object.keys(context.reference.names)) {
				previousNames[name] = getCompilerType(context.reference.names[name].signature())
			}

			const blockParams = token.content.value.content.params

			for (let i = 0; i < blockParams.length; i++) {
				context.reference.names[blockParams[i].content.name.content] = getCompilerType(
					blockParams[i].content.type.content
				)
			}

			const blockContent = token.content.value.content.content

			for (let i = 0; i < blockContent.length; i++) {
				token.content.value.content.content[i] = computeRecursive(blockContent[i], {
					location: 'function',
					reference: context.reference,
				})
			}

			context.reference.names = previousNames
			context.reference.computeReturn = false
		}
	}

	if (matchType(token, 'return')) {
		token.content = computeRecursive(token.content, {
			location: token.type,
			reference: context.reference,
		})
	}

	if (matchType(token, 'operation')) {
		for (let i = 0; i < token.content.values.length; i++) {
			token.content.values[i] = computeRecursive(token.content.values[i], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	if (matchType(token, 'call')) {
		token.content.name = computeRecursive(token.content.name, {
			location: token.type,
			reference: context.reference,
		})

		for (let paramIndex = 0; paramIndex < token.content.params.length; paramIndex++) {
			token.content.params[paramIndex][0] = computeRecursive(token.content.params[paramIndex][0], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	if (matchType(token, 'if')) {
		token.content.content.params[0][0] = computeRecursive(token.content.content.params[0][0], {
			location: token.type,
			reference: context.reference,
		})

		const previousNames: any = {}

		for (const name of Object.keys(context.reference.names)) {
			previousNames[name] = getCompilerType(context.reference.names[name].signature())
		}

		const blockContent = token.content.content.content

		for (let i = 0; i < blockContent.length; i++) {
			token.content.content.content[i] = computeRecursive(blockContent[i], {
				location: token.type,
				reference: context.reference,
			})
		}

		context.reference.names = previousNames
	}

	if (matchType(token, 'while')) {
		token.content.content.params[0][0] = computeRecursive(token.content.content.params[0][0], {
			location: token.type,
			reference: context.reference,
		})

		const previousNames: any = {}

		for (const name of Object.keys(context.reference.names)) {
			previousNames[name] = getCompilerType(context.reference.names[name].signature())
		}

		const blockContent = token.content.content.content

		for (let i = 0; i < blockContent.length; i++) {
			token.content.content.content[i] = computeRecursive(blockContent[i], {
				location: token.type,
				reference: context.reference,
			})
		}

		context.reference.names = previousNames
	}

	validate(token, context)

	// Compute types
	if (matchType(token, 'operation')) {
		if (token.content.operator.type === 'operator') {
			const operator: Operator = getOperator(token.content.operator.content)

			if (operator.mono) {
				token.computedType =
					operator.returns(token.content.values[0].computedType, new VOID()) || new VOID()
			} else {
				token.computedType =
					operator.returns(token.content.values[0].computedType, token.content.values[1].computedType) ||
					new VOID()
			}
		} else {
			token.computedType = getCompilerType(token.content.operator.content)
		}
	} else if (matchType(token, 'name')) {
		token.computedType = context.reference.names[token.content]
	} else if (matchType(token, 'call')) {
		token.computedType = (<FUNCTION>context.reference.names[token.content.name.content]).returnType
	} else if (['int', 'float', 'string', 'bool', 'void'].includes(token.type)) {
		token.computedType = getCompilerType(token.type)
	} else {
		token.computedType = new VOID()
	}

	// Misc
	if (matchType(token, 'definition')) {
		if (matchToken(token.content.word, 'descriptor', 'function')) {
			const returnType = getCompilerType(token.content.type.content)
			const paramTypes: CompilerType[] = []

			for (let param of token.content.value.content.params) {
				paramTypes.push(getCompilerType(param.content.type.content))
			}

			const type = new FUNCTION(returnType, paramTypes)

			context.reference.names[token.content.name.content] = type

			if (context.location === 'global')
				context.reference.exportNames[token.content.name.content] = {
					type,
					additionalData: {
						params: token.content.value.content.params.map((param: any) => param.content.name.content),
					},
				}

			token.computedType = type
		} else {
			context.reference.names[token.content.name.content] = getCompilerType(token.content.type.content)
		}
	}

	if (matchType(token, 'return')) {
		context.reference.definiteReturn = true
	}

	if (matchType(token, 'if')) {
		context.reference.definiteReturn = false
	}

	return token
}

function addNativeNames(context: ComputeContext) {
	for (const name of Object.keys(Native)) {
		context.reference.names[name] = (<any>Native)[name].type
	}
}

function addImportNames(context: ComputeContext, dependencies: ComputeResult[]) {
	for (const dependency of dependencies) {
		for (const name of Object.keys(dependency.exportNames)) {
			context.reference.names[name] = dependency.exportNames[name].type
		}
	}
}

export type ComputeResult = {
	tree: Token[]
	exportNames: {
		[key: string]: {
			type: CompilerType
			additionalData: any
		}
	}
}

export function compute(
	tree: Token[],
	project: boolean,
	dependencies: ComputeResult[]
): ComputeResult {
	const context: ComputeContext = {
		location: 'global',
		reference: {
			names: {},
			exportNames: {},
			computeReturn: false,
			definiteReturn: false,
			returningType: new VOID(),
			missingDefiniteReturn: null,
			project,
		},
	}

	addNativeNames(context)
	addImportNames(context, dependencies)

	for (let i = 0; i < tree.length; i++) {
		tree[i] = computeRecursive(tree[i], context)
	}

	return {
		tree,
		exportNames: context.reference.exportNames,
	}
}
