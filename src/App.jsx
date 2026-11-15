import React, { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [bids, setBids] = useState([]);
  const [isGM, setIsGM] = useState(false);
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    async function initializeRole() {
      const role = await OBR.player.getRole();
      setIsGM(role === 'GM');
      const player = await OBR.player.getName();
      setPlayerName(player || 'Anonymous Adventurer');
    }
    initializeRole();
  }, []);

  const addItem = (name, description, startingBid) => {
    if (!name?.trim() || !description?.trim() || startingBid < 0) return;
    
    const newItem = { 
      name: name.trim(), 
      description: description.trim(), 
      startingBid: Math.max(0, Number(startingBid)) 
    };

    setItems(prev => [...prev, newItem]);
    setBids(prev => [...prev, []]);
    
    // Broadcast new item to all players
    OBR.broadcast.sendMessage('AUCTION_NEW_ITEM', {
      item: newItem,
    });
  };

  const placeBid = (amount, bidder) => {
    if (!items.length) return;
    
    const currentBids = bids[currentItemIndex] || [];
    const highestBid = currentBids[currentBids.length - 1]?.amount || items[currentItemIndex].startingBid;
    
    if (Number(amount) > highestBid) {
      const newBid = { 
        amount: Number(amount), 
        bidder: bidder || 'Mysterious Stranger' 
      };
      
      setBids(prev => {
        const newBids = [...prev];
        newBids[currentItemIndex] = [...(newBids[currentItemIndex] || []), newBid];
        return newBids;
      });
      
      OBR.broadcast.sendMessage('AUCTION_BID', {
        itemIndex: currentItemIndex,
        amount: Number(amount),
        bidder
      });
    }
  };

  const nextItem = () => {
    const nextIndex = Math.min(currentItemIndex + 1, items.length - 1);
    setCurrentItemIndex(nextIndex);
    
    // Broadcast index change to all players
    OBR.broadcast.sendMessage('AUCTION_CHANGE_ITEM', {
      index: nextIndex
    });
  };

  useEffect(() => {
    // Listen for new items
    const disposeItemListener = OBR.broadcast.onMessage('AUCTION_NEW_ITEM', (data) => {
      setItems(prev => [...prev, data.item]);
      setBids(prev => [...prev, []]);
    });

    // Listen for item changes
    const disposeChangeListener = OBR.broadcast.onMessage('AUCTION_CHANGE_ITEM', (data) => {
      setCurrentItemIndex(data.index);
    });

    // Listen for bids
    const disposeBidListener = OBR.broadcast.onMessage('AUCTION_BID', (data) => {
      setBids(prev => {
        const newBids = [...prev];
        newBids[data.itemIndex] = [
          ...(newBids[data.itemIndex] || []), 
          { amount: data.amount, bidder: data.bidder }
        ];
        return newBids;
      });
    });

    // Cleanup listeners
    return () => {
      disposeItemListener();
      disposeChangeListener();
      disposeBidListener();
    };
  }, []);

  const currentItem = items[currentItemIndex];
  const currentBids = bids[currentItemIndex] || [];
  const highestBid = currentBids[currentBids.length - 1]?.amount || currentItem?.startingBid || 0;

  return (
    <div className="w-full" data-theme="night">
      {isGM && (
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">🧙‍♂️ Auction Master Controls</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addItem(
                formData.get('name'),
                formData.get('description'),
                formData.get('startingBid')
              );
              e.target.reset();
            }}>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Item Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input input-bordered"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ancient Lore</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    className="textarea textarea-bordered h-24"
                  />
                </div>

                <div className="flex gap-4 items-end">
                  <div className="form-control flex-1">
                    <label className="label">
                      <span className="label-text">Starting Gold</span>
                    </label>
                    <input
                      type="number"
                      name="startingBid"
                      min="0"
                      required
                      className="input input-bordered"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    ✨ Conjure Item
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentItem ? (
        <div className="card bg-base-200 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="card-title text-2xl mb-2">{currentItem.name}</h2>
                <p className="italic opacity-75">{currentItem.description}</p>
              </div>
              <div className="badge badge-lg">
                Item {currentItemIndex + 1} of {items.length}
              </div>
            </div>

            <div className="bg-base-300 p-4 rounded-box mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-75">Current Bid</p>
                  <p className="text-3xl font-bold">
                    {highestBid} <span className="text-lg opacity-75">gp</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-75">Leading Bidder</p>
                  <p className="text-lg font-medium">
                    {currentBids[currentBids.length - 1]?.bidder || "None"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-bold mb-3">📜 Bid Scroll</h4>
              <div className="bg-base-300 rounded-box p-2 max-h-40 overflow-y-auto">
                {currentBids.map((bid, index) => (
                  <div key={index} className="flex justify-between items-center bg-base-100 p-2 rounded-box mb-2">
                    <span>{bid.bidder}</span>
                    <span className="font-mono">{bid.amount} gp</span>
                  </div>
                ))}
                {currentBids.length === 0 && (
                  <p className="text-center py-4 opacity-75 italic">No bids yet - will this treasure go unloved?</p>
                )}
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              placeBid(formData.get('bid'), isGM ? 'NPC' : playerName);
              e.target.reset();
            }}>
              <div className="flex gap-4">
                <input
                  type="number"
                  name="bid"
                  placeholder={`Minimum ${highestBid + 1} gp...`}
                  min={highestBid + 1}
                  required
                  className="input input-bordered flex-1"
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                >
                  🗡️ Raise Sword
                </button>
              </div>
            </form>

            {isGM && items.length > 1 && (
              <button
                onClick={nextItem}
                className="btn btn-accent mt-4"
              >
                ⏩ Next Artifact ({currentItemIndex + 1}/{items.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl opacity-75 italic">
              The auction hall stands empty...
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
