window.addEventListener('load', Ready)
function Ready() {

    tinymce.init({ selector: '#veil textarea' })
    tinymce.activeEditor.theme.resizeTo(700, 500)

    $G.dPrzebieg = document.getElementById('przebieg')
    $G.dObecnie = document.getElementById('obecnie')
    $G.dVeil = document.getElementById('veil')
    $G.dEditAccept = document.getElementById('edit-accept')
    $G.dEditCancel = document.getElementById('edit-cancel')
    $G.dEditBox = document.getElementById('edit-container')

    var selectionHandler = new Selection()

    document.getElementById('room-accept').addEventListener('click', function () {
        var roomName = document.getElementById('room-name').value
        if (roomName.length) {
            $G.roomName = document.getElementById('room-name').value
            FetchInitialData()
            // te dwie rzeczy dopiero po odebraniu danych z serwera
            document.getElementById('choose-room').style.display = 'none'
            $G.dVeil.style.display = 'none'
        }
    })

    document.getElementById('new-note-btn').addEventListener('click', function () {
        var n = new Note()
        $G.notes.push(n)

        n.container.addEventListener('delete', function () {
            //$G.obecnie--
            //UpdateStats()

            var tmp_arrNotes = []
            for (var i = 0; i < $G.notes.length; i++) {
                if ($G.notes[i].id != n.id) tmp_arrNotes.push($G.notes[i])
            }
            $G.notes = tmp_arrNotes
        })
    })

    window.onbeforeunload = function () {
        if ($G.nActiveNetworkOperations > 0) {
            return 'Updating your notes is still in progress, if you leave now, last changes will be lost.'
        } else return;
    }
}

function UpdateStats() {
    $G.dPrzebieg.innerHTML = $G.przebieg
    $G.dObecnie.innerHTML = $G.obecnie
}

$G = {
    roomName: '',
    notes: [],
    przebieg: 0,
    obecnie: 0,
    dPrzebieg: null,
    dObecnie: null,
    dVeil: null,
    dEditCancel: null,
    dEditAccept: null,
    dEditBox: null,
    nActiveNetworkOperations: 0,
    fewActive: false,
    selectedNotes: [],
}

function setAllNotesNotActive() {
    for (var i = 0; i < $G.notes.length; i++) {
        if ($G.notes[i].container.className.indexOf('active') != -1) {
            $G.notes[i].container.className = $G.notes[i].container.className.replace('active', '').trim()
        }
        //$G.fewActive = false
        $G.selectedNotes = []
    }
}

function isIn(A_VAL, A_ARR) {
    for (var i = 0; i < A_ARR.length; i++)
        if (A_ARR[i] === A_VAL)
            return true
    return false
}

function FetchInitialData() {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var response = JSON.parse(xhttp.responseText)

            for (var i = 0; i < response.notes.length; i++) {
                $G.notes.push( new Note(response.notes[i]) )
            }
            $G.przebieg = response.run
            UpdateStats()
        }
    }
    xhttp.open('POST', window.location.hostname + window.location.pathname + 'initial_data_request')
    xhttp.send($G.roomName)
}