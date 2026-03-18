import 'dotenv/config';

// Merge environment variables into Expo config extras so they are
// accessible at runtime via Constants.expoConfig.extra.
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      TICKET_API_TOKEN: process.env.TICKET_API_TOKEN,
    },
  };
};
