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
		add(context: CompileContext, json: any, target: number): any {
			json.targets[target].lists[`${context.path}/move/x Stack`] = [`${context.path}/move/x Stack`, []]

			json.targets[target].lists[`${context.path}/move/y Stack`] = [`${context.path}/move/y Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock(context.path + '/move'))

			stack.add(
				new ChangeXBlock(
					new ItemOfListBlock(
						`${context.path}/move/x Stack`,
						new LengthOfListBlock(`${context.path}/move/x Stack`)
					)
				)
			)

			stack.add(
				new ChangeYBlock(
					new ItemOfListBlock(
						`${context.path}/move/y Stack`,
						new LengthOfListBlock(`${context.path}/move/y Stack`)
					)
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
				paramPaths: [context.path + '/move/x', context.path + '/move/y'],
			}
		},
	},
	goTo: {
		macro: true,
		type: new FUNCTION(new VOID(), [new FLOAT(), new FLOAT()]),
		add(context: CompileContext, json: any, target: number): any {
			json.targets[target].lists[`${context.path}/goTo/x Stack`] = [`${context.path}/goTo/x Stack`, []]

			json.targets[target].lists[`${context.path}/goTo/y Stack`] = [`${context.path}/goTo/y Stack`, []]

			const stack = new Stack()

			stack.add(new DefinitionBlock(context.path + '/goTo'))

			stack.add(
				new GoToBlock(
					new ItemOfListBlock(
						`${context.path}/goTo/x Stack`,
						new LengthOfListBlock(`${context.path}/goTo/x Stack`)
					),
					new ItemOfListBlock(
						`${context.path}/goTo/y Stack`,
						new LengthOfListBlock(`${context.path}/goTo/y Stack`)
					)
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
				paramPaths: [context.path + '/goTo/x', context.path + '/goTo/y'],
			}
		},
	},
	touching: {
		macro: true,
		type: new FUNCTION(new BOOL(), [new STRING()]),
		add(context: CompileContext, json: any, target: number): any {
			json.targets[target].lists[`${context.path}/touching/sprite Stack`] = [
				`${context.path}/touching/sprite Stack`,
				[],
			]

			const stack = new Stack()

			stack.add(new DefinitionBlock(context.path + '/touching'))

			stack.add(
				new SetVariableBlock(
					'Transfer Buffer',
					new TouchingBlock(
						new ItemOfListBlock(
							`${context.path}/touching/sprite Stack`,
							new LengthOfListBlock(`${context.path}/touching/sprite Stack`)
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
				paramPaths: [context.path + '/touching/sprite'],
			}
		},
	},
	keyPressed: {
		macro: true,
		type: new FUNCTION(new BOOL(), [new STRING()]),
		add(context: CompileContext, json: any, target: number): any {
			json.targets[target].lists[`${context.path}/keyPressed/key Stack`] = [
				`${context.path}/keyPressed/key Stack`,
				[],
			]

			const stack = new Stack()

			stack.add(new DefinitionBlock(context.path + '/keyPressed'))

			stack.add(
				new SetVariableBlock(
					'Transfer Buffer',
					new KeyPressedBlock(
						new ItemOfListBlock(
							`${context.path}/keyPressed/key Stack`,
							new LengthOfListBlock(`${context.path}/keyPressed/key Stack`)
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
				paramPaths: [context.path + '/keyPressed/key'],
			}
		},
	},
}
