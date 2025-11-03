
import React, { useState } from 'react';
import type { Session } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface AddSessionFormProps {
    onAddSession: (sessionData: Omit<Session, 'id' | 'playerIds' | 'date'>) => void;
}

const AddSessionForm: React.FC<AddSessionFormProps> = ({ onAddSession }) => {
    const [courtPrice, setCourtPrice] = useState('');
    const [shuttlecockPrice, setShuttlecockPrice] = useState('');
    const [waterPrice, setWaterPrice] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sessionData = {
            courtPrice: parseFloat(courtPrice) || 0,
            shuttlecockPrice: parseFloat(shuttlecockPrice) || 0,
            waterPrice: parseFloat(waterPrice) || 0,
        };
        onAddSession(sessionData);
        setCourtPrice('');
        setShuttlecockPrice('');
        setWaterPrice('');
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
                <PlusCircleIcon className="w-6 h-6" />
                <span>Add New Session</span>
            </button>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="courtPrice" className="block text-sm font-medium text-gray-300 mb-1">Court Price</label>
                        <input
                            type="number"
                            id="courtPrice"
                            value={courtPrice}
                            onChange={(e) => setCourtPrice(e.target.value)}
                            placeholder="e.g., 20.00"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="shuttlecockPrice" className="block text-sm font-medium text-gray-300 mb-1">Shuttlecock Price</label>
                        <input
                            type="number"
                            id="shuttlecockPrice"
                            value={shuttlecockPrice}
                            onChange={(e) => setShuttlecockPrice(e.target.value)}
                            placeholder="e.g., 15.00"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="waterPrice" className="block text-sm font-medium text-gray-300 mb-1">Water Price</label>
                        <input
                            type="number"
                            id="waterPrice"
                            value={waterPrice}
                            onChange={(e) => setWaterPrice(e.target.value)}
                            placeholder="e.g., 5.00"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setIsExpanded(false)} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition">Cancel</button>
                    <button type="submit" className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition">Confirm Session</button>
                </div>
            </form>
        </div>
    );
};

export default AddSessionForm;
