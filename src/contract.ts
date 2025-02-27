import { SecretNetworkClient, MsgExecuteContract } from "secretjs";

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
    contract_address: "secret1fu0jw5ery758xpdgv98rdr0v52uhd827k37g9c", // Replace with your contract address
    code_hash: "f2bcfe74638d864143909ab6a02c9b5db81fd131f3bd4124b6a0f5ee88119f02", // Replace with your contract code hash
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