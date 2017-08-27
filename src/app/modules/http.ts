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

    private lastColor: any;

    constructor({configService, rgbClient, httpPort}) {
        this.config = configService;
        this.rgb = rgbClient;
        this.port = httpPort;

        let lastColor = {};
        for (const device of this.config.getDevices()) {

            for (const control of device.controls) {
                lastColor[control.id] = 'fff';
            }
            lastColor[device.id] = 'fff';
        }

        this.lastColor = lastColor;
    }

    public init() {
        HttpModule.enableCors(app);

        /**
         * GET list of IDs of managed devices
         */
        app.get('/devices', (req: express.Request, res: express.Response) => {
            let devices = this.config.getDevices();

            devices = devices
                .filter(d => !d.hidden)
                .map(device => {
                    device['color'] = `#${this.lastColor[device.id]}`;

                    if (device.controls) {
                        device.controls.forEach(control => {
                            control.color = `#${this.lastColor[control.id]}`;
                        });
                    }

                    return device;
                });

            res.status(200);
            res.send(devices);
        });


        io.on('connection', (socket) => {
            console.log('a client connected');

            socket.on('disconnect', () => {
                console.log('client disconnected');
            });

            /**
             * handle color data
             */
            socket.on('set-color', (data: ColorData) => {
                // extract the data as required by UDP interface
                let hostdata = data.device.split('.');

                const host = hostdata.shift();

                let new_hostdata = hostdata.join('.').trim();

                const address = this.config.getIpForDeviceId(host);
                const color = data.color;

                this.lastColor[data.device] = data.color;

                const controls = this.config.getControls(data.device);

                if (controls.length) {
                    controls.forEach(control => {
                        console.log(control.id);
                        this.lastColor[control.id] = data.color;
                    });
                }

                // send the data via UDP
                this.rgb.setColor(address, color, new_hostdata);
                // socket.broadcast.emit('color', data);
                io.sockets.emit('color', data);
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
