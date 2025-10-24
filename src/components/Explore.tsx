import React, { useMemo } from 'react';
import { DecisionBoard, User } from '../types';
import { formatTimeLeft } from '../utils/time';

interface ExploreProps {
  boards: DecisionBoard[];
  users: User[];
  onSelectBoard: (boardId: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({ boards, users, onSelectBoard }) => {
    const publicBoards = boards.filter(b => b.isPublic);

    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.email] = user.name;
            return acc;
        }, {} as Record<string, string>);
    }, [users]);

  return (
      <div className="space-y-4">
        {publicBoards.length > 0 ? publicBoards.map(board => {
          const timeLeft = formatTimeLeft(board.expiresAt);
          const isClosed = timeLeft === 'Closed';
          return (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className="bg-white rounded-xl p-6 border border-zinc-200 hover:border-zinc-300 cursor-pointer transition-all hover:shadow-md"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onSelectBoard(board.id)}
            >
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{board.title}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${isClosed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {timeLeft}
                </span>
              </div>
              <p className="mt-2 text-zinc-600 line-clamp-2 text-sm">{board.description}</p>
              <div className="mt-4 flex justify-between items-center text-sm font-medium text-zinc-500">
                <span>{board.options.length} Options</span>
                <span>Created by: <span className="text-zinc-700">{userMap[board.creatorId] || 'Unknown User'}</span></span>
              </div>
            </div>
          )
        }) : (
            <div className="text-center py-16 px-6 bg-white rounded-xl border-2 border-dashed border-zinc-200">
                <h3 className="text-xl font-semibold text-zinc-800">The Forum is Quiet... For Now.</h3>
                <p className="mt-2 text-zinc-500">Be the first to create a public board or check back soon to help others.</p>
            </div>
        )}
      </div>
  );
};
