import { simpleTokenize, classifyTokens, buildNativeTypes, tokenize } from './tokenizer'

test('Find Tokens (Expression)', () => {
    expect(simpleTokenize(`1+ 2 `)).toStrictEqual([
        {
            content: '1',
            type: 'unkown',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 1
            }
        },
        {
            content: '+',
            type: 'unkown',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 2,
                end: 2
            }
        },
        {
            content: '2',
            type: 'unkown',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 4,
                end: 4
            }
        },
    ])
})

test('Full Tokenize', () => {
    expect(tokenize(`1.2`)).toStrictEqual([
        {
            content: '1.2',
            type: 'float',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 3
            }
        }
    ])
})

test('Tokenize return void', () => {
    expect(tokenize(`return void`)).toStrictEqual([
        {
            content: 'return',
            type: 'verb',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 6
            }
        },
        {
            content: 'void',
            type: 'type',
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 8,
                end: 11
            }
        }
    ])
})