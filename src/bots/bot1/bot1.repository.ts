import {Bot1ReaderPipe} from "./readers/reader.pipe";
import {Context} from "../../../core/interfaces/etl/pipes/dispatcher/pipe.interface";
import {Action, PipesDispatcher} from "../../../core/common/etl/dispatcher/pipes-dispatcher";
import {ETLRepository} from "../../../core/interfaces/etl/base/etl.repository.interface";
import {BaseRepository} from "../../base.repository";
import {Bot1ProcessorPipe} from "./processors/bot1.processor.pipe";
import {Subject} from "rxjs";

export class Bot1Repository extends BaseRepository implements ETLRepository {
  getBot1(): {st:string, num:number} {
        return new PipesDispatcher<Context>()
        .pipe('reader', (action: Action) => Bot1ReaderPipe(action.context))
        .pipe('processor',(action: Action) => Bot1ProcessorPipe(action.context))
        .dispatch(this.context);

  }

}
