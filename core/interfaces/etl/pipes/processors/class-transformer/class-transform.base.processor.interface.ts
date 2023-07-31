import { Context } from '../../dispatcher/pipe.interface';


export interface ClassTransformBaseProcessor<T> {
  transform(ctx: Context): Context;
}
