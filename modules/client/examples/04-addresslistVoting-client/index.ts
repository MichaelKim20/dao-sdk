/* MARKDOWN
---
title: Addresslist Voting Client
---

## Create an Addresslist Voting Client

Creates an AddresslistVoting client allowing you to access the AddresslistVoting plugin functionality.
*/

import { AddresslistVotingClient, ContextPlugin } from "@bosagora/sdk-client";
import { context } from "../index";

// Instantiate a plugin context from the BOSagora OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Instantiate an AddresslistVoting client from the BOSagora OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(contextPlugin);
console.log(addresslistVotingClient);
