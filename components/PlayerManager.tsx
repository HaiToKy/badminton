
import React, { useState } from 'react';
import type { Player } from '../types';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UsersIcon } from './icons/UsersIcon';

interface PlayerManagerProps {
    players: Player[];
    onAddPlayer: (name: string) => void;
    onDeletePlayer: (id: string) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onAddPlayer, onDeletePlayer }) => {
    const [newPlayerName, setNewPlayerName] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim()) {
            onAddPlayer(newPlayerName.trim());
            setNewPlayerName('');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UsersIcon className="w-6 h-6 text-cyan-400"/> Player Roster</h3>
            <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter new player's name"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button type="submit" className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md transition-colors">
                    <UserPlusIcon className="w-6 h-6"/>
                </button>
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {players.length > 0 ? players.map(player => (
                    <div key={player.id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                        <span className="text-gray-200">{player.name}</span>
                        <button onClick={() => onDeletePlayer(player.id)} className="text-red-400 hover:text-red-300 p-1 rounded-full">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )) : <p className="text-gray-400 text-center py-4">No players added yet.</p>}
            </div>
        </div>
    );
};

export default PlayerManager;
