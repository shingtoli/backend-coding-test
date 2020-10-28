/* eslint-disable */

function getOffset(context, events, done) {
  const id = context.vars['id'];
  context.vars['offset'] = Math.max(id - 50, 0);
  return done();
}
