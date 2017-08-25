import {RgbClient} from '../client/rgb.client';
import {ConfigService} from '../service/config.service';
import {HttpModule} from './modules/http';
import {DiscoveryModule} from './modules/discovery';
import {RgbRealtimeModule} from './modules/udp';
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
    httpModule: asClass(HttpModule)
});
container.register({
    udpModule: asClass(RgbRealtimeModule)
});
container.register({
    discoveryModule: asClass(DiscoveryModule)
});

export default container;
