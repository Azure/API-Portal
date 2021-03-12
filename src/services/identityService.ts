import { IdentityProviderContract } from "../contracts/identityProvider";
import { Page } from "../models/page";
import { IdentityProvider } from "../models/identityProvider";
import { IdentitySettingContract } from "../contracts/IdentitySettings";

/**
 * A service for management operations with identity providers.
 */
export class IdentityService {
    constructor() { }

    /**
     * Returns a collection of configured identity providers.
     */
    public async getIdentityProviders(): Promise<IdentityProvider[]> {
        return null;
        // const identityProviders = await this.mapiClient.get<Page<IdentityProviderContract>>("/identityProviders");
        // return identityProviders.value.map(contract => new IdentityProvider(contract));
    }
    
    public async getIdentitySetting(): Promise<IdentitySettingContract> {
        return null;
        // return await this.mapiClient.get<IdentitySettingContract>("/portalsettings/signup");
    }
}