import React, { useState, useEffect } from 'react';
import { DecisionBoard as DecisionBoardType, User } from './types';
import { DecisionBoard } from './components/DecisionBoard';
import { Dashboard } from './components/Dashboard';
import { CreateBoard } from './components/CreateBoard';
import { Auth } from './components/Auth';
import { Explore } from './components/Explore';
import { Layout } from './components/Layout';
import * as db from './services/db';

type View = 'dashboard' | 'board' | 'create' | 'explore';

function App() {
  const [boards, setBoards] = useState<DecisionBoardType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [previousView, setPreviousView] = useState<View>('dashboard');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncData = async () => {
    setIsLoading(true);
    const [currentUser, fetchedBoards, allUsers] = await Promise.all([
      db.getCurrentUserProfile(),
      db.getBoards(),
      db.getUsers(),
    ]);

    setBoards(fetchedBoards);
    setUsers(allUsers);
    
    if (currentUser) {
      setCurrentUserEmail(currentUser.email);
      setCurrentUserName(currentUser.name);
    } else {
      setCurrentUserEmail(null);
      setCurrentUserName(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    syncData();
  }, []);

  const handleLogin = async (email: string, password: string): Promise<{success: boolean, error?: string}> => {
    const { success, error } = await db.loginUser(email, password);
    if (success) {
      await syncData();
    }
    return { success, error };
  };

  const handleSignup = async (userData: Omit<User, 'password'> & {password: string}): Promise<{success: boolean, error?: string}> => {
    const { success, error } = await db.signupUser(userData as User);
    if (success) {
       await syncData();
    }
    return { success, error };
  }

  const handleLogout = async () => {
    await db.logoutUser();
    await syncData();
    setView('dashboard');
    setSelectedBoardId(null);
  };
  
  const handleSelectBoard = (boardId: string) => {
    setPreviousView(view);
    setSelectedBoardId(boardId);
    setView('board');
  };

  const handleCreateNew = () => {
    setView('create');
  };
  
  const handleNavigate = (targetView: 'dashboard' | 'explore') => {
      setView(targetView);
  }

  const handleSaveNewBoard = async (data: { title: string; description: string; options: string[], isPublic: boolean, durationInSeconds: number }) => {
    if (!currentUserEmail) return;
    
    const newBoard = await db.createBoard({
      title: data.title,
      description: data.description,
      options: data.options,
      isPublic: data.isPublic,
      durationInSeconds: data.durationInSeconds,
    });

    setBoards([newBoard, ...boards]);
    setSelectedBoardId(newBoard.id);
    setPreviousView('dashboard'); // Always come from dashboard after creation
    setView('board');
  };

  const handleUpdateBoard = async (updatedBoard: DecisionBoardType) => {
    const result = await db.updateBoard(updatedBoard);
    setBoards(boards.map(b => (b.id === result.id ? result : b)));
  };

  const handleBackToDashboard = () => {
    setSelectedBoardId(null);
    setView('dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!currentUserEmail || !currentUserName) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }
  
  const userBoards = boards.filter(b => b.creatorId === currentUserEmail);
  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Layout
            currentUserName={currentUserName}
            activeView="dashboard"
            onNavigate={handleNavigate}
            onCreateNew={handleCreateNew}
            onLogout={handleLogout}
            pageTitle="Your Decision HQ"
          >
            <Dashboard 
              boards={userBoards}
              onSelectBoard={handleSelectBoard} 
            />
          </Layout>
        );
      case 'explore':
        return (
          <Layout
            currentUserName={currentUserName}
            activeView="explore"
            onNavigate={handleNavigate}
            onCreateNew={handleCreateNew}
            onLogout={handleLogout}
            pageTitle="Community Crossroads"
            pageDescription="Lend your wisdom and see what dilemmas the community is tackling."
          >
            <Explore 
              boards={boards}
              users={users}
              onSelectBoard={handleSelectBoard}
            />
          </Layout>
        );
      case 'board':
        const canView = selectedBoard && (selectedBoard.isPublic || selectedBoard.creatorId === currentUserEmail);
        return canView ? (
          <DecisionBoard
            board={selectedBoard}
            currentUserName={currentUserName}
            onUpdateBoard={handleUpdateBoard}
            onBack={() => {
                setSelectedBoardId(null);
                setView(previousView);
            }}
            cameFrom={previousView as 'dashboard' | 'explore'}
          />
        ) : (
          <div className="flex flex-col justify-center items-center h-screen gap-4 bg-zinc-50">
            <p className="text-xl text-zinc-700">Whoops! This board is either private or doesn't exist.</p>
            <button onClick={handleBackToDashboard} className="text-zinc-900 underline font-semibold">Take Me to My Dashboard</button>
          </div>
        );
      case 'create':
        return <CreateBoard onCreate={handleSaveNewBoard} onCancel={handleBackToDashboard} />;
      default:
        return (
          <Dashboard 
            boards={userBoards}
            onSelectBoard={handleSelectBoard}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      {renderContent()}
    </main>
  );
}

export default App;
