import { SecretNetworkClient, MsgExecuteContract } from "secretjs";
import { config } from "./config";

interface Invoice {
  invoice_number: string;
  date: string;
  client_name: string;
  description: string;
  total_amount: string;
  tax_amount: string;
  currency: string;
  doc_hash: string;
  line_hash: string;
  auditors: string;
  credibility: string;
  audit_state: string;
}

export const add_invoice = async (secretjs: SecretNetworkClient, invoice: Invoice) => {
  const addInvoiceMsg = new MsgExecuteContract({
    sender: secretjs.address,
    contract_address: config.contractAddress,
    code_hash: config.codeHash,
    msg: { add: { invoice } },
    sent_funds: [], // optional
  });

  try {
    const tx = await secretjs.tx.broadcast([addInvoiceMsg], {
      gasLimit: 200_000,
    });
    console.log("Transaction broadcasted:", tx);
  } catch (error) {
    console.error("Error broadcasting transaction:", error);
  }
};

export const get_all_invoices = async (secretjs: SecretNetworkClient, wallet: any, permitName: string, allowedTokens: string) => {
  const myAddress = wallet.address;

  const { signature } = await wallet.signAmino(
    config.chainId,
    myAddress,
    {
      chain_id: config.chainId,
      account_number: "0", // Must be 0
      sequence: "0", // Must be 0
      fee: {
        amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
        gas: "1", // Must be 1
      },
      msgs: [
        {
          type: "query_permit", // Must be "query_permit"
          value: {
            permit_name: permitName,
            allowed_tokens: [allowedTokens],
            permissions: [],
          },
        },
      ],
      memo: "", // Must be empty
    },
    {
      preferNoSetFee: true, // Fee must be 0, so hide it from the user
      preferNoSetMemo: true, // Memo must be empty, so hide it from the user
    }
  );

  try {
    const invoicesQuery = await secretjs.query.compute.queryContract({
      contract_address: config.contractAddress,
      code_hash: config.codeHash,
      query: {
        get_all_invoices: {
          permit: {
            params: {
              permit_name: permitName,
              allowed_tokens: [allowedTokens],
              chain_id: config.chainId,
              permissions: [],
            },
            signature: signature,
          },
        },
      },
    });
    console.log("Invoices query result:", invoicesQuery);
    return invoicesQuery;
  } catch (error) {
    console.error("Error querying invoices:", error);
  }
};