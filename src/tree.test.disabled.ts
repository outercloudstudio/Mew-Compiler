import { buildTree } from './tree'
import { tokenize } from './tokenizer'
const util = require('util')

test('Build var int mao = 1', () => {
    expect(buildTree(tokenize(`var int mao = 1`))).toStrictEqual([
        {
            type: 'definition',
            content: {
                word: {
                    content: 'var',
                    type: 'tag',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 3
                    }
                },
                type: {
                    content: 'int',
                    type: 'type',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 5,
                        end: 7
                    }
                },
                name: {
                    content: 'mao',
                    type: 'name',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 9,
                        end: 11
                    }
                },
                value: {
                    content: '1',
                    type: 'int',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 15,
                        end: 15
                    }
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 15
            }
        }
    ])
})

test('Build 1.2+2', () => {
    expect(buildTree(tokenize(`1.2+2`))).toStrictEqual([
        {
            type: 'operation',
            content: {
                operator: {
                    content: '+',
                    type: 'operator',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 4,
                        end: 4
                    }
                },
                values: [
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
                    },
                    {
                        content: '2',
                        type: 'int',
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 5,
                            end: 5
                        }
                    }
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 5
            }
        }
    ])
})

test('Build (float)1', () => {
    expect(buildTree(tokenize(`(float)1`))).toStrictEqual([
        {
            type: 'operation',
            content: {
                operator: {
                    content: {
                        content: 'float',
                        type: 'type',
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 2,
                            end: 6
                        }
                    },
                    type: 'cast',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 7
                    }
                },
                values: [
                    {
                        content: '1',
                        type: 'int',
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 8,
                            end: 8
                        }
                    }
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 8
            }
        }
    ])
})

test('Build 1!=2', () => {
    expect(buildTree(tokenize(`1!=2`))).toStrictEqual([
        {
            type: 'operation',
            content: {
                operator: {
                    content: '!=',
                    type: 'operator',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 2,
                        end: 3
                    }
                },
                values: [
                    {
                        content: '1',
                        type: 'int',
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
                        content: '2',
                        type: 'int',
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 4,
                            end: 4
                        }
                    }
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 4
            }
        }
    ])
})

test('Build (int fur, int claw) {1}', () => {
    expect(buildTree(tokenize(`(int fur, int claw) {1}`))).toStrictEqual([
        {
            type: 'block',
            content: {
                params: [
                    {
                        type: 'param definition',
                        content: {
                            type: {
                                content: 'int',
                                type: 'type',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 2,
                                    end: 4
                                }
                            },
                            name: {
                                content: 'fur',
                                type: 'name',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 6,
                                    end: 8
                                }
                            }
                        },
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 2,
                            end: 8
                        }
                    },
                    {
                        type: 'param definition',
                        content: {
                            type: {
                                content: 'int',
                                type: 'type',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 11,
                                    end: 13
                                }
                            },
                            name: {
                                content: 'claw',
                                type: 'name',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 15,
                                    end: 18
                                }
                            }
                        },
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 11,
                            end: 18
                        }
                    }
                ],
                content: [
                    {
                        content: '1',
                        type: 'int',
                        lines: {
                            start: 1,
                            end: 1
                        },
                        columns: {
                            start: 22,
                            end: 22
                        }       
                    }
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 23
            }
        }
    ])
})

test('Build function int mew() {}', () => {
    expect(buildTree(tokenize(`function int mew() {}`))).toEqual([
        {
            type: 'definition',
            content: {
                word: {
                    content: 'function',
                    type: 'descriptor',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 8
                    }
                },
                type: {
                    content: 'int',
                    type: 'type',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 10,
                        end: 12
                    }
                },
                name: {
                    content: 'mew',
                    type: 'name',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 14,
                        end: 16
                    }
                },
                value: {
                    type: 'block',
                    content: {
                        params: [],
                        content: []
                    },
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 17,
                        end: 21
                    }
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 21
            }
        }
    ])
})

