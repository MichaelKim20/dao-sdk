import { BigNumber } from "@ethersproject/bignumber";
import { arrayify } from "@ethersproject/bytes";
import { ERC20VotingDecoding } from "../../../src/erc20Voting/internal/decoding";

describe("ERC20Voting", () => {
  describe("Decoding", () => {
    it("should decode createProposal (data)", () => {
      const decoded = ERC20VotingDecoding.createProposal(
        "0xe910689700000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000000000000000000000000000000000000000ddd50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000041122334400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006b4584a05eb28016adf0b0a692dd71073fe4b5930000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000031234560000000000000000000000000000000000000000000000000000000000"
      );
      expect(decoded._actions).toMatchObject([
        {
          to: "0x6b4584A05EB28016aDf0B0A692DD71073Fe4B593",
          value: BigNumber.from("0"),
          data: arrayify("0x123456"),
        },
      ]);
      expect(decoded._choice).toBe(3);
      expect(decoded._endDate).toMatchObject(BigNumber.from("56789"));
      expect(decoded._executeIfDecided).toBe(false);
      expect(decoded._proposalMetadata).toBe("0x11223344");
      expect(decoded._startDate).toMatchObject(BigNumber.from("1234"));
    });

    it("should decode createProposal (tx)", () => {
      const decoded = ERC20VotingDecoding.createProposal({
        to: "0x2A681D76E4E55920cf0761b9F5d50f35DF8c4dd0",
        value: 0,
        data: arrayify(
          "0xe910689700000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000000000000000000000000000000000000000ddd50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000041122334400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006b4584a05eb28016adf0b0a692dd71073fe4b5930000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000031234560000000000000000000000000000000000000000000000000000000000"
        ),
      });
      expect(decoded._actions).toMatchObject([
        {
          to: "0x6b4584A05EB28016aDf0B0A692DD71073Fe4B593",
          value: BigNumber.from("0"),
          data: arrayify("0x123456"),
        },
      ]);
      expect(decoded._choice).toBe(3);
      expect(decoded._endDate).toMatchObject(BigNumber.from("56789"));
      expect(decoded._executeIfDecided).toBe(false);
      expect(decoded._proposalMetadata).toBe("0x11223344");
      expect(decoded._startDate).toMatchObject(BigNumber.from("1234"));
    });

    it("should decode execute (data)", () => {
      const decoded = ERC20VotingDecoding.execute(
        "0xfe0d94c10000000000000000000000000000000000000000000000000000000000000005"
      );
      expect(decoded._voteId).toMatchObject(BigNumber.from("5"));
    });

    it("should decode execute (tx)", () => {
      const decoded = ERC20VotingDecoding.execute({
        to: "0x2A681D76E4E55920cf0761b9F5d50f35DF8c4dd0",
        value: 0,
        data: arrayify(
          "0xfe0d94c10000000000000000000000000000000000000000000000000000000000000005"
        ),
      });
      expect(decoded._voteId).toMatchObject(BigNumber.from("5"));
    });

    it("should decode setConfiguration (data)", () => {
      const decoded = ERC20VotingDecoding.setConfiguration(
        "0x9b979e2f000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000038"
      );
      expect(decoded._participationRequiredPct).toMatchObject(
        BigNumber.from("12")
      );
      expect(decoded._supportRequiredPct).toMatchObject(BigNumber.from("34"));
      expect(decoded._minDuration).toMatchObject(BigNumber.from("56"));
    });

    it("should decode setConfiguration (tx)", () => {
      const decoded = ERC20VotingDecoding.setConfiguration({
        to: "0x2A681D76E4E55920cf0761b9F5d50f35DF8c4dd0",
        value: 0,
        data: arrayify(
          "0x9b979e2f000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000038"
        ),
      });
      expect(decoded._participationRequiredPct).toMatchObject(
        BigNumber.from("12")
      );
      expect(decoded._supportRequiredPct).toMatchObject(BigNumber.from("34"));
      expect(decoded._minDuration).toMatchObject(BigNumber.from("56"));
    });

    it("should decode vote (data)", () => {
      const decoded = ERC20VotingDecoding.vote(
        "0xce6366c400000000000000000000000000000000000000000000000000000000000004d200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
      );
      expect(decoded._voteId).toMatchObject(BigNumber.from("1234"));
      expect(decoded._executesIfDecided).toBe(true);
      expect(decoded._choice).toBe(1);
    });

    it("should decode vote (tx)", () => {
      const decoded = ERC20VotingDecoding.vote({
        to: "0x2A681D76E4E55920cf0761b9F5d50f35DF8c4dd0",
        value: 0,
        data: arrayify(
          "0xce6366c400000000000000000000000000000000000000000000000000000000000004d200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001"
        ),
      });
      expect(decoded._voteId).toMatchObject(BigNumber.from("1234"));
      expect(decoded._executesIfDecided).toBe(true);
      expect(decoded._choice).toBe(1);
    });
  });
});
