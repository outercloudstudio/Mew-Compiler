costume 'Bird.png'

import Sprite
import Scratch

var float yVelocity = 0

Sprite.goTo(0, 0)

function void update() {
    var bool set = true

    if(game) {
        set = false

        Sprite.move(0, yVelocity)

        if(Scratch.keyPressed('space')) {
            yVelocity = 10
        }

        yVelocity = yVelocity + -1

        if(Sprite.touching('pipe')) {
            game = false
        }
    }

    if(set) {
        yVelocity = 0
        Sprite.goTo(0, 0)
    }
}