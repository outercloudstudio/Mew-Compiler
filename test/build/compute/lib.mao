{
  "tree": [
    {
      "type": "import",
      "content": {
        "content": "libBase",
        "type": "string",
        "lines": {
          "start": 1,
          "end": 1
        },
        "columns": {
          "start": 8,
          "end": 16
        }
      },
      "lines": {
        "start": 1,
        "end": 1
      },
      "columns": {
        "start": 1,
        "end": 16
      },
      "computedType": {}
    },
    {
      "type": "definition",
      "content": {
        "word": {
          "content": "function",
          "type": "descriptor",
          "lines": {
            "start": 5,
            "end": 5
          },
          "columns": {
            "start": 21,
            "end": 28
          }
        },
        "type": {
          "content": "void",
          "type": "type",
          "lines": {
            "start": 5,
            "end": 5
          },
          "columns": {
            "start": 30,
            "end": 33
          }
        },
        "name": {
          "content": "moveLib",
          "type": "name",
          "lines": {
            "start": 5,
            "end": 5
          },
          "columns": {
            "start": 35,
            "end": 41
          }
        },
        "value": {
          "type": "block",
          "content": {
            "params": [],
            "content": [
              {
                "type": "call",
                "content": {
                  "name": {
                    "content": "move",
                    "type": "name",
                    "lines": {
                      "start": 7,
                      "end": 7
                    },
                    "columns": {
                      "start": 52,
                      "end": 55
                    },
                    "computedType": {
                      "returnType": {},
                      "paramTypes": [
                        {},
                        {}
                      ]
                    }
                  },
                  "params": [
                    [
                      {
                        "content": "1",
                        "type": "int",
                        "lines": {
                          "start": 7,
                          "end": 7
                        },
                        "columns": {
                          "start": 57,
                          "end": 57
                        },
                        "computedType": {}
                      },
                      {
                        "content": ",",
                        "type": "symbol",
                        "lines": {
                          "start": 7,
                          "end": 7
                        },
                        "columns": {
                          "start": 58,
                          "end": 58
                        }
                      }
                    ],
                    [
                      {
                        "content": "0",
                        "type": "int",
                        "lines": {
                          "start": 7,
                          "end": 7
                        },
                        "columns": {
                          "start": 60,
                          "end": 60
                        },
                        "computedType": {}
                      }
                    ]
                  ]
                },
                "lines": {
                  "start": 7,
                  "end": 7
                },
                "columns": {
                  "start": 52,
                  "end": 61
                },
                "computedType": {}
              }
            ]
          },
          "lines": {
            "start": 5,
            "end": 9
          },
          "columns": {
            "start": 42,
            "end": 64
          },
          "computedType": {}
        }
      },
      "lines": {
        "start": 5,
        "end": 9
      },
      "columns": {
        "start": 21,
        "end": 64
      },
      "computedType": {
        "returnType": {},
        "paramTypes": []
      }
    }
  ],
  "exportNames": {
    "moveLib": {
      "returnType": {},
      "paramTypes": []
    }
  }
}