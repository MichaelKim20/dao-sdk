import { gql } from "graphql-request";

export const QueryAddressListProposal = gql`
query addressListProposal($proposalId: ID!) {
  addresslistProposal(id: $proposalId){
    id
    dao {
      id
      name
    }
    creator
    metadata
    createdAt
    actions {
      to
      value
      data
    }
    yes,
    no,
    abstain
    startDate
    endDate
    executed
    executable
    votingMode
    supportThreshold
    minParticipation
    totalVotingPower
    voters{
      voter{
        id
      }
      vote
    }
    census
  }
}
`;
export const QueryAddressListProposals = gql`
query addressListProposals($where: ERC20VotingProposal_filter!, $limit:Int!, $skip: Int!, $direction: OrderDirection!, $sortBy: ERC20VotingProposal_orderBy!) {
  addresslistProposals(where: $where, first: $limit, skip: $skip, orderDirection: $direction, orderBy: $sortBy){
    id
    dao {
      id
      name
    }
    creator
    metadata
    yes
    no
    abstain
    startDate
    endDate
    executed
    executable
  }
}
`;
