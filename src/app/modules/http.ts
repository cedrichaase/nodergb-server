import {ConfigService} from '../../service/config.service';
import {RgbClient} from '../../client/rgb.client';
import * as express from 'express';
import {ColorData} from '../../interfaces/color-data';
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

export class HttpModule implements Module {
    private config: ConfigService;
    private rgb: RgbClient;
    private port: number;

    constructor({configService, rgbClient, httpPort}) {
        this.config = configService;
        this.rgb = rgbClient;
        this.port = httpPort;
    }

    public init() {
        let lastColor = {};
        for (const device of this.config.getDevices()) {
            lastColor[device.id] = 'fff';
        }

        HttpModule.enableCors(app);

        /**
         * GET list of IDs of managed devices
         */
        app.get('/devices', (req: express.Request, res: express.Response) => {
            let devices = this.config.getDevices();

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

                const address = this.config.getIpForDeviceId(host);
                const color = `${data.color}\n`;

                lastColor[data.device] = data.color;

                // send the data via UDP
                this.rgb.setColor(address, color, new_hostdata);
                socket.broadcast.emit('color', data);
            });
        });

        http.listen(this.port, () => {
            console.log(`nodergb server listening on port ${this.port}!`);
        });
    }

    private static enableCors(app) {
        app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });
    }
}
