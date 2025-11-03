
import React, { useState, useMemo } from 'react';
import type { Player, Session } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import PlayerManager from './components/PlayerManager';
import AddSessionForm from './components/AddSessionForm';
import SessionCard from './components/SessionCard';
import MonthlySummary from './components/MonthlySummary';
import { BadmintonIcon } from './components/icons/BadmintonIcon';

const App: React.FC = () => {
    const [players, setPlayers] = useLocalStorage<Player[]>('badminton_players', []);
    const [sessions, setSessions] = useLocalStorage<Session[]>('badminton_sessions', []);

    const addPlayer = (name: string) => {
        if (name && !players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
            const newPlayer: Player = { id: crypto.randomUUID(), name };
            setPlayers([...players, newPlayer]);
        }
    };

    const deletePlayer = (id: string) => {
        setPlayers(players.filter(p => p.id !== id));
        // Also remove player from all sessions
        setSessions(sessions.map(s => ({
            ...s,
            playerIds: s.playerIds.filter(pid => pid !== id)
        })));
    };

    const addSession = (sessionData: Omit<Session, 'id' | 'playerIds' | 'date'>) => {
        const newSession: Session = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            ...sessionData,
            playerIds: [],
        };
        setSessions([newSession, ...sessions]);
    };

    const updateSessionPlayers = (sessionId: string, playerIds: string[]) => {
        setSessions(sessions.map(s => s.id === sessionId ? { ...s, playerIds } : s));
    };
    
    const deleteSession = (sessionId: string) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
    };

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <BadmintonIcon className="w-8 h-8 text-cyan-400"/>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Badminton Session Tracker</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <AddSessionForm onAddSession={addSession} />
                        
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Recent Sessions</h2>
                            {sortedSessions.length > 0 ? (
                                <div className="space-y-6">
                                    {sortedSessions.map(session => (
                                        <SessionCard
                                            key={session.id}
                                            session={session}
                                            allPlayers={players}
                                            onUpdatePlayers={updateSessionPlayers}
                                            onDeleteSession={deleteSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-800 rounded-lg">
                                    <p className="text-gray-400">No sessions recorded yet.</p>
                                    <p className="text-gray-500 text-sm mt-2">Click "Add New Session" to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <PlayerManager players={players} onAddPlayer={addPlayer} onDeletePlayer={deletePlayer} />
                        <MonthlySummary sessions={sessions} players={players} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
