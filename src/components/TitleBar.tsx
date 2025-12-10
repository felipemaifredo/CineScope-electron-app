import { Tv } from 'lucide-react';

export const TitleBar = () => {
    return (
        <div className="h-8 bg-black flex items-center justify-center border-b border-zinc-800 select-none app-region-drag w-full shrink-0 z-50">
            <div className="flex items-center space-x-2 opacity-50">
                <Tv size={14} className="text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400">CineScope</span>
            </div>
        </div>
    );
};
