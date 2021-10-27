/**
 *
 * main() will be executed when you call this action.
 *
 * @param params Cloud Functions actions accept a single parameter, which must be a JSON object.
 *
 * @return The output of this action, which must be a JSON object.
 *
 * */

type Params = {
  name?: string;
};

// eslint-disable-next-line no-unused-vars
function main(params: Params) {
  if (params.name) {
    return { message: `Hello ${params.name}` };
  }
  return { message: 'Hello World' };
}
