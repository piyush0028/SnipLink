interface RequestingUser {
    userId: string;
    roles: string[];
  }
  
  interface UrlLike {
    userId: string;
    isActive: boolean;
  }
  
  export function assertUrlAccess(url: UrlLike | null, requestingUser: RequestingUser, action: string): void {
    if (!url || !url.isActive) {
      const error: any = new Error('URL not found');
      error.statusCode = 404;
      throw error;
    }
  
    const isOwner = url.userId === requestingUser.userId;
    const isAdmin = requestingUser.roles.includes('ADMIN');
  
    if (!isOwner && !isAdmin) {
      const error: any = new Error(`You do not have permission to ${action} this URL`);
      error.statusCode = 403;
      throw error;
    }
  }