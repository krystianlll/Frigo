function Selection() {
    var initMousePos = {
            x: null,
            y: null,
        },
        size = {
            x: 0,
            y: 0,
        },
        topLeftPos = {
            x: 0,
            y: 0,
        },
        selectBox = null


    document.body.addEventListener('mousedown', OnMouseDown)

    /////////////////////


    function OnMouseDown(e) {

        if (e.target.tagName != 'BODY') return

        list = document.getElementsByClassName('selection-box')
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                list[i].parentNode.removeChild(list[i])
            }
        }

        initMousePos.x = e.clientX
        initMousePos.y = e.clientY
        selectBox = new SelectionBox()
        window.addEventListener('mousemove', OnMouseMove)
        window.addEventListener('mouseup', OnMouseUp)
    }

    function OnMouseMove(e) {
        var sizeX = Number(e.clientX) - Number(initMousePos.x)
        var sizeY = e.clientY - initMousePos.y
        selectBox.resize(sizeX, sizeY)
    }

    function OnMouseUp() {
        selectBox.destroy()
        selectBox = null
        window.removeEventListener('mousemove', OnMouseMove)
        window.removeEventListener('mouseup', OnMouseUp)
    }


    function SelectionBox() {
        var el
        this.resize = Resize
        this.destroy = Destroy
        this.checkCollisions = CheckCollisions
        Create()
        Resize(0, 0)

        ///////
        
        function Create() {
            el = document.createElement('div')
            el.className = 'selection-box'
            topLeftPos.x = initMousePos.x
            el.style.left = initMousePos.x + 'px'
            topLeftPos.y = initMousePos.y
            el.style.top = initMousePos.y + 'px'
            document.body.appendChild(el)

            el.addEventListener('mousedown', PreventDefault)
            el.addEventListener('mousemove', PreventDefault)
        }

        function Resize(sizeX, sizeY) {
            size.x = sizeX
            size.y = sizeY
            el.style.width = Math.abs(sizeX) + 'px'
            el.style.height = Math.abs(sizeY) + 'px'

            if (sizeX < 0) {
                topLeftPos.x = initMousePos.x + sizeX
                el.style.left = initMousePos.x + sizeX + 'px'
            }

            if (sizeY < 0) {
                topLeftPos.y = initMousePos.y + sizeY
                el.style.top = initMousePos.y + sizeY + 'px'
            }
        }

        function CheckCollisions() {
            var note, selectedNotes = []
            var list = document.querySelectorAll('body > .note')
            for (var i = 0; i < list.length; i++) {
                note = list[i].object

                if (Math.abs(size.x) - note.width - Math.abs(topLeftPos.x - note.x) > 0 &&
                    Math.abs(size.y) - note.height - Math.abs(topLeftPos.y - note.y) > 0 &&
                    note.x > topLeftPos.x &&
                    note.y > topLeftPos.y) {
                        // note is selected
                        selectedNotes.push(note)
                    }
            }
            setAllNotesNotActive()
            $G.selectedNotes = selectedNotes
            for (var i = 0; i < selectedNotes.length; i++) {
                note = selectedNotes[i]
                parent = note.container.parentNode
                note.container.parentNode.removeChild(note.container)
                parent.appendChild(note.container)
                note.container.classList.add('active')
            }
            $G.fewActive = true
        }

        function Destroy() {
            CheckCollisions()
            document.body.removeChild(el)
            el.removeEventListener('mousedown', PreventDefault)
            el.removeEventListener('mousemove', PreventDefault)
        }

        function PreventDefault(e) {
            e.preventDefault()
        }

    }
}