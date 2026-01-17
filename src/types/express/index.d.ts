// ...new file...
declare global {
  namespace Express {
    interface Request {
      // minimal shape — change to a stronger type that matches your auth payload
      user?: { id?: string; [key: string]: any } | null;
    }
  }
}

export {};

