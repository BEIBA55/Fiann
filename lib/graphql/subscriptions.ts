import { gql } from '@apollo/client';

export const REGISTRATION_CREATED = gql`
  subscription RegistrationCreated($eventId: ID!) {
    registrationCreated(eventId: $eventId) {
      id
      userId
      user {
        id
        name
        email
      }
      eventId
      status
      registeredAt
    }
  }
`;

export const REGISTRATION_UPDATED = gql`
  subscription RegistrationUpdated($eventId: ID!) {
    registrationUpdated(eventId: $eventId) {
      id
      userId
      user {
        id
        name
        email
      }
      eventId
      status
      registeredAt
    }
  }
`;

export const COMMENT_ADDED = gql`
  subscription CommentAdded($eventId: ID!) {
    commentAdded(eventId: $eventId) {
      id
      userId
      user {
        id
        name
        email
        avatar
      }
      content
      rating
      createdAt
    }
  }
`;

export const EVENT_CREATED = gql`
  subscription EventCreated {
    eventCreated {
      id
      title
      description
      date
      location
      capacity
      status
      category
      organizerId
      createdAt
    }
  }
`;

export const EVENT_UPDATED = gql`
  subscription EventUpdated {
    eventUpdated {
      id
      title
      description
      date
      location
      capacity
      status
      category
      registrationsCount
    }
  }
`;

