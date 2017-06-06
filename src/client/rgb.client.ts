import * as dgram from "dgram";
import {ConfigService} from "../service/config.service";

export class RgbClient {
    private socket;

    constructor(
        private port: number,
        private config: ConfigService
    ) {
        this.socket = dgram.createSocket('udp4');
    }

    /**
     * Send a color to a single host identified by IP address
     *
     * @param address
     * @param color
     */
    public setColor(address, color, hostdata=null) {
        const payload = hostdata ? `${hostdata}:${color}` : color;
        console.log(address, payload);
        this.socket.send(payload, this.port, address, err => {
            if(err) return;
            // this.socket.close();
        });
    }

    /**
     * Send a color to a single host identified by device ID
     *
     * @param id
     * @param color
     */
    public setColorById(id, color, hostdata=null) {
        const ip = this.config.getIpForDeviceId(id);
        this.setColor(ip, color, hostdata);
    }

    /**
     * Broadcast a color to all configured hosts
     *
     * @param color
     */
    public broadcastColor(color) {
        const ids = this.config.getDeviceIds();
        ids.forEach(id => this.setColorById(id, color));
    }
}