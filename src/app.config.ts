import { Injectable } from '@nestjs/common';
import * as Store from 'data-store';
@Injectable()
export class AppConfig {
    // Return 'data-store' for agent
    getAgentStore(): Store {
        return require('data-store')({path: process.cwd() + `/config/agent.json`});
    }

    // Return 'data-store' for app config
    getConfigStore(): Store {
        return require('data-store')({path: process.cwd() + `/config/config.json`});
    }

}
