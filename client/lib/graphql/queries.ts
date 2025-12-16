import { gql } from '@apollo/client';

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatar
    }
  }
`;

export const EVENTS = gql`
  query Events($status: EventStatus, $category: EventCategory, $limit: Int, $offset: Int) {
    events(status: $status, category: $category, limit: $limit, offset: $offset) {
      id
      title
      description
      date
      location
      capacity
      status
      category
      organizerId
      organizer {
        id
        name
        email
      }
      registrationsCount
      createdAt
    }
  }
`;

export const EVENT = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      location
      capacity
      status
      category
      organizerId
      organizer {
        id
        name
        email
        avatar
      }
      registrationsCount
      createdAt
    }
  }
`;

export const MY_EVENTS = gql`
  query MyEvents {
    myEvents {
      id
      title
      description
      date
      location
      capacity
      status
      category
      registrationsCount
      createdAt
    }
  }
`;

export const MY_REGISTRATIONS = gql`
  query MyRegistrations {
    myRegistrations {
      id
      userId
      eventId
      event {
        id
        title
        date
        location
      }
      status
      registeredAt
    }
  }
`;

export const REGISTRATIONS = gql`
  query Registrations($eventId: ID) {
    registrations(eventId: $eventId) {
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

export const COMMENTS = gql`
  query Comments($eventId: ID!) {
    comments(eventId: $eventId) {
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

export const USERS = gql`
  query Users {
    users {
      id
      name
      email
      role
      avatar
      createdAt
    }
  }
`;

