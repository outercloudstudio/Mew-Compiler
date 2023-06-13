import { randomUUID } from 'crypto'

const InputTypes = {
    RAW: -1,
    NUMBER: 4,
    INTEGER: 7,
    STRING: 10
}

export const BlockTypes = {
    ADD: 'operator_add',
    SUBTRACT: 'operator_subtract',
    MULTIPLY: 'operator_multiply',
    DIVIDE: 'operator_divide',
    ADD_TO_LIST: 'data_addtolist',
    REMOVE_FROM_LIST: 'data_deleteoflist',
    LENGTH_OF_LIST: 'data_lengthoflist',
    REPLACE_IN_LIST: 'data_replaceitemoflist',
    ITEM_OF_LIST: 'data_itemoflist',
    SET_VARIABLE_TO: 'data_setvariableto',
    DEFINITION: 'procedures_definition',
    PROTOTYPE: 'procedures_prototype',
    CALL: 'procedures_call',
    STOP_THIS: 'control_stop',
    FLOOR: 'operator_floor',
    IF: 'control_if',
    UNTIL: 'control_repeat_until',
    EQUALS: 'operator_equals',
    LESS_THAN: 'operator_lt',
    
}

export type Input = {
    content: any,
    type: string
}

function inputToJSON(input: Input, type: number) {
    if (input.type == 'value') {
        return [
            1,
            [
                type,
                input.content
            ]
        ]
    } else if (input.type == 'no shadow value') {
        return [
            2,
            [
                type,
                input.content
            ]
        ]
    } else if (input.type == 'no shadow block') {
        return [
            2,
            input.content
        ]
    } else if (input.type == 'reference') {
        return [
            3,
            [
                input.content.isList ? 13 : 12,
                input.content.name,
                input.content.ID
            ],
            [
                type,
                'unset'
            ]
        ]
    } else if (input.type == 'block') {
        return [
            3,
            input.content,
            [
                type,
                'unset'
            ]
        ]
    } else if (input.type == 'raw') {
        return input.content
    }
}

export class Block {
    ID: string

    name: string

    inputs: Input[] = []

    next: string | null = null
    prev: string | null = null

    constructor(name: string, prev?: string | Block | null, inputs?: Input[]) {
        this.name = name
        this.ID = randomUUID()

        if (prev) {
            if (typeof (prev) == 'string') {
                this.prev = prev
            } else {
                this.prev = prev.ID
            }
        }

        if (inputs) this.inputs = inputs
    }

    toJSON() {
        let base: any = {
            opcode: this.name,
            next: this.next,
            parent: this.prev,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: this.prev == null
        }

        if (this.prev == null) {
            base.x = 0
            base.y = 0
        }

        switch (this.name) {
            case BlockTypes.ADD:
                base.inputs.NUM1 = inputToJSON(this.inputs[0], InputTypes.NUMBER)
                base.inputs.NUM2 = inputToJSON(this.inputs[1], InputTypes.NUMBER)

                break
            case BlockTypes.SUBTRACT:
                base.inputs.NUM1 = inputToJSON(this.inputs[0], InputTypes.NUMBER)
                base.inputs.NUM2 = inputToJSON(this.inputs[1], InputTypes.NUMBER)

                break
            case BlockTypes.MULTIPLY:
                base.inputs.NUM1 = inputToJSON(this.inputs[0], InputTypes.NUMBER)
                base.inputs.NUM2 = inputToJSON(this.inputs[1], InputTypes.NUMBER)

                break
            case BlockTypes.DIVIDE:
                base.inputs.NUM1 = inputToJSON(this.inputs[0], InputTypes.NUMBER)
                base.inputs.NUM2 = inputToJSON(this.inputs[1], InputTypes.NUMBER)

                break
            case BlockTypes.ADD_TO_LIST:
                base.fields.LIST = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.ITEM = inputToJSON(this.inputs[1], InputTypes.STRING)

                break
            case BlockTypes.REMOVE_FROM_LIST:
                base.fields.LIST = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.INDEX = inputToJSON(this.inputs[1], InputTypes.INTEGER)

                break
            case BlockTypes.REPLACE_IN_LIST:
                base.fields.LIST = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.INDEX = inputToJSON(this.inputs[1], InputTypes.INTEGER)
                base.inputs.ITEM = inputToJSON(this.inputs[2], InputTypes.INTEGER)

                break
            case BlockTypes.LENGTH_OF_LIST:
                base.fields.LIST = inputToJSON(this.inputs[0], InputTypes.RAW)

                break
            case BlockTypes.ITEM_OF_LIST:
                base.fields.LIST = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.INDEX = inputToJSON(this.inputs[1], InputTypes.INTEGER)

                break
            case BlockTypes.SET_VARIABLE_TO:
                base.fields.VARIABLE = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.VALUE = inputToJSON(this.inputs[1], InputTypes.STRING)

                break
            case BlockTypes.DEFINITION:
                base.inputs.custom_block = [
                    1,
                    inputToJSON(this.inputs[0], InputTypes.RAW)
                ]

                break
            case BlockTypes.PROTOTYPE:
                base.mutation = {
                    tagName: 'mutation',
                    children: [],
                    proccode: inputToJSON(this.inputs[0], InputTypes.RAW),
                    argumentids: '[]',
                    argumentnames: '[]',
                    argumentdefaults: '[]',
                    warp: 'true'
                }

                base.shadow = true

                break
            case BlockTypes.CALL:
                base.mutation = {
                    tagName: 'mutation',
                    children: [],
                    proccode: inputToJSON(this.inputs[0], InputTypes.RAW),
                    argumentids: '[]',
                    warp: 'true'
                }

                break
            case BlockTypes.STOP_THIS:
                base.fields.STOP_OPTION = [ 'this script', null ]
                
                break
            case BlockTypes.IF:
                base.inputs.CONDITION = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.SUBSTACK = inputToJSON(this.inputs[1], InputTypes.RAW)

                break
            case BlockTypes.UNTIL:
                base.inputs.CONDITION = inputToJSON(this.inputs[0], InputTypes.RAW)
                base.inputs.SUBSTACK = inputToJSON(this.inputs[1], InputTypes.RAW)

                break
            case BlockTypes.EQUALS:
                base.inputs.OPERAND1 = inputToJSON(this.inputs[0], InputTypes.STRING)
                base.inputs.OPERAND2 = inputToJSON(this.inputs[1], InputTypes.STRING)

                break
            case BlockTypes.LESS_THAN:
                base.inputs.OPERAND1 = inputToJSON(this.inputs[0], InputTypes.STRING)
                base.inputs.OPERAND2 = inputToJSON(this.inputs[1], InputTypes.STRING)

                break
        }

        let packaged: any = {}

        packaged[this.ID] = base

        return packaged
    }
}