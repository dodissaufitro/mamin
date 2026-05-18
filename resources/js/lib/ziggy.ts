import { route as ziggyRoute } from 'ziggy-js';

/**
 * Named route helper (uses Ziggy config from @routes in app.blade.php).
 */
export function route(
    name: string,
    params?: Record<string, unknown>,
    absolute?: boolean,
): string {
    return ziggyRoute(name, params, absolute);
}
