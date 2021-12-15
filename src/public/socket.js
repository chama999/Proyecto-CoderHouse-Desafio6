const socket = io.connect();


// Escuchando el evento 'diego'
socket.on("message", data => {
;
    data= `<br/> <span style="color:blue;font-weight:bold"> ${data.user} </span> - <span style="color:darkolivegreen;font-weight:bold"> ${data.date} </span> - <span style="color:black;font-weight:bold"> ${data.message}</span>`;

    $("#chat").append(data)
})

    $("#btn").click(emitir);


// Emite mensaje al servidor
function emitir() {
    user= $("#user").val();
    let msn = {
        date: new Date().toLocaleTimeString(),
        message: $("#msn")[0].value,
        user: user
    }

    socket.emit("message", msn);

    $("#msn")[0].value = "";
}