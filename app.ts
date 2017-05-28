import {ConfigService} from "./src/service/config.service";
import * as express from 'express';
const dgram = require('dgram');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

/**
 * Interface for color data received via websocket
 */
interface ColorData {
    color: string,
    device: string
}

const config = new ConfigService();

let lastColor = {};
for (const device of config.getDevices()) {
    lastColor[device.id] = 'fff';
}

/**
 * enable CORS
 */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * GET list of IDs of managed devices
 */
app.get('/devices', (req: express.Request, res: express.Response) => {
    let devices = config.getDevices();

    devices = devices.map(device => {
        device['color'] = `#${lastColor[device.id]}`;
        return device;
    });

    res.status(200);
    res.send(devices);
});

/**
 * handle websocket stuff
 */
io.on('connection', function(socket){
    console.log('a client connected');

    socket.on('disconnect', function(){
        console.log('client disconnected');
    });

    /**
     * handle color data
     */
    socket.on('set-color', (data: ColorData) => {
        // extract the data as required by UDP interface
        const color = `${data.color}\n`;
        const address = config.getIpForDeviceId(data.device);

        // send the data via UDP
        const rgbClient = dgram.createSocket('udp4');
        rgbClient.send(color, 1337, address, err => {
            if(err) return;
            lastColor[data.device] = data.color;
            rgbClient.close();
        });
    });
});

http.listen(3000, function () {
    console.log('nodergb server listening on port 3000!');
});
