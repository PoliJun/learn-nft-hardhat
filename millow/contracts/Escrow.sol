//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    // Move properties
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public lender;
    address public inspector;
    address payable public seller;
    address public nftAddress;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this function");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public price;
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

    // move property from owners wallet to anoter, we need the owner's consent.
    // Otherwise, anyone could take the property from the owner's wallet.
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        price[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID], "Deposit amount is not correct");
    }

    function updateInspectionStatus(uint256 _nftID, bool _status) public onlyInspector {
        inspectionPassed[_nftID] = _status;
    }

    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    /*   
      * Finlaize Sale
      TODO: Require inspection status(add more Items here like appraisal)
      TODO: Require sale to be authorized, buyer, seller, lender
      todo:require funds to be correct amount
      todo: transfer nft to buyer
      todo: transfer funds to seller 
      */
    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID], "Inspection not passed");
        require(approval[_nftID][buyer[_nftID]], "Buyer has not approved");
        require(approval[_nftID][seller], "Seller has not approved");
        require(approval[_nftID][lender], "Lender has not approved");
        require(address(this).balance >= price[_nftID], "Not enough funds to finalize sale");

        (bool success, ) = seller.call{ value: address(this).balance }("");
        require(success, "Transfer failed.");

        // transfer nft to buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel Sale(handle earnest deposit)
    // todo: if inspection has not passed, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (!inspectionPassed[_nftID]) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            seller.transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
