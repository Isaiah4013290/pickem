"use client";
import { useState } from "react";

export default function CommentSection({ gameId, currentPick }: { gameId: string, currentPick: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const postComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newComment = {
      id: Math.random().toString(),
      userName: "Fan",
      text: text,
      teamPicked: currentPick || "No Pick",
    };

    setComments([...comments, newComment]);
    setText("");
  };

  return (
    <div className="mt-4 p-3 border-t bg-gray-50 rounded-b-lg">
      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="text-xs">
            <span className="font-bold text-blue-700">{c.userName}</span>
            <span className="mx-1 bg-gray-200 px-1 rounded text-[10px]">Picked: {c.teamPicked}</span>
            <p className="inline-block text-gray-600">{c.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={postComment} className="flex gap-2">
        <input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Talk trash..."
          className="flex-1 text-sm p-1 border rounded"
        />
        <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">Send</button>
      </form>
    </div>
  );
}
