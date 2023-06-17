import { Token, matchType, matchToken } from './token'

const whiteSpace = [' ', '\n', '\r']

const newLines = ['\n', '\r']

export const symbols = [
	'*',
	'/',
	'+',
	'-',
	'=',
	'(',
	')',
	"'",
	'.',
	'!',
	'%',
	'&',
	'|',
	'>',
	'<',
	'{',
	'}',
	',',
	'"',
]

export const tags = ['var']

export const descriptors = ['function']

export const verbs = ['if', 'while', 'return']

const types = ['string', 'int', 'float', 'bool', 'void']

const commands = ['sprite', 'costume', 'import']

export function simpleTokenize(str: string): Token[] {
	let tokens: Token[] = []

	let line = 1
	let character = 1

	for (let i = 0; i < str.length; i++) {
		if (whiteSpace.includes(str[i])) {
			if (i != 0)
				tokens.push({
					content: str.substring(0, i),
					type: 'unkown',
					lines: {
						start: line,
						end: line,
					},
					columns: {
						start: character,
						end: character + i - 1,
					},
				})

			if (newLines.includes(str[i])) line++

			str = str.substring(i + 1)

			character += i + 1

			i = -1

			continue
		}

		if (symbols.includes(str[i])) {
			if (i != 0)
				tokens.push({
					content: str.substring(0, i),
					type: 'unkown',
					lines: {
						start: line,
						end: line,
					},
					columns: {
						start: character,
						end: character + i - 1,
					},
				})

			tokens.push({
				content: str[i],
				type: 'unkown',
				lines: {
					start: line,
					end: line,
				},
				columns: {
					start: character + i,
					end: character + i,
				},
			})

			str = str.substring(i + 1)

			character += i + 1

			i = -1

			continue
		}
	}

	if (str.length > 0)
		tokens.push({
			content: str,
			type: 'unkown',
			lines: {
				start: line,
				end: line,
			},
			columns: {
				start: character,
				end: character + str.length - 1,
			},
		})

	return tokens
}

export function classifyTokens(tokens: Token[]): Token[] {
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i]

		if (/^[0-9]+$/.test(token.content)) {
			token.type = 'int'
		} else if (symbols.includes(token.content)) {
			token.type = 'symbol'
		} else if (tags.includes(token.content)) {
			token.type = 'tag'
		} else if (descriptors.includes(token.content)) {
			token.type = 'descriptor'
		} else if (verbs.includes(token.content)) {
			token.type = 'verb'
		} else if (types.includes(token.content)) {
			token.type = 'type'
		} else if (commands.includes(token.content)) {
			token.type = 'command'
		} else if (token.content == 'false' || token.content == 'true') {
			token.type = 'bool'
		} else {
			token.type = 'name'
		}
	}

	return tokens
}

export function buildNativeTypes(tokens: Token[]): Token[] {
	let newTokens: Token[] = []

	let inString = false
	let inStringPos = -1

	// Builds Strings
	for (let i = 0; i < tokens.length; i++) {
		if (inString) {
			if (matchToken(tokens[i], 'symbol', "'")) {
				inString = false

				let combinedString = ''

				for (let j = inStringPos + 1; j < i; j++) {
					combinedString += tokens[j].content
				}

				newTokens.push({
					content: combinedString,
					type: 'string',
					lines: {
						start: tokens[inStringPos].lines.start,
						end: tokens[i].lines.end,
					},
					columns: {
						start: tokens[inStringPos].columns.start,
						end: tokens[i].columns.end,
					},
				})
			}

			continue
		} else {
			if (matchToken(tokens[i], 'symbol', "'")) {
				inString = true
				inStringPos = i

				continue
			}
		}

		newTokens.push(tokens[i])
	}

	for (let i = 1; i < newTokens.length - 1; i++) {
		if (
			matchToken(newTokens[i], 'symbol', '.') &&
			matchType(newTokens[i - 1], 'int') &&
			matchType(newTokens[i + 1], 'int')
		) {
			newTokens.splice(i - 1, 3, {
				content: newTokens[i - 1].content + '.' + newTokens[i + 1].content,
				type: 'float',
				lines: {
					start: newTokens[i - 1].lines.start,
					end: newTokens[i + 1].lines.end,
				},
				columns: {
					start: newTokens[i - 1].columns.start,
					end: newTokens[i + 1].columns.end,
				},
			})
		}
	}

	return newTokens
}

export function tokenize(str: string) {
	let strs = simpleTokenize(str)

	let tokens = classifyTokens(strs)

	tokens = buildNativeTypes(tokens)

	return tokens
}
