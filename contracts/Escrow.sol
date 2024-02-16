//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}




contract Escrow {
    address public lender;
    address payable public seller;
    address public inspector;
    address public nftAddress;

    modifier onlyselller() {
        require(msg.sender == seller, "Only sneder can call this function");
        _;
    }
    modifier onlybuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only sbuyer can call this function");
        _;
    }

    modifier onlyinspector {
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }

    mapping(uint256 => bool) public islisted;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;



    constructor(address _nftAddress, address payable _seller, address _inspector, address _lender) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
        
    }

    function list(uint256 _nftID, uint256 _purchaseprice, address _buyer,uint256 _escrowamount) public payable  onlyselller() {
        //Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        islisted[_nftID] = true;

        purchasePrice[_nftID] = _purchaseprice;
        escrowAmount[_nftID] = _escrowamount;
        buyer[_nftID] = _buyer; 

    }
    function depositEarnest(uint256 _nftID) public payable onlybuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);

    }

    function passedInspection(uint256 _nftID, bool _passed) public onlyinspector() {
        inspectionPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);

        require(address(this).balance >= purchasePrice[_nftID]);

        (bool success, ) = payable(seller).call{ value: address(this).balance}(
            ""
        );
        require(success);
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    receive() external payable {}

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }



}
