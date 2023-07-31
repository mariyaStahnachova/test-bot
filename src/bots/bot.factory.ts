/**
 * Bots module configuration.
 * Place all Bots related services in this Config. This factory will be injected into the main module.
 */
import {Config} from "./bots.config";
import { EtlConfig } from '../../core/interfaces/etl/configs/etl.config.interface';

type ModulesMap = typeof Config.beans;
type ModulesKeys = keyof ModulesMap;
type Tuples<T> = T extends ModulesKeys ? [T, InstanceType<ModulesMap[T]['bean']>] : never;
type SingleKeys<K> = [K] extends (K extends ModulesKeys ? [K] : never) ? K : never;
type ClassType<A extends ModulesKeys> = Extract<Tuples<ModulesKeys>, [A, any]>[1];

export class BotsFactory {

  entity<K extends ModulesKeys>(config:SingleKeys<K>): ClassType<K> {
    return new Config.beans[config].bean(
      Config.beans[config],
    );
  }

}