test('Build func(1)', () => {
    expect(buildTree(tokenize(`func(1)`))).toStrictEqual([
        {
            type: 'call',
            content: {
                name: {
                    type: 'name',
                    content: 'func',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 4
                    }
                },
                params: [
                    [
                        {
                            content: '1',
                            type: 'int',
                            lines: {
                                start: 1,
                                end: 1
                            },
                            columns: {
                                start: 6,
                                end: 6
                            }       
                        }
                    ]
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 7
            }
        }
    ])
})

test('Build func(1,)', () => {
    expect(buildTree(tokenize(`func(1,)`))).toStrictEqual([
        {
            type: 'call',
            content: {
                name: {
                    type: 'name',
                    content: 'func',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 4
                    }
                },
                params: [
                    [
                        {
                            content: '1',
                            type: 'int',
                            lines: {
                                start: 1,
                                end: 1
                            },
                            columns: {
                                start: 6,
                                end: 6
                            }       
                        },
                        {
                            content: ',',
                            type: 'symbol',
                            lines: {
                                start: 1,
                                end: 1
                            },
                            columns: {
                                start: 7,
                                end: 7
                            }       
                        }
                    ],
                    []
                ]
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 8
            }
        }
    ])
})

test('Build a = 1', () => {
    expect(buildTree(tokenize(`a = 1`))).toStrictEqual([
        {
            type: 'assignment',
            content: {
                name: {
                    content: 'a',
                    type: 'name',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 1,
                        end: 1
                    }
                },
                content: {
                    content: '1',
                    type: 'int',
                    lines: {
                        start: 1,
                        end: 1
                    },
                    columns: {
                        start: 5,
                        end: 5
                    }
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 5
            }
        }
    ])
})

test('Build return 1', () => {
    expect(buildTree(tokenize(`return 1`))).toStrictEqual([
        {
            type: 'return',
            content: {
                content: '1',
                type: 'int',
                lines: {
                    start: 1,
                    end: 1
                },
                columns: {
                    start: 8,
                    end: 8
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 8
            }
        }
    ])
})

test('Build return void', () => {    
    expect(buildTree(tokenize(`return void`))).toStrictEqual([
        {
            type: 'return',
            content: {
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
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 11
            }
        }
    ])
})

test('Build if(true) {}', () => {
    expect(buildTree(tokenize(`if(true) {}`))).toStrictEqual([
        {
            type: 'if',
            content: {
                content:  {
                    params: [
                        [
                            {
                                content: 'true',
                                type: 'bool',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 4,
                                    end: 7
                                }
                            }
                        ]
                    ],
                    content: []
                },
                type: 'block',
                lines: {
                    start: 1,
                    end: 1
                },
                columns: {
                    start: 3,
                    end: 11
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 11
            }
        }
    ])
})

test('Build while(true) {}', () => {
    expect(buildTree(tokenize(`while(true) {}`))).toStrictEqual([
        {
            type: 'while',
            content: {
                content:  {
                    params: [
                        [
                            {
                                content: 'true',
                                type: 'bool',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 7,
                                    end: 10
                                }
                            }
                        ]
                    ],
                    content: []
                },
                type: 'block',
                lines: {
                    start: 1,
                    end: 1
                },
                columns: {
                    start: 6,
                    end: 14
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 14
            }
        }
    ])
})

test('Build for(true) {}', () => {
    expect(buildTree(tokenize(`for(true) {}`))).toStrictEqual([
        {
            type: 'for',
            content: {
                content:  {
                    params: [
                        [
                            {
                                content: 'true',
                                type: 'bool',
                                lines: {
                                    start: 1,
                                    end: 1
                                },
                                columns: {
                                    start: 5,
                                    end: 8
                                }
                            }
                        ]
                    ],
                    content: []
                },
                type: 'block',
                lines: {
                    start: 1,
                    end: 1
                },
                columns: {
                    start: 4,
                    end: 12
                }
            },
            lines: {
                start: 1,
                end: 1
            },
            columns: {
                start: 1,
                end: 12
            }
        }
    ])
})

test('Build a.b', () => {
    expect(buildTree(tokenize(`a.b`))).toStrictEqual([
        {
            type: 'name',
            content: 'a.b',
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