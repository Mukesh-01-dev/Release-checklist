import { gql } from "@apollo/client";

export const GET_RELEASES = gql`
  query GetReleases {
    releases {
      id
      name
      dueDate
      additionalInfo
      status
      completedSteps
      totalSteps
      steps {
        stepId
        title
        completed
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_RELEASE = gql`
  query GetRelease($id: ID!) {
    release(id: $id) {
      id
      name
      dueDate
      additionalInfo
      status
      completedSteps
      totalSteps
      steps {
        stepId
        title
        completed
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_RELEASE = gql`
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      id
      name
      dueDate
      additionalInfo
      status
      completedSteps
      totalSteps
      steps { stepId title completed }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RELEASE = gql`
  mutation UpdateRelease($id: ID!, $input: UpdateReleaseInput!) {
    updateRelease(id: $id, input: $input) {
      id
      name
      dueDate
      additionalInfo
      status
      completedSteps
      totalSteps
      steps { stepId title completed }
      createdAt
      updatedAt
    }
  }
`;


export const TOGGLE_STEP = gql`
  mutation ToggleStep($releaseId: ID!, $stepId: Int!) {
    toggleStep(releaseId: $releaseId, stepId: $stepId) {
      id
      name
      dueDate
      additionalInfo
      status
      completedSteps
      totalSteps
      steps {
        stepId
        title
        completed
      }
      createdAt
      updatedAt
    }
  }
`;


export const DELETE_RELEASE = gql`
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;