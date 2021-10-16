import { UserService, BuiltInRoles } from "@paperbits/common/user";

export class StaticUserService implements UserService {

    public async getUserName(): Promise<string> {
        return "";
    }

    public async getUserPhotoUrl(): Promise<string> {
        return "";
    }

    /**
     * Returns current user's role keys.
     */
    public async getUserRoles(): Promise<string[]> {
        return [BuiltInRoles.anonymous.key];
    }

    /**
     * Assigns roles to current user.
     * @param roles 
     */
    public async setUserRoles(roles: string[]): Promise<void> {
        throw new Error("Not implemented.");
    }
}