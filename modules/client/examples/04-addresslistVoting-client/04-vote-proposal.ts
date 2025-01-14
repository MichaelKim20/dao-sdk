/* MARKDOWN
---
title: Vote
---

## Vote on a Addresslist Voting Proposal

Enables voting on a proposal using the Addresslist Voting plugin installed within a DAO.
*/

import {
  AddresslistVotingClient,
  ContextPlugin,
  IVoteProposalParams,
  VoteProposalStep,
  VoteValues
} from "@bosagora/sdk-client";
import { context } from "../index";

// Create a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Create an Addresslist client to use the Addresslist plugin.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const voteParams: IVoteProposalParams = {
  proposalId: "0x1234567890123456789012345678901234567890_0x0",
  vote: VoteValues.YES // alternatively NO, or ABSTAIN
};

// Vote on an Addresslist proposal.
const steps = addresslistVotingClient.methods.voteProposal(voteParams);

for await (const step of steps) {
  try {
    switch (step.key) {
      case VoteProposalStep.VOTING:
        console.log({ txHash: step.txHash });
        break;
      case VoteProposalStep.DONE:
        break;
    }
  } catch (err) {
    console.error({ err });
  }
}
