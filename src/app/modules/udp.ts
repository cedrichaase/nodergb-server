import {RgbClient} from '../../client/rgb.client';
const dgram = require('dgram');

export class RgbRealtimeModule implements Module {
    private rgb: RgbClient;
    private socket;

    constructor({rgbClient}) {
        this.rgb = rgbClient;
        this.socket = dgram.createSocket('udp4');
    }

    public init() {
        this.socket.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            this.socket.close();
        });

        this.socket.on('message', (message, rinfo) => {
            message = String(message).split(':');
            const color = message.pop();

            let hostdata = message.pop();
            if (hostdata) {
                hostdata = hostdata.split('.');
                const host = hostdata.shift();
                hostdata = hostdata.join('.');

                this.rgb.setColorById(host, color, hostdata);

                return;
            }

            this.rgb.broadcastColor(color);
        });

        this.socket.on('listening', () => {
            let address = this.socket.address();
            console.log(`server listening ${address.address}:${address.port}`);
        });

        this.socket.bind(1337);
    }
}
