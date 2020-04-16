const executePolicy = require('../../users/executePolicy');
const { NotFound } = require('../../errors');

const findOne = async (args) => {
  try {
    // /////////////////////////////////////
    // 1. Retrieve and execute policy
    // /////////////////////////////////////

    const policy = args.config && args.config.policies && args.config.policies.read;
    await executePolicy(args.user, policy);

    let options = { ...args };

    // /////////////////////////////////////
    // 2. Execute before collection hook
    // /////////////////////////////////////

    const beforeReadHook = args.config && args.config.hooks && args.config.hooks.beforeRead;

    if (typeof beforeReadHook === 'function') {
      options = await beforeReadHook(options);
    }

    // /////////////////////////////////////
    // 3. Perform database operation
    // /////////////////////////////////////

    const {
      depth,
      api,
      Model,
      locale,
      slug,
      fallbackLocale,
    } = options;

    const queryOptionsToExecute = {
      options: {},
    };

    // Only allow depth override within REST.
    // If allowed in GraphQL, it would break resolvers
    // as a full object will be returned instead of an ID string
    if (api === 'REST') {
      if (depth && depth !== '0') {
        queryOptionsToExecute.options.autopopulate = {
          maxDepth: parseInt(depth, 10),
        };
      } else {
        queryOptionsToExecute.options.autopopulate = false;
      }
    }

    let result = await Model.findOne({ globalType: slug });

    if (!result) throw new NotFound();

    if (locale && result.setLocale) {
      result.setLocale(locale, fallbackLocale);
    }

    result = result.toJSON({ virtuals: true });

    // /////////////////////////////////////
    // 4. Execute after collection hook
    // /////////////////////////////////////

    const afterReadHook = args.config && args.config.hooks && args.config.hooks.afterRead;

    if (typeof afterReadHook === 'function') {
      result = await afterReadHook(options, result);
    }

    // /////////////////////////////////////
    // 5. Return results
    // /////////////////////////////////////

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = findOne;