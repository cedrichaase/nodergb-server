import * as dgram from 'dgram';
import {ConfigService} from '../service/config.service';

export class RgbClient {
    private socket;
    private port: number;
    private config: ConfigService;

    constructor({rgbRealtimePort, configService}) {
        this.port = rgbRealtimePort;
        this.config = configService;

        this.socket = dgram.createSocket('udp4');
    }

    /**
     * Send a color to a single host identified by IP address
     */
    public setColor(address, color, hostdata = null) {
        const payload = hostdata ? `${hostdata}:${color}\n` : color;
        this.socket.send(payload, this.port, address, err => {
            if (err) {
                return;
            }
            // this.socket.close();
        });
    }

    /**
     * Send a color to a single host identified by device ID
     */
    public setColorById(id, color, hostdata = null) {
        const ip = this.config.getIpForDeviceId(id);
        this.setColor(ip, color, hostdata);
    }

    /**
     * Broadcast a color to all configured hosts
     */
    public broadcastColor(color) {
        const ids = this.config.getDeviceIds();
        ids.forEach(id => this.setColorById(id, color));
    }
}
