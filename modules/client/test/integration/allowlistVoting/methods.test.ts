import { DAO, DAO__factory } from "@aragon/core-contracts-ethers";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { Server } from "ganache";
import {
  createAllowlistDAO,
  deploy,
  Deployment,
} from "../../helpers/deployContracts";
import { start } from "../../helpers/ganache-setup";
import {
  AllowlistVoting,
  AllowlistVotingContextPlugin,
  Steps,
} from "../../../src/allowlistVoting";
import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { id } from "@ethersproject/hash";
import { arrayify } from "@ethersproject/bytes";

describe("AllowlistVoting", () => {
  describe("Methods", () => {
    let server: Server;
    let deployments: Deployment;
    let allowlistVoting: AllowlistVoting;
    let daoAddr: string;
    let signer: Signer;
    let provider: JsonRpcProvider;

    beforeAll(async () => {
      server = await start();
      deployments = await deploy();
    });

    beforeEach(async () => {
      provider = new JsonRpcProvider("http://127.0.0.1:8545");
      signer = provider.getSigner();

      let createDaoReturns = await createAllowlistDAO(
        deployments,
        Math.round(Math.random() * 2000).toString(16),
        [await signer.getAddress()]
      );
      const context = new AllowlistVotingContextPlugin({
        pluginAddress: createDaoReturns.pluginAddrs[0],
        daoFactoryAddress: deployments.daoFactory.address,
        web3Providers: [provider],
        signer: signer,
      });

      allowlistVoting = new AllowlistVoting(context);
      daoAddr = createDaoReturns.daoAddr;
    });

    afterAll(async () => {
      await server.close();
    });

    it("should add users", async () => {
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      const pendingStep = await call.next();
      const doneStep = await call.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );

      expect(doneStep.value.key).toBe(Steps.DONE);
      await advanceBlocks(provider, 5);
      const blockNumber = await provider.getBlockNumber();
      for (const user of randomUsers) {
        expect(
          await allowlistVoting.methods.isAllowed(user, BigInt(blockNumber - 1))
        ).toBe(true);
      }
    });

    it("should return the correct user count", async () => {
      await advanceBlocks(provider, 5);
      let blockNumber = await provider.getBlockNumber();
      let count = await allowlistVoting.methods.allowedUserCount(
        BigInt(blockNumber - 1)
      );
      expect(count.toString()).toBe("1");

      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      await call.next();
      await call.next();

      await advanceBlocks(provider, 5);

      blockNumber = await provider.getBlockNumber();
      count = await allowlistVoting.methods.allowedUserCount(
        BigInt(blockNumber - 1)
      );
      expect(count.toString()).toBe("4");
    });

    it("should return the correct canExecute", async () => {
      const proposalId = await createProposal(allowlistVoting);
      expect(await allowlistVoting.methods.canExecute(proposalId)).toBe(true);
      const execute = await allowlistVoting.methods.execute(proposalId);
      await execute.next();
      await execute.next();
      expect(await allowlistVoting.methods.canExecute(proposalId)).toBe(false);
    });

    it("should return the correct canVote", async () => {
      const proposalId = await createProposal(allowlistVoting);
      const signerAddress = await signer.getAddress();
      expect(
        await allowlistVoting.methods.canVote(proposalId, signerAddress)
      ).toBe(true);
      const execute = await allowlistVoting.methods.execute(proposalId);
      await execute.next();
      await execute.next();
      expect(
        await allowlistVoting.methods.canVote(proposalId, signerAddress)
      ).toBe(false);
    });

    it("should create a proposal", async () => {
      const generator = allowlistVoting.methods.createProposal({
        _proposalMetadata: arrayify("0x000001"),
        _actions: [
          {
            data: arrayify("0x"),
            to: daoAddr,
            value: BigInt(0),
          },
        ],
        _startDate: 0,
        _endDate: Math.round(Date.now() / 1000) + 3600,
        _executeIfDecided: false,
        _choice: 0,
      });

      for await (const step of generator) {
        switch (step.key) {
          case Steps.PENDING:
            expect(await validateTXHash(provider, step.txHash)).toBe(true);
            break;
          case Steps.DONE:
            expect(step.proposalId).not.toBeNaN();
            expect(step.proposalId).toBe(0);
            break;
        }
      }
    });

    it("should execute", async () => {
      const proposalId = await createProposal(allowlistVoting);
      const generator = allowlistVoting.methods.execute(proposalId);
      const pendingStep = await generator.next();
      const doneStep = await generator.next();

      expect(pendingStep.value.key).toBe(Steps.PENDING);
      expect(await validateTXHash(provider, pendingStep.value.txHash)).toBe(
        true
      );
      expect(doneStep.value.key).toBe(Steps.DONE);
    });

    it("should return the correct vote", async () => {
      const toAddr = Wallet.createRandom().address;
      const startDate = Date.now();
      const endDate = startDate + 3600;
      const proposalId = await createProposal(
        allowlistVoting,
        toAddr,
        startDate,
        endDate
      );
      await advanceBlocks(provider, 2);
      const proposal = await allowlistVoting.methods.getProposal(proposalId);
      expect(proposal.id).toBe(proposalId);
      expect(proposal.open).toBe(false);
      expect(proposal.executed).toBe(false);
      expect(proposal.startDate.toString()).toBe(startDate.toString());
      expect(proposal.endDate.toString()).toBe(endDate.toString());
      expect(proposal.yes.toString()).toBe("0");
      expect(proposal.no.toString()).toBe("0");
      expect(proposal.abstain.toString()).toBe("0");
    });

    it("should allow to vote", async () => {
      await advanceBlocks(provider, 2);
      const proposalId = await createProposal(allowlistVoting);

      const voterAddr = await signer.getAddress();
      let vote = await allowlistVoting.methods.getVoteOption(
        proposalId,
        voterAddr
      );
      expect(vote).toBe(2);

      const voting = await allowlistVoting.methods.vote({
        _proposalId: proposalId,
        _choice: 3,
        _executesIfDecided: false,
      });
      await voting.next();
      await voting.next();

      vote = await allowlistVoting.methods.getVoteOption(proposalId, voterAddr);
      expect(vote).toBe(3);
    });

    it("should remove allowed Users", async () => {
      await advanceBlocks(provider, 5);
      await provider.getBlockNumber();
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );
      const randomUsers: string[] = [];
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      randomUsers.push(Wallet.createRandom().address);
      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("MODIFY_ALLOWLIST_PERMISSION")
      );

      const call = await allowlistVoting.methods.addAllowedUsers(randomUsers);
      await call.next();
      await call.next();

      await advanceBlocks(provider, 5);

      let blockNumber = await provider.getBlockNumber();

      expect(
        await allowlistVoting.methods.isAllowed(
          randomUsers[0],
          BigInt(blockNumber - 1)
        )
      ).toBe(true);

      const removeCall = await allowlistVoting.methods.removeAllowedUsers([
        randomUsers[0],
      ]);
      await removeCall.next();
      await removeCall.next();

      await advanceBlocks(provider, 5);

      blockNumber = await provider.getBlockNumber();

      expect(
        await allowlistVoting.methods.isAllowed(
          randomUsers[0],
          BigInt(blockNumber - 1)
        )
      ).toBe(false);
    });

    it("should change the configuration", async () => {
      await becomeRoot(
        allowlistVoting,
        daoAddr,
        allowlistVoting.pluginInstance.address,
        await signer.getAddress()
      );

      const dao = getDAOInstance(daoAddr, signer);
      await dao.grant(
        allowlistVoting.pluginInstance.address,
        await signer.getAddress(),
        id("SET_CONFIGURATION_PERMISSION")
      );

      const steps = await allowlistVoting.methods.setConfiguration({
        _participationRequiredPct: 20,
        _supportRequiredPct: 30,
        _minDuration: 40,
      });
      await steps.next();
      await steps.next();

      expect(await allowlistVoting.methods.participationRequiredPct()).toBe(20);
      expect(await allowlistVoting.methods.supportRequiredPct()).toBe(30);
      expect(await allowlistVoting.methods.minDuration()).toBe(40);
    });
  });
});

