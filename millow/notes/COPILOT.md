# Copilot

## Multiple Buyers

Problem code:

```solidity
// Cancel Sale(handle earnest deposit)
// todo: if inspection has not passed, then refund, otherwise send to seller
function cancelSale(uint256 _nftID) public {
    if (!inspectionPassed[_nftID]) {
        payable(buyer[_nftID]).transfer(address(this).balance);
    } else {
        seller.transfer(address(this).balance);
    }
}
```

The `cancelSale` function in your code indeed transfers the entire balance of the contract to either the buyer or the seller, depending on whether the inspection has passed.

However, if your contract is designed to handle multiple sales with multiple buyers and sellers, this could indeed be problematic. If there are multiple buyers who have deposited funds into the contract, transferring the entire balance to a single buyer or seller would not be fair or correct.

A better approach might be to keep track of how much each buyer has deposited, and only refund the appropriate amount when a sale is cancelled. You could do this by maintaining a mapping of buyer addresses to amounts:

```solidity
mapping(address => uint256) public deposits;
```

When a buyer deposits funds, you would update this mapping:

```solidity
deposits[buyer] += msg.value;
```

And when a sale is cancelled, you would only refund the amount that the buyer had deposited:

```solidity
uint256 refund = deposits[buyer];
deposits[buyer] = 0;
payable(buyer).transfer(refund);
```

This way, each buyer gets back exactly what they deposited, no more and no less.
