import { Link, Outlet, useLocation } from 'react-router-dom'
import { Search, Calendar, Settings, Tv } from 'lucide-react'
import { cn } from '../utils'
import { TitleBar } from './TitleBar'

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
    <Link
        to={to}
        className={cn(
            'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
            active
                ? 'bg-indigo-600/10 text-indigo-500'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
        )}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
)

export const Layout = () => {
    const location = useLocation()

    return (
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 flex flex-col border-r border-zinc-800 bg-zinc-950 p-4 pt-2">
                    <div className="flex items-center space-x-2 px-4 py-6 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Tv className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            CineScope
                        </span>
                    </div>
                    <nav className="flex-1 space-y-2">
                        <SidebarItem
                            icon={Search}
                            label="Search"
                            to="/"
                            active={location.pathname === '/'}
                        />
                        <SidebarItem
                            icon={Calendar}
                            label="Calendar"
                            to="/calendar"
                            active={location.pathname === '/calendar'}
                        />
                        <SidebarItem
                            icon={Settings}
                            label="Settings"
                            to="/settings"
                            active={location.pathname === '/settings'}
                        />
                    </nav>

                    <div className="px-4 py-4 text-xs text-zinc-600">
                        v1.0.0
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden bg-black/95 relative">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black/0 to-black/0" />
                    <main className="flex-1 overflow-y-auto p-8 relative z-10 w-full mx-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}
