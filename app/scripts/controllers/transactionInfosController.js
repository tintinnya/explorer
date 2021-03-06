angular.module('ethExplorer')
    .controller('transactionInfosCtrl', function ($rootScope, $scope, $location, $routeParams,$q) {

       var web3 = $rootScope.web3;
	
        $scope.init=function()
        {
            $scope.txId=$routeParams.transactionId;

            if($scope.txId!==undefined) { // add a test to check if it match tx paterns to avoid useless API call, clients are not obliged to come from the search form...

                getTransactionInfos()
                    .then(function(result){
                        //TODO Refactor this logic, asynchron calls + services....
                        var number = web3.eth.blockNumber;

                    $scope.result = result;

                    if(result.blockHash!==undefined){
                        $scope.blockHash = result.blockHash;
                    }
                    else{
                        $scope.blockHash ='pending';
                    }
                    if(result.blockNumber!==undefined){
                        $scope.blockNumber = result.blockNumber;
			$scope.conf = number - $scope.blockNumber;
			if ($scope.conf===0) $scope.conf='unconfirmed';
                    }
                    else{
                        $scope.blockNumber ='pending';
			$scope.conf = 'unconfirmed';
                    }
                    $scope.from = result.from;
                    $scope.gas = result.gas;
                    $scope.gasPrice = result.gasPrice.c[0] + " WEI";
                    $scope.hash = result.hash;
                    $scope.input = result.input; // that's a string
		    $scope.inputFromHex = hex2a($scope.input);
                    $scope.nonce = result.nonce;
                    $scope.to = result.to;
                    $scope.transactionIndex = result.transactionIndex;
                    $scope.ethValue = result.value.c[0] / 10000; 
                    $scope.txprice = (result.gas * result.gasPrice)/1000000000000000000 + " ETH";
                        //TODO Refactor this logic, asynchron calls + services....
                    if($scope.blockNumber!==undefined){
                        var info = web3.eth.getBlock($scope.blockNumber);
                        if(info!==undefined){
                            $scope.time = new Date(info.timestamp * 1000).toUTCString();
                        }
                    }
	 	    if($scope.input!=='0x'){
			$scope.output = web3.eth.call({
    to: result.to,
    data: result.input
});
			$scope.outputFromHex = hex2a($scope.output);
		    } else {
			$scope.output = 'n/a'
			$scope.outputFromHex = 'n/a'
		    }
                });

            }



            else{
                $location.path("/"); // add a trigger to display an error message so user knows he messed up with the TX number
            }


            function getTransactionInfos(){
                var deferred = $q.defer();

                web3.eth.getTransaction($scope.txId,function(error, result) {
                    if(!error){
                        deferred.resolve(result);
                    }
                    else{
                        deferred.reject(error);
                    }
                });
                return deferred.promise;

            }



        };
        $scope.init();
        console.log($scope.result);


function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
	b = parseInt(hex.substr(i,2), 16)
	if ((b >= 32) && (b <= 127))
        	str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	else
		str += '.'
    }

    return str;
}

    });
