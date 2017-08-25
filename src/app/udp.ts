import {RgbClient} from '../client/rgb.client';
const dgram = require('dgram');

module.exports = ({rgbClient}) => {
    const rgb: RgbClient = rgbClient;
    const udp = dgram.createSocket('udp4');

    return () => {
        udp.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            udp.close();
        });

        udp.on('message', (message, rinfo) => {
            message = String(message).split(':');
            const color = message.pop();

            let hostdata = message.pop();
            if (hostdata) {
                hostdata = hostdata.split('.');
                const host = hostdata.shift();
                hostdata = hostdata.join('.');

                rgb.setColorById(host, color, hostdata);

                return;
            }

            rgb.broadcastColor(color);
        });

        udp.on('listening', () => {
            let address = udp.address();
            console.log(`server listening ${address.address}:${address.port}`);
        });

        udp.bind(1337);
    }
};