async function createProposal(
  allowlistVoting: AllowlistVoting,
  to: string = Wallet.createRandom().address,
  startDate: number = 0,
  endDate: number = 0
): Promise<number> {
  const generator = allowlistVoting.methods.createProposal({
    _proposalMetadata: arrayify("0x00"),
    _actions: [
      {
        data: arrayify("0x00"),
        to,
        value: BigInt(0),
      },
    ],
    _startDate: startDate,
    _endDate: endDate,
    _executeIfDecided: false,
    _choice: 2,
  });

  for await (const step of generator) {
    switch (step.key) {
      case Steps.DONE:
        return step.proposalId;
    }
  }
  return 0;
}

async function becomeRoot(
  allowlistVoting: AllowlistVoting,
  daoAddr: string,
  where: string,
  who: string
): Promise<void> {
  const encodedGrant = getDAOInterface().encodeFunctionData("grant", [
    where,
    who,
    id("ROOT_PERMISSION"),
  ]);
  const voteGenerator = allowlistVoting.methods.createProposal({
    _proposalMetadata: arrayify("0x00"),
    _actions: [
      {
        to: daoAddr,
        data: arrayify(encodedGrant),
        value: BigInt(0),
      },
    ],
    _startDate: 0,
    _endDate: 0,
    _executeIfDecided: true,
    _choice: 2,
  });

  await voteGenerator.next();
  await voteGenerator.next();
}

async function validateTXHash(
  provider: Provider,
  txhash: string
): Promise<boolean> {
  const tx = await provider.getTransaction(txhash);
  return tx.hash === txhash;
}

function getDAOInstance(daoAddr: string, signer: Signer): DAO {
  return DAO__factory.connect(daoAddr, signer);
}

function getDAOInterface() {
  return DAO__factory.createInterface();
}

async function advanceBlocks(
  provider: JsonRpcProvider,
  amountOfBlocks: number
) {
  for (let i = 0; i < amountOfBlocks; i++) {
    await provider.send("evm_mine", []);
  }
}
