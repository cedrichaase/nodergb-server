import {ConfigService} from '../../service/config.service';
import {RgbClient} from '../../client/rgb.client';
import * as express from 'express';
import {ColorData} from '../../interfaces/color-data';
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

module.exports = ({configService, rgbClient}) => {
    const config = configService;
    const rgb = rgbClient;

    return () => {
        let lastColor = {};
        for (const device of config.getDevices()) {
            lastColor[device.id] = 'fff';
        }

        /**
         * enable CORS
         */
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        /**
         * GET list of IDs of managed devices
         */
        app.get('/devices', (req: express.Request, res: express.Response) => {
            let devices = config.getDevices();

            devices = devices
                .filter(d => !d.hidden)
                .map(device => {
                    device['color'] = `#${lastColor[device.id]}`;
                    return device;
                });

            res.status(200);
            res.send(devices);
        });


        io.on('connection', function(socket) {
            console.log('a client connected');

            socket.on('disconnect', function() {
                console.log('client disconnected');
            });

            /**
             * handle color data
             */
            socket.on('set-color', (data: ColorData) => {
                // extract the data as required by UDP interface
                let hostdata = data.device.split('.');

                const host = hostdata.shift();

                let new_hostdata = hostdata.join('.');

                const address = config.getIpForDeviceId(host);
                const color = `${data.color}\n`;

                lastColor[data.device] = data.color;

                // send the data via UDP
                rgb.setColor(address, color, new_hostdata);
                socket.broadcast.emit('color', data);
            });
        });

        http.listen(3000, function() {
            console.log('nodergb server listening on port 3000!');
        });
    };
};
