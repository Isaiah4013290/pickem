"use client";

import { useState } from "react";

interface GameCardProps {
  game: any; // Using any for now to match your current setup
  currentUserPick: string | null;
}

export default function GameCard({ game, currentUserPick }: GameCardProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      userName: "Fan", 
      text: inputText,
      teamPicked: currentUserPick || "No Pick",
      createdAt: Date.now(),
    };

    setComments([...comments, newComment]);
    setInputText("");
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white mb-4">
      {/* Game Info Section */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">{game.homeTeam} vs {game.awayTeam}</h3>
        <span className="text-xs text-gray-500">{game.time}</span>
      </div>

      {/* Picking Buttons go here... (Your existing code) */}

      {/* --- RUDIMENTARY COMMENT SECTION --- */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Game Chat</h4>
        
        {/* Comment List */}
        <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 italic">No trash talk yet...</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="text-sm bg-gray-50 p-2 rounded border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs uppercase">{c.userName}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                  PICKED: {c.teamPicked}
                </span>
              </div>
              <p className="text-gray-700">{c.text}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handlePostComment} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800 transition"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
