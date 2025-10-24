import React, { useState, useEffect } from 'react';
import { DecisionBoard as DecisionBoardType, Contribution, ContributionType, Option } from '../types';
import { OptionCard } from './OptionCard';
import { ArrowLeftIcon } from './Icons';
import { formatTimeLeft } from '../utils/time';

interface DecisionBoardProps {
  board: DecisionBoardType;
  currentUserName: string;
  onUpdateBoard: (board: DecisionBoardType) => void;
  onBack: () => void;
  cameFrom: 'dashboard' | 'explore';
}

export const DecisionBoard: React.FC<DecisionBoardProps> = ({ board, currentUserName, onUpdateBoard, onBack, cameFrom }) => {
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(board.expiresAt));
  
  const isExpired = board.expiresAt !== -1 && board.expiresAt < Date.now();

  useEffect(() => {
    if (board.expiresAt !== -1 && !isExpired) {
        const timer = setInterval(() => {
            setTimeLeft(formatTimeLeft(board.expiresAt));
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [board.expiresAt, isExpired]);


  const handleVote = (optionId: string) => {
    if (votedOptionId || isExpired) return;

    const newOptions = board.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    onUpdateBoard({ ...board, options: newOptions });
    setVotedOptionId(optionId);
  };

  const handleAddContribution = (optionId: string, type: ContributionType, text: string) => {
    if (isExpired) return;

    const newContribution: Contribution = {
      id: `c-${Date.now()}`,
      text,
      author: currentUserName,
      upvotes: 0
    };

    const newOptions: Option[] = board.options.map(opt => {
      if (opt.id === optionId) {
        if (type === ContributionType.Pro) {
          return { ...opt, pros: [...opt.pros, newContribution] };
        } else {
          return { ...opt, cons: [...opt.cons, newContribution] };
        }
      }
      return opt;
    });

    onUpdateBoard({ ...board, options: newOptions });
  };
  
  const handleUpdateContributionVote = (optionId: string, contributionId: string, type: ContributionType, direction: 'up' | 'down') => {
      if (isExpired) return;
      
      const newOptions = board.options.map(opt => {
          if (opt.id !== optionId) return opt;

          const updateVote = (c: Contribution) => {
              if (c.id !== contributionId) return c;
              return { ...c, upvotes: direction === 'up' ? c.upvotes + 1 : c.upvotes - 1 };
          };

          if (type === ContributionType.Pro) {
              return { ...opt, pros: opt.pros.map(updateVote) };
          } else {
              return { ...opt, cons: opt.cons.map(updateVote) };
          }
      });

      onUpdateBoard({ ...board, options: newOptions });
  };

  const backText = cameFrom === 'explore' ? 'Back to the Crowd' : 'Back to My Boards';
  const timerText = isExpired ? 'The votes are in!' : `Time to decide: ${timeLeft}`;
  const timerColor = isExpired ? 'text-rose-600' : 'text-zinc-600';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            {backText}
        </button>
      </div>
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
          {board.title}
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-zinc-600">
          {board.description}
        </p>
         <p className={`mt-4 text-lg font-semibold tabular-nums ${timerColor}`}>
          {timerText}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {board.options.map(option => (
          <OptionCard
            key={option.id}
            option={option}
            onVote={handleVote}
            onAddContribution={handleAddContribution}
            onUpdateContributionVote={handleUpdateContributionVote}
            hasVoted={!!votedOptionId}
            isExpired={isExpired}
          />
        ))}
      </div>
    </div>
  );
};
