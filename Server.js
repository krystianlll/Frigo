var http = require('http')
var fs = require('fs')
var qs = require('querystring')

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
    port = process.env.OPENSHIFT_NODEJS_PORT || '8080'

var oServer = http.createServer(HandleRequest)
oServer.listen(port, ip)

function HandleRequest(A_oReq, A_oRes) {
    if (/^\/$/i.test(A_oReq.url)) {
        ReadFile('index.html', 'text/html')
    } else if (/js\/main.js/i.test(A_oReq.url)) {
        ReadFile('js/main.js', 'application/javascript')
    } else if (/js\/Note.js/i.test(A_oReq.url)) {
        ReadFile('js/Note.js', 'application/javascript')
    } else if (/js\/Selection.js/i.test(A_oReq.url)) {
        ReadFile('js/Selection.js', 'application/javascript')
    } else if (/css\/note.css/i.test(A_oReq.url)) {
        ReadFile('css/note.css', 'text/css')
    } else if (/css\/main.css/i.test(A_oReq.url)) {
        ReadFile('css/main.css', 'text/css')
    } else if (/css\/MaterialDesignButton.css/i.test(A_oReq.url)) {
        ReadFile('css/MaterialDesignButton.css', 'text/css')
    } else if (/css\/selection.css/i.test(A_oReq.url)) {
        ReadFile('css/selection.css', 'text/css')
    } else if (/media\/delete.png/i.test(A_oReq.url)) {
        ReadFile('media/delete.png', 'image/png')
    } else if (/media\/edit.png/i.test(A_oReq.url)) {
        ReadFile('media/edit.png', 'image/png')
    } else if (/media\/resize.png/i.test(A_oReq.url)) {
        ReadFile('media/resize.png', 'image/png')
    }  else if (/initial_data_request/i.test(A_oReq.url)) {
        var body = ''
        A_oReq.on('data', function (data) { body += data })
        A_oReq.on('end', function () {
            PresentInitialData(A_oRes, body)
        })
    } else if (/update_note_data/i.test(A_oReq.url)) {
        var body = ''
        A_oReq.on('data', function (data) { body += data })
        A_oReq.on('end', function () {
            UpdateNoteData(body)
            A_oRes.writeHead(200, { 'Content-Type': 'text/plain' })
            A_oRes.end('')
        })
    } else if (/delete_note_data/i.test(A_oReq.url)) {
        var body = ''
        A_oReq.on('data', function (data) { body += data })
        A_oReq.on('end', function () {
            DeleteNoteData(body)
            A_oRes.writeHead(200, { 'Content-Type': 'text/plain' })
            A_oRes.end('')
        })
    } else {
        console.log(`Unknown request: ${A_oReq.url}`)
        A_oRes.writeHead(404, { 'Content-Type': 'text/html' })
        A_oRes.write('<h1>404</h1>')
        A_oRes.end()
    }

    function ReadFile(A_sPath, A_sMIME) {
        fs.readFile(A_sPath,
            function (A_error, A_data) {
                if (A_error) {
                    A_oRes.writeHead(404, { 'Content-Type': 'text/html' })
                    A_oRes.write('<h1>404</h1>')
                    A_oRes.end()
                    console.log(`Problem reading file`)
                } else {
                    A_oRes.writeHead(200, { 'Content-Type': A_sMIME })
                    A_oRes.write(A_data)
                    A_oRes.end()
                }
            }
        )
    }
}


var ROOMS = {}

function PresentInitialData(A_oRes, A_sRoomName) {
    var arrNotes = {
        run: 0,
        notes: [],
    }
    if (ROOMS[A_sRoomName]) {
        arrNotes = ROOMS[A_sRoomName]
    }
    A_oRes.writeHead(200, { 'Content-Type': 'text/plain' })
    A_oRes.write(JSON.stringify(arrNotes))
    A_oRes.end()
}

function DeleteNoteData(A_JSON_data) {
    try {
        var note = JSON.parse(A_JSON_data)
    } catch (e) {
        console.error('E1348: Problem reading data')
        return
    }

    if (ROOMS[note.roomName]) {
        var arrRoom = []
        var nDone = 0
        for (var i = 0; i < ROOMS[note.roomName].notes.length; i++) {
            if (ROOMS[note.roomName].notes[i].id != note.id) {
                arrRoom.push(ROOMS[note.roomName].notes[i])
                nDone++
            }
        }
        //if (nDone != ROOMS[note.roomName].notes.length) ROOMS[note.roomName].run -= (ROOMS[note.roomName].notes.length - nDone)
        ROOMS[note.roomName].notes = arrRoom
    }
}

function UpdateNoteData(A_JSON_data) {
    try {
        var note = JSON.parse(A_JSON_data)
    } catch (e) {
        console.error('E1348: Problem reading data')
        return
    }

    // room (by name)
    if (!ROOMS[note.roomName]) { // if it doesn't exist, create it
        ROOMS[note.roomName] = {
            run: 0,
            notes: []
        }
    }

    // note (by id)
    for (var i = 0; i < ROOMS[note.roomName].notes.length; i++) {
        var bFound = false
        var nFoundAt = -1
        if (ROOMS[note.roomName].notes[i].id == note.id) {
            bFound = true
            nFoundAt = i
            break
        }
    }
    if (!bFound) { // no note with this id
        ROOMS[note.roomName].notes.push(note)
        ROOMS[note.roomName].run++
        //RUN++
    } else { // update this note
        if (note.width) ROOMS[note.roomName].notes[nFoundAt].width = note.width
        if (note.height) ROOMS[note.roomName].notes[nFoundAt].height = note.height
        if (note.x) ROOMS[note.roomName].notes[nFoundAt].x = note.x
        if (note.y) ROOMS[note.roomName].notes[nFoundAt].y = note.y
        if (note.content) ROOMS[note.roomName].notes[nFoundAt].content = note.content
    }
}