import { withFilter } from 'graphql-subscriptions';
import { pubsub, SubscriptionEvent } from '../pubsub';

export const subscriptionResolvers = {
  Subscription: {
    eventCreated: {
      subscribe: () => pubsub.asyncIterator([SubscriptionEvent.EVENT_CREATED]),
    },

    eventUpdated: {
      subscribe: () => pubsub.asyncIterator([SubscriptionEvent.EVENT_UPDATED]),
    },

    registrationCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([SubscriptionEvent.REGISTRATION_CREATED]),
        (payload, variables) => {
          // Проверяем eventId из payload или из отдельного поля
          const regEventId = payload.registrationCreated?.eventId?.toString() || 
                             payload.registrationCreated?.eventId || 
                             payload.eventId?.toString() || 
                             payload.eventId;
          const matches = regEventId === variables.eventId;
          console.log(`🔍 Фильтр REGISTRATION_CREATED: payload.eventId=${regEventId}, variables.eventId=${variables.eventId}, matches=${matches}`);
          return matches;
        }
      ),
    },

    registrationUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([SubscriptionEvent.REGISTRATION_UPDATED]),
        (payload, variables) => {
          // Проверяем eventId из payload или из отдельного поля
          const regEventId = payload.registrationUpdated?.eventId?.toString() || 
                             payload.registrationUpdated?.eventId || 
                             payload.eventId?.toString() || 
                             payload.eventId;
          const matches = regEventId === variables.eventId;
          console.log(`🔍 Фильтр REGISTRATION_UPDATED: payload.eventId=${regEventId}, variables.eventId=${variables.eventId}, matches=${matches}`);
          return matches;
        }
      ),
    },

    commentAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([SubscriptionEvent.COMMENT_ADDED]),
        (payload, variables) => {
          // Проверяем eventId из payload или из отдельного поля
          const commentEventId = payload.commentAdded?.eventId?.toString() || 
                                 payload.commentAdded?.eventId || 
                                 payload.eventId?.toString() || 
                                 payload.eventId;
          const matches = commentEventId === variables.eventId;
          console.log(`🔍 Фильтр COMMENT_ADDED: payload.eventId=${commentEventId}, variables.eventId=${variables.eventId}, matches=${matches}`);
          return matches;
        }
      ),
    },
  },
};

