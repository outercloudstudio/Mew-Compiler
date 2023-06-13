import { Package } from '../package'
import { Token } from '../token'
import { CompileContext } from '../compiler'
import { FUNCTION, INT, FLOAT, VOID, BOOL, STRING } from '../types'
import { Stack, DefinitionBlock, ChangeXBlock, ChangeYBlock, GoToBlock, ItemOfListBlock, LengthOfListBlock, TouchingBlock, SetVariableBlock } from '../scratch'

export default {
    move: {
        macro: true,
        type: new FUNCTION(new VOID(), [new FLOAT(), new FLOAT()]),
        add(context: CompileContext, json: any, target: number): any {
            json.targets[target].lists[`${context.path}/Sprite/move/x Stack`] = [
                `${context.path}/Sprite/move/x Stack`,
                []
            ]

            json.targets[target].lists[`${context.path}/Sprite/move/y Stack`] = [
                `${context.path}/Sprite/move/y Stack`,
                []
            ]
                
            const stack = new Stack()

            stack.add(new DefinitionBlock(context.path + '/Sprite/move'))

            stack.add(new ChangeXBlock(new ItemOfListBlock(`${context.path}/Sprite/move/x Stack`, new LengthOfListBlock(`${context.path}/Sprite/move/x Stack`))))

            stack.add(new ChangeYBlock(new ItemOfListBlock(`${context.path}/Sprite/move/y Stack`, new LengthOfListBlock(`${context.path}/Sprite/move/y Stack`))))
            
            json.targets[target].blocks = {
                ...(json.targets[target].blocks),
                ...(stack.convert())
            }

            return json
        },
        additionalNameData(context: CompileContext) {
            return {
                paramPaths: [
                    context.path + '/Sprite/move/x',
                    context.path + '/Sprite/move/y',
                ]
            }
        }
    },
    goTo: {
        macro: true,
        type: new FUNCTION(new VOID(), [new FLOAT(), new FLOAT()]),
        add(context: CompileContext, json: any, target: number): any {
            json.targets[target].lists[`${context.path}/Sprite/goTo/x Stack`] = [
                `${context.path}/Sprite/goTo/x Stack`,
                []
            ]

            json.targets[target].lists[`${context.path}/Sprite/goTo/y Stack`] = [
                `${context.path}/Sprite/goTo/y Stack`,
                []
            ]
                
            const stack = new Stack()

            stack.add(new DefinitionBlock(context.path + '/Sprite/goTo'))

            stack.add(new GoToBlock(
                new ItemOfListBlock(`${context.path}/Sprite/goTo/x Stack`, new LengthOfListBlock(`${context.path}/Sprite/goTo/x Stack`)),
                new ItemOfListBlock(`${context.path}/Sprite/goTo/y Stack`, new LengthOfListBlock(`${context.path}/Sprite/goTo/y Stack`))
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
                    context.path + '/Sprite/goTo/x',
                    context.path + '/Sprite/goTo/y',
                ]
            }
        }
    },
    touching: {
        macro: true,
        type: new FUNCTION(new BOOL(), [new STRING()]),
        add(context: CompileContext, json: any, target: number): any {
            json.targets[target].lists[`${context.path}/Sprite/touching/sprite Stack`] = [
                `${context.path}/Sprite/touching/sprite Stack`,
                []
            ]

            const stack = new Stack()

            stack.add(new DefinitionBlock(context.path + '/Sprite/touching'))

            stack.add(new SetVariableBlock(
                'Transfer Buffer',
                new TouchingBlock(
                    new ItemOfListBlock(
                        `${context.path}/Sprite/touching/sprite Stack`,
                        new LengthOfListBlock(`${context.path}/Sprite/touching/sprite Stack`)
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
                    context.path + '/Sprite/touching/sprite',
                ]
            }
        }
    }
} as Package