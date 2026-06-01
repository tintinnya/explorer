(function(root) {
    'use strict';

    var config = {
        explorerHost: '172.31.20.132',
        explorerPort: 8000,
        rpcHost: '172.31.20.132',
        rpcPort: 8545
    };

    config.explorerUrl = 'http://' + config.explorerHost + ':' + config.explorerPort;
    config.rpcUrl = 'http://' + config.rpcHost + ':' + config.rpcPort;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = config;
    }

    root.EXPLORER_CONFIG = config;
})(typeof window !== 'undefined' ? window : global);
