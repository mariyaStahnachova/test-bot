import {Subject} from "rxjs";
import {Action} from "../../../common/etl/dispatcher/pipes-dispatcher";

export interface ETLRepository {
  configuration: object;
  getBot1?(): {st:string, num:number};

}
