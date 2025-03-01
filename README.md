# Secret AI Accountant System

**Help accountant to audit documents**

### Guide Step by Step

[Read the full guide](docs/guide.md)

### Live Demo Video
[Watch the live demo video](https://www.youtube.com/watch?v=TtaB35Svz4o)

## Summary

The **Secret AI Accountant System** is a decentralized application designed for businesses to securely manage their purchase ledger using **Secret Network's Confidential Computing**. By integrating **Secret AI, Secret OCR, and blockchain immutability**, this tool ensures transparency, accountability, and confidentiality for accounting records.

### How It Works:

1. **Upload Supporting Document**: The company uploads a supporting document (e.g., an invoice) that justifies an accounting entry.
2. **Secret OCR & AI Processing**: The **Secret OCR** extracts data from the document, and **Secret AI LLM** pre-fills the accounting ledger with the extracted details.
3. **Company Review & Edits**: The company can manually correct or adjust the extracted data before finalizing the entry.
4. **Credibility Score Assignment**: The system calculates a credibility score based on OCR accuracy and manual edits. Future updates will consider additional criteria.
5. **Hashing & Sealing on Secret Network**: Once validated, the document and accounting line are hashed and stored immutably on **Secret Network**.
6. **Auditor Access & Verification**: The company grants access to an auditor via wallet ID, enabling them to review and verify the accounting entry.

## Getting Started
[Isntallation Guide](docs/install.md)

## Code explanation
[Code Guide](docs/code.md)
## For Investor 

### **Problem Statement**:

Traditional accounting systems rely on **centralized, mutable records** that are prone to fraud, errors, and lack of transparency. Audits are often slow and expensive due to poor traceability and unreliable documentation.

### **Solution**:

The **Secret AI Accountant System** introduces a **decentralized, confidential, and immutable** ledger to ensure **auditability, security, and compliance**. By leveraging **Secret Network’s privacy features**, it guarantees that accounting data remains confidential yet **verifiable** for authorized auditors.

### **Product-Market Fit**:

- **Enterprises & SMEs**: Businesses that require **secure, traceable, and compliant** financial records.
- **Auditing Firms**: Auditors benefit from **instant access to verified financial records** without delays.
- **Regulatory & Compliance Bodies**: Governments and compliance organizations can use this system to ensure **financial integrity** without compromising confidentiality.

## Development Deepdive

### **Technical Architecture**:

- **Frontend**: Developed using **React.js + Tailwind CSS**, ensuring a modern and intuitive UI.
- **Backend**: Powered by **Secret Network Smart Contracts** to ensure confidential, immutable storage.
- **Secret OCR**: Extracts text from uploaded documents while preserving privacy.
- **Secret AI LLM**: Processes OCR results to pre-fill accounting ledger entries with **high accuracy**.
- **Blockchain Integration**:
  - The system hashes the document and accounting line and stores them on **Secret Network**.
  - Auditors can verify document authenticity by comparing hashes.
- **User Roles**:
  - **Company**: Uploads and validates accounting entries.
  - **Auditor**: Reviews, verifies, and approves or flags entries.

### **Smart Contract & Function Interactions**:

- **uploadDocument()**: Stores the document hash and extracted OCR data.
- **generateAccountingEntry()**: Uses **Secret AI** to pre-fill ledger entries.
- **sealOnChain()**: Finalizes and stores the ledger entry on **Secret Network**.
- **grantAuditorAccess(walletID)**: Allows an auditor to review specific records.
- **verifyLedgerEntry(hash)**: Enables auditors to cross-check document authenticity.
- **auditAction(status)**: Auditor can approve, flag, or request corrections on an entry.

### **Design Choices**:

1. **Confidential Computing**: Ensures privacy while enabling verifiable transactions.
2. **Blockchain Immutability**: Prevents financial fraud and enhances **trust in records**.
3. **AI & OCR Automation**: Reduces manual effort while improving **accuracy & efficiency**.

## TO-DO List

1. Integrate **Llama Vision** with **Secret AI** instead of relying on a public OCR API.
2. Improve the **smart contract** by adding an **Audit Module** and enhancing security mechanisms. Currently, the company can manually modify accounting line, which needs to be restricted through additional security logic on chain.
3. Develop a **JavaScript SDK** for seamless interaction with **Secret AI**, replacing the current Python proxy.
4. Enhance **company ERP integration** to support **ledger synchronization** with global financial records, ensuring seamless and scalable enterprise adoption.

## Conclusion

The **Secret AI Accountant System** is a game-changer for transparent and secure financial record-keeping. By combining **blockchain, AI, and confidential computing**, it empowers businesses and auditors with **trustworthy, verifiable, and efficient** accounting solutions.

🚀 **Built for the future of decentralized finance and enterprise accountability!**

