const CustomPieLegend = ({ payload, chartData }) => {
    return (
        <div className="mt-4 text-xs">
            <div className="flex items-center justify-between font-bold mb-2 px-1">
                <span className="text-slate-800 dark:text-white">Categoria</span>
                <div className="flex gap-4">
                    <span className="text-slate-800 dark:text-white w-12 text-center">Atual</span>
                    <span className="text-slate-800 dark:text-white w-12 text-center">Sugerido</span>
                </div>
            </div>
            <ul className="flex flex-col gap-1">
                {payload.map((entry) => {
                    const itemData = chartData.find(d => d.name === entry.value);
                    if (!itemData) return null;
                    return (
                        <li key={`item-${entry.value}`} className="flex items-center justify-between p-1 rounded-md hover:bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-800 dark:text-white">{entry.value}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-semibold text-slate-800 dark:text-white w-12 text-center">{itemData.percAtual}%</span>
                                <span className="font-semibold text-[#a39ee8] w-12 text-center">{itemData.percSugerido}%</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CustomPieLegend;