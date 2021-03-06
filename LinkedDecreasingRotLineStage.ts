const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class LinkedDecreasingRotLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedDRL : LinkedDRL = new LinkedDRL()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedDRL.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedDRL.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedDRL.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage = new LinkedDecreasingRotLineStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0

    dir : number = 0

    prevScale : number = 0

    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb()

        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class DRLNode {
    prev : DRLNode

    next : DRLNode

    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new DRLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = (2 * (w * 0.9)) / nodes
        const index = this.i % 2, index2 = (this.i + 1) % 2
        const x : number = Math.floor((this.i)/2) * gap + gap * (index + index2)
        context.strokeStyle = 'teal'
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.save()
        context.translate(x, h/2)
        context.rotate(Math.PI/2 * this.state.scale)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(-gap  * index2, -gap * index)
        context.stroke()
        context.restore()
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedDRL {

    curr : DRLNode = new DRLNode(0)

    dir : number = 1

    draw(canvas : CanvasRenderingContext2D) {
        this.curr.draw(canvas)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}
