function Note(oImportData) {
    var bImport = false
    if (oImportData)
        bImport = true

    if (!bImport) {
        var o = {
            id: Math.random().toString(36).substring(10),
            width: 350,
            height: 400,
            x: (innerWidth - 350) / 2,
            y: (innerHeight - 400) / 2,
            container: null,
            content: '',
            JSONExport: JSONExport,
        }
    } else {
        var o = {
            id: oImportData.id,
            width: oImportData.width,
            height: oImportData.height,
            x: oImportData.x,
            y: oImportData.y,
            container: null,
            content: oImportData.content,
            JSONExport: JSONExport,
        }
    }
    var bIsDragged = false
    var bIsResized = false
    var initialPos = null
    var handlers = {
        noteContainer: null,
        move: null,
        resize: null,
        del: null,
        body: null,
    }

    Create()

    return o

    /////////////////////////////////

    function Create() {
        setAllNotesNotActive()

        // create main note DIV
        var el = document.createElement('div')
        el.className = 'note active'
        el.style.top = o.y + 'px'
        el.style.left = o.x + 'px'
        el.style.width = o.width + 'px'
        el.style.height = o.height + 'px'

        // create body
        handlers.body = document.createElement('div')
        handlers.body.className = 'body'
        handlers.body.innerHTML = o.content
        el.appendChild(handlers.body)

        // create footer
        var footer = document.createElement('div')
        footer.className = 'footer'
        footer.setAttribute('title', 'id: ' + o.id)

        // moving note
        /*
        handlers.move = document.createElement('img')
        handlers.move.src = 'media/move.png'
        handlers.move.setAttribute('draggable', 'false')
        handlers.move.style.cursor = 'move'
        footer.appendChild(handlers.move)
        */
        handlers.body.addEventListener('mousedown', function () {
            bIsDragged = true
            window.addEventListener('mousemove', HandleMovement)
        })
        window.addEventListener('mouseup', function () {
            if (bIsDragged) {
                initialPos = null
                window.removeEventListener('mousemove', HandleMovement)
                bIsDragged = false
                UploadNoteData('pos')
            }
        })

        // resizing note
        handlers.resize = document.createElement('img')
        handlers.resize.src = 'media/resize.png'
        //handlers.resize.setAttribute('draggable', 'false')
        handlers.resize.addEventListener('mousedown', function (e) { e.preventDefault() })
        handlers.resize.style.cursor = 'se-resize'
        footer.appendChild(handlers.resize)
        handlers.resize.addEventListener('mousedown', function () {
            bIsResized = true
            window.addEventListener('mousemove', HandleMovement)
        })
        window.addEventListener('mouseup', function () {
            if (bIsResized) {
                initialPos = null
                window.removeEventListener('mousemove', HandleMovement)
                bIsResized = false
                UploadNoteData('size')
            }
        })

        // delete
        handlers.del = document.createElement('img')
        handlers.del.src = 'media/delete.png'
        //handlers.del.setAttribute('draggable', 'false')
        handlers.del.addEventListener('mousedown', function (e) { e.preventDefault() })
        footer.appendChild(handlers.del)
        handlers.del.addEventListener('click', function () {
            var event = new Event('delete')
            o.container.dispatchEvent(event)
            o.container.parentElement.removeChild(o.container)
            DeleteNoteData()
            $G.obecnie--
            UpdateStats()
        })

        // edit
        handlers.edit = document.createElement('img')
        handlers.edit.src = 'media/edit.png'
        //handlers.edit.setAttribute('draggable', 'false')
        handlers.edit.addEventListener('mousedown', function (e) { e.preventDefault() })
        footer.appendChild(handlers.edit)
        handlers.edit.addEventListener('click', HandleEdit)

        // append footer
        el.appendChild(footer)

        // active note
        el.addEventListener('mousedown', function (e) {
            setAllNotesNotActive()
            el.className += ' active'

            if (e.target.tagName.toLocaleLowerCase() != 'img') {
                //magick trick:
                parent = el.parentNode
                el.parentNode.removeChild(el)
                parent.appendChild(el)
            }
        })

        // append main note DIV to body
        document.body.appendChild(el)
        handlers.noteContainer = el
        o.container = el

        // update it it's not from import
        if (!bImport) {
            UploadNoteData('full')
        }

        // stats
        $G.przebieg++
        $G.obecnie++
        UpdateStats()
    }

    function HandleMovement(A_oE) {
        if (!initialPos) {
            initialPos = {
                x: A_oE.clientX,
                y: A_oE.clientY,
            }
        }
        if (bIsDragged) {
            handlers.noteContainer.style.top = o.y + A_oE.clientY - initialPos.y + 'px'
            handlers.noteContainer.style.left = o.x + A_oE.clientX - initialPos.x + 'px'

            o.y += A_oE.clientY - initialPos.y
            o.x += A_oE.clientX - initialPos.x

            initialPos = {
                x: A_oE.clientX,
                y: A_oE.clientY,
            }
        }
        if (bIsResized) {
            if (o.width + A_oE.clientX - initialPos.x >= 200) {
                handlers.noteContainer.style.width = o.width + A_oE.clientX - initialPos.x + 'px'
                o.width += A_oE.clientX - initialPos.x
                initialPos.x = A_oE.clientX
            }
            if (o.height + A_oE.clientY - initialPos.y >= 200) {
                handlers.noteContainer.style.height = o.height + A_oE.clientY - initialPos.y + 'px'
                o.height += A_oE.clientY - initialPos.y
                initialPos.y = A_oE.clientY
            }
        }
    }

    function HandleEdit(A_oE) {
        tinyMCE.activeEditor.setContent(handlers.body.innerHTML, { format: 'raw' })

        $G.dVeil.style.display = 'block'
        $G.dEditBox.style.display = 'block'
        $G.dEditAccept.addEventListener('click', EditAccept)
        $G.dEditCancel.addEventListener('click', EditCancel)

        function EditAccept() {
            handlers.body.innerHTML = o.content = tinyMCE.activeEditor.getContent({ format: 'raw' })

            $G.dVeil.style.display = 'none'
            $G.dEditBox.style.display = 'none'
            $G.dEditAccept.removeEventListener('click', EditAccept)
            $G.dEditCancel.removeEventListener('click', EditCancel)

            UploadNoteData('content')
        }

        function EditCancel() {
            $G.dVeil.style.display = 'none'
            $G.dEditBox.style.display = 'none'
            $G.dEditAccept.removeEventListener('click', EditAccept)
            $G.dEditCancel.removeEventListener('click', EditCancel)
        }
        
    }

    function JSONExport(A_sOption) {
        /*
        * A_sOption: 'full', 'size', 'pos', 'content'
        */
        
        if (!isIn(A_sOption, ['size', 'pos', 'content', 'full', ])) {
            console.warn(`JSONExport assumed that by '${A_sOption}' you ment 'full'`)
            A_sOption = 'full'
        }

        var oExported = {}
        oExported.id = o.id
        oExported.roomName = $G.roomName

        if (isIn(A_sOption, ['full', 'size']) || !A_sOption) {
            oExported.width = o.width
            oExported.height = o.height
        }


        if (isIn(A_sOption, ['full', 'pos']) || !A_sOption) {
            oExported.x = o.x
            oExported.y = o.y
        }


        if (isIn(A_sOption, ['full', 'content']) || !A_sOption) {
            oExported.content = o.content
        }

        return JSON.stringify(oExported)
    }

    function UploadNoteData(A_sOption) {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) $G.nActiveNetworkOperations--
        }
        xhttp.open('POST', window.location.hostname + window.location.pathname + 'update_note_data')
        xhttp.send(o.JSONExport(A_sOption))
        $G.nActiveNetworkOperations++
    }

    function DeleteNoteData() {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) $G.nActiveNetworkOperations--
        }
        xhttp.open('POST', window.location.hostname + window.location.pathname + 'delete_note_data')
        xhttp.send(JSON.stringify({
            roomName: $G.roomName,
            id: o.id,
        }))
        $G.nActiveNetworkOperations++
    }
}