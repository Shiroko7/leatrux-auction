import OBR from "@owlbear-rodeo/sdk";

const ID = "com.auction";

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: `${ID}/context-menu`,
    icons: [
      {
        icon: "/auction.svg",
        label: "Add to Auction",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${ID}/metadata`], value: undefined },
          ],
        },
      },
      {
        icon: "/remove.svg",
        label: "Remove from Auction",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${ID}/metadata`], operator: "!=", value: undefined },
          ],
        },
      },
    ],
    onClick(context) {
      const addToAuction = context.items.every(
        (item) => item.metadata[`${ID}/metadata`] === undefined
      );
      
      if (addToAuction) {
        const startingBid = window.prompt("Enter starting bid in gold:");
        if (startingBid) {
          OBR.scene.items.updateItems(context.items, (items) => {
            for (let item of items) {
              item.metadata[`${ID}/metadata`] = {
                startingBid: Number(startingBid),
                name: item.name,
                description: item.text || "A mysterious item...",
                bids: []
              };
            }
          });
        }
      } else {
        OBR.scene.items.updateItems(context.items, (items) => {
          for (let item of items) {
            delete item.metadata[`${ID}/metadata`];
          }
        });
      }
    },
  });
}
