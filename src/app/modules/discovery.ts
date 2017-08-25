const dgram = require('dgram');

module.exports = () => {

    return () => {
        const udpDiscoverRecv = dgram.createSocket('udp4');

        udpDiscoverRecv.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            udpDiscoverRecv.close();
        });

        udpDiscoverRecv.on('message', (message, rinfo) => {
            message = message.toString().trim();

            console.log(`Received discover response: ${message}`);
        });

        udpDiscoverRecv.on('listening', () => {
            let address = udpDiscoverRecv.address();
            console.log(`server listening ${address.address}:${address.port}`);

            // send hello to broadcast
            const udpDiscoverSend = dgram.createSocket('udp4');

            udpDiscoverSend.on('listening', () => {
                udpDiscoverSend.setBroadcast(true);

                const port = 1341;
                const msg = 'hello';

                udpDiscoverSend.send(Buffer.from(msg), port, '255.255.255.255', (err) => {
                    console.log(`sent broadcast to port ${port}`);
                });
            });
            udpDiscoverSend.bind();

        });

        udpDiscoverRecv.bind(1340);
    };
};
