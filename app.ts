const dgram = require('dgram');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a client connected');

    socket.on('disconnect', function(){
        console.log('client disconnected');
    });

    socket.on('set-color', color => {
        const rgbClient = dgram.createSocket('udp4');
        rgbClient.send(`${color}\n`, 1337, '192.168.7.199', err => {
            if(err) return;
            rgbClient.close();
        });
    });
});


http.listen(3000, function () {
    console.log('nodergb server listening on port 3000!');
});
