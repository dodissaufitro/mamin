export function CloudBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/cloud-bg.png')" }}
            />
            <div className="absolute inset-0 bg-sky-100/25" />
            <div className="absolute left-1/2 top-1/2 h-[min(140vw,900px)] w-[min(140vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
            <div className="absolute left-1/2 top-1/2 h-[min(110vw,720px)] w-[min(110vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
            <div className="absolute left-1/2 top-1/2 h-[min(85vw,560px)] w-[min(85vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
            <div className="absolute left-1/2 top-1/2 h-[min(62vw,400px)] w-[min(62vw,400px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        </div>
    );
}
