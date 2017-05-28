const fs = require('fs');

const configFilePath = `${process.cwd()}/config/devices.json`;

interface Device {
    id: string,
    address?: string,
    description: string,
    hidden?: boolean,
}

export class ConfigService {
    private devices;

    constructor() {
        console.log(configFilePath);
        this.devices = require(configFilePath).devices;

        // TODO: refactor this to use fs.watch at some point
        setInterval(() => this.refreshDevices(), 10000);
    }

    /**
     * Returns devices from config file
     *
     * @returns Device[]
     */
    public getDevices() {
        return this.devices.map((device: Device) => {
            let viewDevice = Object.assign({}, device);
            delete(viewDevice.address);
            return viewDevice;
        });
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

    /**
     * reload device info from config file
     */
    private refreshDevices() {
        fs.readFile(configFilePath, 'utf8', (err, data) => {
            if(err) console.log(err);
            this.devices = JSON.parse(data).devices;
        });
    }
}