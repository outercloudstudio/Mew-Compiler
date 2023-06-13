costume 'Pipe.png'

import Sprite
import Scratch

var int yPos = 240
Sprite.goTo(240, 0)

function void update() {
    var bool set = true

    if(game) {
        set = false

        if(yPos < -239) {
            yPos = 240
            Sprite.goTo(240, 0)
        }

        yPos = yPos + -4
        Sprite.goTo(yPos, 0)
    }

    if(set) {
        yPos = 240
        Sprite.goTo(240, 0)
    }
}