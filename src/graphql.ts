import {generateClient} from 'aws-amplify/api';

// NOTE: Create an issue upstream to export this type
export type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

const client = generateClient();

// Define a generic type for a function
type Func<T extends any[], R> = (...args: T) => R; // eslint-disable-line @typescript-eslint/no-explicit-any

const wait = (ms: number) =>
  new Promise(res => {
    setTimeout(res, ms);
  });

const maxRetries = 3;

const retry =
  <T extends any[], R>(originalFunction: Func<T, R>): Func<T, Promise<R>> =>
  async (...args: T) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    let retries = 0;
    let error: Error;

    for (;;) {
      try {
        return originalFunction(...args);
      } catch (err) {
        console.debug(err);
        retries += 1;

        const errors = (err as {errors: Error[]}).errors || [];
        [error] = errors;

        if (error && error.message === 'Network Error') {
          if (retries > maxRetries) {
            // Sentry.captureMessage('GraphQL Network Error: Too many retries', {
            //   extra: {json: JSON.stringify(err), retries},
            // });

            throw err;
          }

          console.error('We got a network error, we should retry', retries);
          await wait(2 ** retries * 10); // eslint-disable-line no-await-in-loop
        } else {
          // If max retries reached, throw the last error
          console.error('GraphQL Error2', err);
          // Sentry.captureMessage(`GraphQL Error ${args[0]}`, {
          //   extra: {
          //     errors: JSON.stringify(errors),
          //     retries,
          //     data: JSON.stringify(err, null, 2).slice(0, 200),
          //   },
          // });

          throw err;
        }
      }
    }
  };

export const graphql = retry(client.graphql);
