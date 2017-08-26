const fs = require('fs');

const configFilePath = require('path').resolve(`${__dirname}/../../config/devices.json`);

interface Control {
    description: string;
    id?: string;
}

interface Device {
    id: string;
    address?: string;
    description: string;
    hidden?: boolean;
    controls: Control[];
}

export class ConfigService {
    private devices;

    constructor() {
        console.log(configFilePath);
        this.devices = require(configFilePath).devices;

        // TODO: refactor this to use fs.watch at some point
        setInterval(() => this.refreshDevices(), 10000);
    }

    public getDevices() {
        return this.devices.map((device: Device) => {
            let viewDevice = Object.assign({}, device);
            delete(viewDevice.address);

            if (device.controls) {
                device.controls = device.controls.map(c => {
                    // build ID from index if none is present
                    if (!c.id) { c.id = `${device.id}.${device.controls.indexOf(c)}` }
                    return c;
                })
            }

            return viewDevice;
        });
    }

    /**
     * Returns all device IDs from config file
     */
    public getDeviceIds() {
        return this.getDevices().map((device: Device) => device.id);
    }

    /**
     * Returns the IP Address of the device with given deviceId
     */
    public getIpForDeviceId(deviceId: string) {
        const device = this.devices.find((device: Device) => device.id === deviceId);
        const address = device.address;

        if (!address) {
            throw new Error('Device not found!');
        }

        return address;
    }

    /**
     * reload device info from config file
     */
    private refreshDevices() {
        fs.readFile(configFilePath, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            this.devices = JSON.parse(data).devices;
        });
    }
}
