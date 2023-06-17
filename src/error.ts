export function compilerError(
	message: string,
	startLine: number,
	endLine: number,
	startColumn: number,
	endColumn: number
) {
	if (startLine == endLine) {
		throw new Error(`${message} on line ${startLine}`)
	}

	throw new Error(`${message} at lines ${startLine}-${endLine}`)
}
