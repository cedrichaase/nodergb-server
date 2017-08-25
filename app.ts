import container from './src/app/container';

container.resolve('httpModule')();
container.resolve('udpModule')();
container.resolve('discoveryModule')();
