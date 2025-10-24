import React from 'react';
import { DecisionBoard } from '../types';
import { formatTimeLeft } from '../utils/time';

interface DashboardProps {
  boards: DecisionBoard[];
  onSelectBoard: (boardId: string) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ boards, onSelectBoard, onCreateNew }) => {
  return (
      <div className="space-y-4">
        {boards.length > 0 ? boards.map(board => {
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
                  <div className="flex items-center gap-4">
                      <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{board.title}</h2>
                      {board.isPublic && <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full border border-transparent">Public</span>}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${isClosed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {timeLeft}
                  </span>
              </div>
              <p className="mt-2 text-zinc-600 line-clamp-2 text-sm">{board.description}</p>
              <div className="mt-4 text-sm font-medium text-zinc-500">
                {board.options.length} Options
              </div>
            </div>
          )
        }) : (
            <div className="text-center py-16 px-6 bg-white rounded-xl border-2 border-dashed border-zinc-200">
                <h3 className="text-xl font-semibold text-zinc-800">Your Decision Space is Clear!</h3>
                <p className="mt-2 text-zinc-500">Ready to solve a dilemma? Start a new board to get clarity.</p>
                <button 
                  onClick={onCreateNew} 
                  className="mt-6 bg-zinc-900 text-zinc-50 px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-0 transition-colors"
                >
                  Create Your First Board
                </button>
            </div>
        )}
      </div>
  );
};
