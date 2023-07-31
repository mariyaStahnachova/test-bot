import {PipeWithName, Pipe} from "../../../interfaces/etl/pipes/dispatcher/pipes-dispatcher.interfaces";
import { MonoTypeOperatorFunction, Observable, Subject, Subscription } from 'rxjs';
import { exhaustMap, filter, map, publishReplay, refCount, scan, startWith } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

export enum ActionType {
  'init' = 'init',
  'next' = 'next',
  'stop' = 'stop',
  'complete' = 'complete',
  'iterate' = 'iterate'//??
}

export interface Action {
  type: string;
  context?: any;
  payload?: any;
  error?: any;
}


export const ofType = <T extends Action>(type: string): MonoTypeOperatorFunction<T> => {
  return filter((_) => type === _.type);
};

export class PipesDispatcher<T> {


  /**
   * Initial State
   */
  // State
  uniqueJobId: string;
  pipes: PipeWithName<Action>[];
  initialPipes: PipeWithName<Action>[];
  defaultState: T = {} as T;
  initialContext: T = {} as T;

  /**
   * Pipes Subscriptions
   */
  private pipesSubscriptions: Subscription[] = [];

  /**
   * Observable
   */
  actions$: Subject<Action> = new Subject<Action>();

  constructor() {
    this.pipes = [];
    this.initialPipes = [];
  }

  state$: Observable<Action> = this.actions$.pipe(
    startWith(this.defaultState),
    scan((action: Action): Action => action),
    publishReplay(1),
    refCount()
  );

  public subscribe(callback: (actions$: Subject<Action>, that: this) => void): PipesDispatcher<T> {
    callback(this.actions$, this);
    return this;
  }

  getPipe(name: string): Pipe<Action> {
    return this.pipes.find((pipe) => {
      const pipeName = Object.keys(pipe)[0] as string;
      return pipeName === name;
    })[name] as Pipe<Action>;
  }

  invokePipes(): Observable<Action> {
    /**
     * Invoke Pipes
     */
    let currentPipeName: string;
    let firstPipe = true;
    for (const pipeObj of this.pipes) {
      const pipeName = Object.keys(pipeObj)[0] as string;
      if (firstPipe) {
        console.log('currentPipeName fitsr pipe',currentPipeName  )
        console.log('fitsr pipeName',pipeName )
        this.pipesSubscriptions.push(
          this.actions$
            .pipe(
              ofType(ActionType.init),
              map((action) => action as Action),
              exhaustMap(async (action) => ({ type: action.type, context: action.context } as Action)),
              map((action) => {
                console.log('in map first', action,pipeName )
                this.dispatchAction({
                  ...action,
                  type: pipeName
                } as Action);
              })
            )
            .subscribe()
        );
        console.log('pipesSubscriptions after firstPipe',this.pipesSubscriptions)
        firstPipe = false;
      } else {
        const pipeCallBack = this.getPipe(currentPipeName);
        console.log('currentPipeName second pipe',currentPipeName  )
        console.log('second pipe pipeName ',pipeCallBack, pipeName )
        this.pipesSubscriptions.push(
          this.actions$
            .pipe(
              ofType(currentPipeName),
              map((action) => action as Action),
              // eslint-disable-next-line no-loop-func
              exhaustMap(async (action) => {
                try {
                  const pipeResult = await pipeCallBack(action as Action, (context) => undefined);
                  console.log('pipeResult second', pipeResult)
                  return {
                    type: action.type,
                    context: pipeResult
                  } as Action;
                } catch (error) {
                  this.stop();
                  return {
                    type: action.type,
                    context: {},
                    error
                  } as Action;
                }
              }),
              map((action) => {
                console.log('in map second', action,pipeName )
                this.dispatchAction({
                  ...action,
                  type: pipeName
                } as Action);
              })
            )
            .subscribe()
        );
        console.log('pipesSubscriptions after second',this.pipesSubscriptions)
      }
      currentPipeName = pipeName as ActionType;
    }
    /**
     * Invoke Iterator and Last Pipe from list
     */
    const pipeCallBack = this.getPipe(currentPipeName);
    console.log('currentPipeName third pipe',currentPipeName  )
    console.log('pipeName third pipeCallBack ',pipeCallBack,)
    this.pipesSubscriptions.push(
      this.actions$
        .pipe(
          ofType(currentPipeName),
          map((action) => action as Action),
          exhaustMap(async (action) => {
            try {
              const pipeResult = await pipeCallBack(action as Action, (context) => undefined);
              console.log('pipeResult third', pipeResult)
              return {
                type: action.type,
                context: pipeResult
              } as Action;
            } catch (error) {
              this.stop();
              return {
                type: action.type,
                context: {},

                error
              } as Action;
            }
          }),
          map((action) => {
            console.log('in map third', action )
            return this.dispatchAction({
              type: ActionType.iterate,
              context: action.context
            } as Action);
          })
        )
        .subscribe()

    );
    console.log('pipesSubscriptions after second',this.pipesSubscriptions)
    this.actions$
        .pipe(
            ofType(ActionType.stop),
            map((action) => action as Action),
            exhaustMap(async (action) => {
              console.log('in last exhaustMap complete', action)
              try {
                // reject();
                await this.destroy();
                this.actions$.complete();
              } catch (error) {
                // reject(error);
              }
            })
        )
        .subscribe();
    this.actions$
        .pipe(
            ofType(ActionType.complete),
            map((action) => action as Action),
            exhaustMap(async (action) => {
              try {
                console.log('in try exhaustMap ', action)
                await this.destroy();
                this.actions$.complete();
              } catch (error) {
                // reject(error);
              }
            })
        )
        .subscribe();
    return this.actions$;
  }

