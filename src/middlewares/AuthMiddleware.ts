import {getTokensForUser} from "../services/OAuth";

export function requireAuth(req: any, res: any, next: any) {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).send('Missing user id');
    const tokens = getTokensForUser(userId);
    if (!tokens) return res.status(401).send('User not authenticated');
    req.tokens = tokens;
    req.userId = userId;
    next();
}
