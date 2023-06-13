import { Package } from '../package'
import { Token } from '../token'
import { CompileContext } from '../compiler'
import { FUNCTION, INT, VOID, BOOL, STRING } from '../types'
import { Stack, DefinitionBlock, ChangeXBlock, ChangeYBlock, ItemOfListBlock, LengthOfListBlock, SetVariableBlock, KeyPressedBlock } from '../scratch'

export default {
    keyPressed: {
        macro: true,
        type: new FUNCTION(new BOOL(), [new STRING()]),
        add(context: CompileContext, json: any, target: number): any {
            json.targets[target].lists[`${context.path}/Scratch/keyPressed/key Stack`] = [
                `${context.path}/Scratch/keyPressed/key Stack`,
                []
            ]

            const stack = new Stack()

            stack.add(new DefinitionBlock(context.path + '/Scratch/keyPressed'))

            stack.add(new SetVariableBlock(
                'Transfer Buffer',
                new KeyPressedBlock(
                    new ItemOfListBlock(
                        `${context.path}/Scratch/keyPressed/key Stack`,
                        new LengthOfListBlock(`${context.path}/Scratch/keyPressed/key Stack`)
                    )
                )
            ))

            stack.add(new SetVariableBlock(
                'Returning',
                'true'
            ))

            json.targets[target].blocks = {
                ...(json.targets[target].blocks),
                ...(stack.convert())
            }

            return json
        },
        additionalNameData(context: CompileContext) {
            return {
                paramPaths: [
                    context.path + '/Scratch/keyPressed/key',
                ]
            }
        }
    }
} as Package