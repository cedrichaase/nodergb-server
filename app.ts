import container from './src/app/container';

container.resolve('httpModule').init();
container.resolve('udpModule').init();
container.resolve('discoveryModule').init();
