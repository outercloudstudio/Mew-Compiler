import { Token } from './token'
import { CompileContext } from './compiler'
import { FUNCTION, INT, FLOAT, VOID, BOOL, STRING } from './types'
import {
	Stack,
	DefinitionBlock,
	ChangeXBlock,
	ChangeYBlock,
	GoToBlock,
	ItemOfListBlock,
	LengthOfListBlock,
	TouchingBlock,
	SetVariableBlock,
	KeyPressedBlock,
} from './scratch'

export default {
	move: {
		macro: true,
		type: new FUNCTION(new VOID(), [new FLOAT(), new FLOAT()]),
		add(json: any, target: number): any {
			json.targets[target].lists[`Native/move/x Stack`] = [`Native/move/x Stack`, []]

			json.targets[target].lists[`Native/move/y Stack`] = [`Native/move/y Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock('Native/move'))

			stack.add(
				new ChangeXBlock(
					new ItemOfListBlock(`Native/move/x Stack`, new LengthOfListBlock(`Native/move/x Stack`))
				)
			)

			stack.add(
				new ChangeYBlock(
					new ItemOfListBlock(`Native/move/y Stack`, new LengthOfListBlock(`Native/move/y Stack`))
				)
			)

			json.targets[target].blocks = {
				...json.targets[target].blocks,
				...stack.convert(),
			}

			return json
		},
		additionalNameData() {
			return {
				paramPaths: ['Native/move/x', 'Native/move/y'],
			}
		},
	},
	goTo: {
		macro: true,
		type: new FUNCTION(new VOID(), [new FLOAT(), new FLOAT()]),
		add(json: any, target: number): any {
			json.targets[target].lists[`Native/goTo/x Stack`] = [`Native/goTo/x Stack`, []]

			json.targets[target].lists[`Native/goTo/y Stack`] = [`Native/goTo/y Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock('Native/goTo'))

			stack.add(
				new GoToBlock(
					new ItemOfListBlock(`Native/goTo/x Stack`, new LengthOfListBlock(`Native/goTo/x Stack`)),
					new ItemOfListBlock(`Native/goTo/y Stack`, new LengthOfListBlock(`Native/goTo/y Stack`))
				)
			)

			json.targets[target].blocks = {
				...json.targets[target].blocks,
				...stack.convert(),
			}

			return json
		},
		additionalNameData(context: CompileContext) {
			return {
				paramPaths: ['Native/goTo/x', 'Native/goTo/y'],
			}
		},
	},
	touching: {
		macro: true,
		type: new FUNCTION(new BOOL(), [new STRING()]),
		add(json: any, target: number): any {
			json.targets[target].lists[`Native/touching/sprite Stack`] = [`Native/touching/sprite Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock('Native/touching'))

			stack.add(
				new SetVariableBlock(
					'Transfer Buffer',
					new TouchingBlock(
						new ItemOfListBlock(
							`Native/touching/sprite Stack`,
							new LengthOfListBlock(`Native/touching/sprite Stack`)
						)
					)
				)
			)

			stack.add(new SetVariableBlock('Returning', 'true'))

			json.targets[target].blocks = {
				...json.targets[target].blocks,
				...stack.convert(),
			}

			return json
		},
		additionalNameData(context: CompileContext) {
			return {
				paramPaths: ['Native/touching/sprite'],
			}
		},
	},
	keyPressed: {
		macro: true,
		type: new FUNCTION(new BOOL(), [new STRING()]),
		add(json: any, target: number): any {
			json.targets[target].lists[`Native/keyPressed/key Stack`] = [`Native/keyPressed/key Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock('Native/keyPressed'))

			stack.add(
				new SetVariableBlock(
					'Transfer Buffer',
					new KeyPressedBlock(
						new ItemOfListBlock(
							`Native/keyPressed/key Stack`,
							new LengthOfListBlock(`Native/keyPressed/key Stack`)
						)
					)
				)
			)

			stack.add(new SetVariableBlock('Returning', 'true'))

			json.targets[target].blocks = {
				...json.targets[target].blocks,
				...stack.convert(),
			}

			return json
		},
		additionalNameData(context: CompileContext) {
			return {
				paramPaths: ['Native/keyPressed/key'],
			}
		},
	},
}
