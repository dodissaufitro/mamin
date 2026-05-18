import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-full border border-white/70 bg-amber-50/90">
                <AppLogoIcon className="size-5 fill-current text-gray-900" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold text-gray-900">Mamin SPJ</span>
            </div>
        </>
    );
}
