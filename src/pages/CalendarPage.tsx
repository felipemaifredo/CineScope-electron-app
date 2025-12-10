import { useEffect, useState } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { tmdb, type TMDBSeries, type TMDBEpisode } from '../services/tmdb';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface CalendarEvent {
    episode: TMDBEpisode;
    series: TMDBSeries;
    date: Date;
}

export const CalendarPage = () => {
    const { watchlist } = useWatchlist();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEpisodes = async () => {
            setLoading(true);
            const allEvents: CalendarEvent[] = [];

            try {
                const promises = watchlist.map(async (series) => {
                    const details = await tmdb.getSeriesDetails(series.id);

                    if (details.last_episode_to_air) {
                        const seasonNumber = details.last_episode_to_air.season_number;
                        const season = await tmdb.getSeasonDetails(series.id, seasonNumber);

                        if (season.episodes) {
                            season.episodes.forEach(ep => {
                                if (ep.air_date) {
                                    allEvents.push({
                                        episode: ep,
                                        series: details,
                                        date: new Date(ep.air_date)
                                    });
                                }
                            });
                        }
                    }

                    if (details.next_episode_to_air) {
                        const nextEp = details.next_episode_to_air;
                        if (nextEp.season_number !== details.last_episode_to_air?.season_number) {
                            const season = await tmdb.getSeasonDetails(series.id, nextEp.season_number);
                            if (season.episodes) {
                                season.episodes.forEach(ep => {
                                    if (ep.air_date) {
                                        allEvents.push({
                                            episode: ep as unknown as TMDBEpisode,
                                            series: details,
                                            date: new Date(ep.air_date)
                                        });
                                    }
                                });
                            }
                        }
                    }
                });

                await Promise.all(promises);
                setEvents(allEvents);
            } catch (error) {
                console.error("Failed to load calendar events", error);
            } finally {
                setLoading(false);
            }
        };

        if (watchlist.length > 0) {
            fetchEpisodes();
        } else {
            setLoading(false);
        }
    }, [watchlist]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const month = currentDate.toLocaleString('en-US', { month: 'long' });
    const year = currentDate.getFullYear();
    const monthName = `${month} ${year}`;

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    // Filter events for selected date
    const selectedDateEvents = selectedDate ? events.filter(e =>
        e.date.getDate() === selectedDate.getDate() &&
        e.date.getMonth() === selectedDate.getMonth() &&
        e.date.getFullYear() === selectedDate.getFullYear()
    ) : [];

    const renderCalendarCells = () => {
        const cells = [];
        const today = new Date();

        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-zinc-950/50 min-h-[100px] border border-zinc-900/50" />);
        }

        // Days
        for (let d = 1; d <= days; d++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
            const isToday = date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

            // Find events for this day
            const dayEvents = events.filter(e =>
                e.date.getDate() === d &&
                e.date.getMonth() === currentDate.getMonth() &&
                e.date.getFullYear() === currentDate.getFullYear()
            );

            cells.push(
                <div
                    key={d}
                    onClick={() => handleDayClick(date)}
                    className={`min-h-[120px] p-2 border border-zinc-900 bg-zinc-900/20 relative group hover:bg-zinc-800/60 transition-colors cursor-pointer ${isToday ? 'bg-indigo-900/10 border-indigo-900/50' : ''}`}
                >
                    <span className={`text-sm font-medium ${isToday ? 'text-indigo-400' : 'text-zinc-500'}`}>
                        {d}
                    </span>

                    <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 3).map((evt, i) => (
                            <div key={i} className="text-xs truncate rounded bg-indigo-600/20 text-indigo-200 px-1.5 py-1" title={`${evt.series.name} - S${evt.episode.season_number}E${evt.episode.episode_number}: ${evt.episode.name}`}>
                                <span className="font-bold">{evt.series.name}</span>
                            </div>
                        ))}
                        {dayEvents.length > 3 && (
                            <div className="text-[10px] text-zinc-500 pl-1">
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-zinc-400">Release schedule.</p>
                </div>
                <div className="flex items-center space-x-4 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-zinc-800 rounded-md transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold min-w-[150px] text-center">{monthName}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-zinc-800 rounded-md transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-zinc-500 animate-pulse">Loading schedule data...</div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-7 gap-px bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-zinc-950 p-2 text-center text-sm font-medium text-zinc-500 py-3">
                                {day}
                            </div>
                        ))}
                        {renderCalendarCells()}
                    </div>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Details'}
            >
                <div className="space-y-4">
                    {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500">
                            No episodes airing on this day.
                        </div>
                    ) : (
                        selectedDateEvents.map((evt, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                {evt.series.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${evt.series.poster_path}`}
                                        alt={evt.series.name}
                                        className="w-16 h-24 object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-16 h-24 bg-zinc-800 rounded-md flex items-center justify-center text-xs text-zinc-500">No Img</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{evt.series.name}</h3>
                                    <div className="text-indigo-400 text-sm font-medium mb-1">
                                        S{evt.episode.season_number} E{evt.episode.episode_number}
                                    </div>
                                    <p className="text-zinc-300 text-sm truncate">{evt.episode.name}</p>
                                    <p className="text-zinc-500 text-xs mt-2 line-clamp-2">{evt.episode.overview || 'No description available.'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
};
