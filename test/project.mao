import Scratch

sprite 'sky'
sprite 'bird'
sprite 'pipe'

shared bool game = true

function void update() {
    var bool set = true

    if(game) {
        set = false
    }

    if(set) {
        if(Scratch.keyPressed('space')) {
            game = true
        }
    }
}