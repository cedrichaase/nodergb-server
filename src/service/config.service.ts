interface Device {
    id: string,
    address: string
}

export class ConfigService {
    private devices;

    constructor() {
        this.devices = require('../../config/devices.json').devices;

        console.log(this.devices);
    }

    /**
     * Returns the IP Address of the device with given deviceId
     *
     * @param deviceId
     * @returns {string}
     * @throws Error
     */
    public getIpForDeviceId(deviceId: string) {
        const device = this.devices.find((device: Device) => device.id == deviceId);
        const address = device.address;

        if(!address) {
            throw new Error('Device not found!');
        }

        return address;
    }
}