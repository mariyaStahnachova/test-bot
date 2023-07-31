import {Bot1Repository} from "./bot1/bot1.repository";
import {Bot1Config} from "./bot1/configs/base.config";
import {Configuration} from "../../core/interfaces/etl/base/configuration.interface";

export const Config = {
  name: 'BotConfigs',
  beans: {
    Bot1: {
      bean: Bot1Repository,
      config: Bot1Config
    },
  }
};