  pipe(pipeName: string, pipe: Pipe<Action>): this {
    const pipeObj = {};
    pipeObj[pipeName] = pipe;
    this.pipes.push(pipeObj);
    console.log('this.pipes',this.pipes)
    return this;
  }

  public stopAfter<T, A extends Action>(func: (context: T, action: A) => boolean): this {
    this.actions$
      .pipe(
        map((action) => action as Action),
        exhaustMap(async (action) => {
          if (func(action.context, action as A)) {
            this.stop();
          }
          return action;
        })
      )
      .subscribe();
    return this;
  }

  /**
   * Actions
   */
  init(context: T) {
    this.actions$.next({ type: ActionType.init, context });
  }
  next(context: T) {
    this.actions$.next({ type: ActionType.next, context });
  }
  iterate(action?: Action) {
    this.init(this.initialContext);
  }
  complete(context: T) {
    this.actions$.next({ type: ActionType.complete, context });
  }
  dispatchAction(action: Action) {
    this.actions$.next(action);
  }
  stop() {
    this.actions$.next({ type: ActionType.stop });
    this.actions$.complete();
  }
  async destroy() {
    this.pipesSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  getOptions(context):{st:string, num:number}{
    return {
    st:'gverg',
      num:56
    }
  }
  dispatch(context: T): {st:string, num:number} {
    this.uniqueJobId = uuidv4();
    this.initialContext = context;
    this.defaultState = context;
    if (!this.initialPipes.length) {
      this.initialPipes = this.pipes;
    }
    this.invokePipes();
    this.init(context);
    new Promise((resolve, reject) => {
      this.actions$
          .pipe(
              ofType(ActionType.stop),
              map((action) => action as Action),
              exhaustMap(async (action) => {
                console.log('in last exhaustMap complete', action)
                try {
                  // reject();
                  await this.destroy();
                  this.actions$.complete();
                } catch (error) {
                  // reject(error);
                }
              })
          )
          .subscribe();
      this.actions$
          .pipe(
              ofType(ActionType.complete),
              map((action) => action as Action),
              exhaustMap(async (action) => {
                try {
                  console.log('in try exhaustMap ', action)
                  await this.destroy();
                  this.actions$.complete();
                } catch (error) {
                  // reject(error);
                }
              })
          )
          .subscribe();
    });
    return this.getOptions(context)
  }


}
