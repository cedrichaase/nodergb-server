import {RgbClient} from '../client/rgb.client';
import {ConfigService} from '../service/config.service';
const awilix = require('awilix');
const { createContainer, asClass, asValue, asFunction } = awilix;

const container = createContainer();

container.register({
    rgbClient: asClass(RgbClient).singleton()
});
container.register({
    configService: asClass(ConfigService).singleton()
});
container.register({
    httpPort: asValue(3000)
});
container.register({
    rgbRealtimePort: asValue(1337)
});

container.register({
    httpModule: asFunction(require('./modules/http'))
});
container.register({
    udpModule: asFunction(require('./modules/udp'))
});
container.register({
    discoveryModule: asFunction(require('./modules/discovery'))
});

export default container;
