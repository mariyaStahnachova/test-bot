import {Context} from "../core/interfaces/etl/pipes/dispatcher/pipe.interface";
import {Configuration} from "../core/interfaces/etl/base/configuration.interface";

export class BaseRepository {
  configuration: Configuration;
  context: Context = {
    initialData: undefined,
    data: undefined,
    config: undefined,
    error: undefined,
    responseStatus: undefined,
    pipeError: undefined,
  };
  constructor(
    configuration: Configuration,
  ) {
    this.configuration = configuration;
    this.context.config = configuration.config;

  }
}
