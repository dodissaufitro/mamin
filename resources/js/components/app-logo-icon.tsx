import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4Zm-9.5 29V15h5.1l4.4 8.2 4.4-8.2h5.1v18h-4.6V22.7l-3.3 6.1h-3.2l-3.3-6.1V33h-4.6Z" />
        </svg>
    );
}
