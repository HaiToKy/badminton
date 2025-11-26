
import React, { useState, useMemo } from 'react';
import type { Player, Session, MonthlySettings as MonthlySettingsType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import AddSessionForm from './components/AddSessionForm';
import SessionCard from './components/SessionCard';
import MonthlySummary from './components/MonthlySummary';
import MonthlySettings from './components/MonthlySettings';
import { BadmintonIcon } from './components/icons/BadmintonIcon';
import playersConfig from './players.json';

const App: React.FC = () => {
    // Load players from config file
    const players = playersConfig as Player[];
    const [sessions, setSessions] = useLocalStorage<Session[]>('badminton_sessions', []);
    const [monthlySettings, setMonthlySettings] = useLocalStorage<MonthlySettingsType[]>('badminton_monthly_settings', []);
    const [currentMonthKey, setCurrentMonthKey] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Generate list of months (current + 3 future months)
    const availableMonths = useMemo(() => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 4; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                key: monthKey,
                label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
            });
        }
        return months;
    }, []);

    const handleMonthChange = (monthKey: string) => {
        setCurrentMonthKey(monthKey);
    };

    const addSession = (sessionData: Omit<Session, 'id' | 'playerIds'> & { date: string }) => {
        const newSession: Session = {
            id: crypto.randomUUID(),
            ...sessionData,
            playerIds: [],
        };
        setSessions([newSession, ...sessions]);
    };

    const generateMultipleSessions = (sessionsData: Array<Omit<Session, 'id' | 'playerIds'> & { date: string }>) => {
        // Create a map of date -> session data for easy lookup
        const sessionDataMap = new Map(
            sessionsData.map(sd => [
                new Date(sd.date).toISOString().split('T')[0],
                sd
            ])
        );

        // Update existing sessions and collect dates that need new sessions
        const updatedSessions = sessions.map(session => {
            const dateStr = new Date(session.date).toISOString().split('T')[0];
            const sessionData = sessionDataMap.get(dateStr);

            if (sessionData) {
                // Update prices for existing session, but keep playerIds and isHoliday
                sessionDataMap.delete(dateStr); // Mark as processed
                return {
                    ...session,
                    courtPrice: sessionData.courtPrice,
                    shuttlecockPrice: sessionData.shuttlecockPrice,
                    waterPrice: sessionData.waterPrice,
                    drinkPrice: sessionData.drinkPrice,
                };
            }
            return session;
        });

        // Create new sessions for dates that don't exist yet
        const newSessions = Array.from(sessionDataMap.values()).map(sessionData => ({
            id: crypto.randomUUID(),
            ...sessionData,
            playerIds: [],
        }));

        // Combine updated existing sessions with new sessions
        setSessions([...newSessions, ...updatedSessions]);
    };

    const updateMonthlySettings = (settings: MonthlySettingsType) => {
        const existingIndex = monthlySettings.findIndex(s => s.monthKey === settings.monthKey);
        if (existingIndex >= 0) {
            const updated = [...monthlySettings];
            updated[existingIndex] = settings;
            setMonthlySettings(updated);
        } else {
            setMonthlySettings([...monthlySettings, settings]);
        }
    };

    const currentSettings = useMemo(() => {
        return monthlySettings.find(s => s.monthKey === currentMonthKey);
    }, [monthlySettings, currentMonthKey]);

    const updateSessionPlayers = (sessionId: string, playerIds: string[]) => {
        setSessions(sessions.map(s => s.id === sessionId ? { ...s, playerIds } : s));
    };

    const updateSessionHoliday = (sessionId: string, isHoliday: boolean) => {
        setSessions(sessions.map(s => s.id === sessionId ? { ...s, isHoliday } : s));
    };

    const deleteSession = (sessionId: string) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
    };

    // Filter sessions by current month and sort
    const currentMonthSessions = useMemo(() => {
        const filtered = sessions.filter(s => {
            const sessionDate = new Date(s.date);
            const sessionMonthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
            return sessionMonthKey === currentMonthKey;
        });
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions, currentMonthKey]);

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
                        {/* Month Selector */}
                        <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700">
                            <label htmlFor="month-selector" className="block text-sm font-medium text-gray-300 mb-2">
                                Select Month
                            </label>
                            <select
                                id="month-selector"
                                value={currentMonthKey}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {availableMonths.map(month => (
                                    <option key={month.key} value={month.key}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <MonthlySettings
                            currentMonthKey={currentMonthKey}
                            settings={currentSettings}
                            onUpdateSettings={updateMonthlySettings}
                            onGenerateSessions={generateMultipleSessions}
                        />
                        <AddSessionForm
                            onAddSession={addSession}
                            monthlySettings={currentSettings}
                            existingSessions={sessions}
                        />

                        <div>
                            <h2 className="text-2xl font-semibold mb-4 border-b-2 border-gray-700 pb-2">Sessions for {availableMonths.find(m => m.key === currentMonthKey)?.label}</h2>
                            {currentMonthSessions.length > 0 ? (
                                <div className="space-y-6">
                                    {currentMonthSessions.map(session => (
                                        <SessionCard
                                            key={session.id}
                                            session={session}
                                            allPlayers={players}
                                            onUpdatePlayers={updateSessionPlayers}
                                            onUpdateHoliday={updateSessionHoliday}
                                            onDeleteSession={deleteSession}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-800 rounded-lg">
                                    <p className="text-gray-400">No sessions for this month yet.</p>
                                    <p className="text-gray-500 text-sm mt-2">Configure monthly settings to auto-generate sessions.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <MonthlySummary sessions={currentMonthSessions} players={players} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
