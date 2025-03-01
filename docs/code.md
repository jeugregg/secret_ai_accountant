# Code explaination

- [CompanyScreen.tsx](#companyscreentsx)
- [AuditorScreen.tsx](#auditorscreentsx)
- [contract.ts](#contractts)
- [contract.rs](#contractrs)

#
# CompanyScreen.tsx 

This document explains the code within `CompanyScreen.tsx`, a React component responsible for the user interface of a Secret Network-based invoice processing application.

## Overview

`CompanyScreen.tsx` provides a user interface for uploading invoices, extracting data using OCR, pre-filling a form, calculating a credibility score, and finally sealing the invoice information on the Secret Network blockchain.  It also allows adding an auditor to the invoice.  The component interacts with several external services and the Secret Network blockchain through `secretjs`.

## Key Features and Functionality

1. **File Upload and Processing:**
   - The component handles file uploads using a standard file input (`<input type="file">`).
   - `handleFileChange` initiates the process:
     - It first creates a fingerprint of the uploaded file using `createFingerprint`.
     - Then, it uses `ocrService.extractTextFromPDF` to extract text from the uploaded PDF using OCR.
     - Finally, it calls the API using the `callApi()` method which  pre-fills the form based on the extracted data.
   - The current operation state is updated during the process (`currentOperation`).

2. **OCR and API Integration:**
   - `extractText` uses `ocrService` to perform OCR on the uploaded file.
   - `callApi` sends the OCR results to a backend API (`config.apiInvoiceUrl`) to get structured invoice data.
   - `callCredibilityApi` sends both the OCR results and the structured data to a different API (`config.apiCredibilityUrl`) to obtain a credibility score.

3. **Form Handling:**
   - The extracted data is displayed in an editable table.
   - `handleTableChange` updates the `tableData` state based on user edits in the table.

4. **Blockchain Interaction (Secret Network):**
   - `sealOnBC` is the core function for interacting with the Secret Network.
   - It retrieves the credibility score, calculates a line hash using `hashLinedata`, and constructs an `invoice` object.
   - The `add_invoice` function (imported from `./contract`) is used to submit the invoice data to the Secret Network contract.
   - `get_all_invoices` retrieves all invoices from the blockchain for display in the ledger.

5. **Auditor Management:**
   - The component allows adding an auditor's address (`auditorAddress`).
   - `addAuditor` uses `update_auditor` (imported from `./contract`) to add the auditor to the blockchain.

6. **Ledger Display:**
   - `fetchInvoices` retrieves all invoices from the blockchain using `get_all_invoices`.
   - The ledger is dynamically updated based on the data fetched from the blockchain.
   - Horizontal scrolling is implemented using `handleScroll`.

7. **Clipboard Copy:**
   - `copyToClipboard` utilizes the navigator's clipboard API for copying the fingerprint to the user's clipboard.

8. **Error Handling:**
   - Basic error handling is implemented using `try...catch` blocks.

9. **State Management:**
   - The component utilizes `useState` for managing various states, such as uploaded files, OCR results, table data, and blockchain interactions.
   - `useRef` is used for managing DOM elements.
   - `useEffect` is used for handling side effects, such as fetching invoices and updating the UI based on state changes.


## Dependencies

- `react`, `react-dom`, `lucide-react`, `crypto-js`, `secretjs`
- Custom services/functions: `ocrService`, `createFingerprint`, `add_invoice`, `get_all_invoices`, `update_auditor` (from `./contract`).


## Data Structures

- `ApiResponsePrefill`: Interface for the pre-filled invoice data received from the API.
- `ApiResponse`: Interface for the API response containing invoice details and hash values.
- `BcResponse`: Interface for the invoice details fetched from the blockchain.
- `Invoice`: Struct representing the invoice data stored on the blockchain (defined in the smart contract).


## Code Structure

The code is well-organized into functional sections, with clear naming conventions for components and functions. The use of interfaces improves code readability and maintainability.


This detailed breakdown should give a comprehensive understanding of the `CompanyScreen.tsx` component's functionality and how it interacts with other parts of the application and the Secret Network blockchain.  Remember that some functions (like `createFingerprint`, `ocrService`, and the contract interaction functions) are not fully detailed here, but their purpose and interaction with the `CompanyScreen` is made clear.

#
# AuditorScreen.tsx 

This document explains the code within `AuditorScreen.tsx`, a React component designed for auditors to review and approve invoices stored on the Secret Network blockchain.

## Overview

`AuditorScreen.tsx` presents a user interface allowing auditors to:

1. Upload a document to verify its fingerprint against a blockchain record.
2. View a ledger of invoices, displaying their status and details.
3. Approve, request corrections, or flag issues for each invoice.

The component interacts with the Secret Network blockchain via `secretjs` and uses OCR (likely through the `ocrService` from another file).

## Key Features and Functionality

1. **File Upload and Fingerprint Verification:**
   - The component handles file uploads using a file input (`<input type="file">`).
   - `handleFileChange` uses `createFingerprint` to generate a fingerprint of the uploaded file.
   - `compareFingerprints` compares the generated fingerprint with the `doc_hash` from the ledger data (`ledgerData[0].doc_hash`).
   - The result (`fingerprintMatch`) updates the UI, indicating whether there's a match.

2. **Blockchain Interaction (Secret Network):**
   - `fetchInvoicesByAuditor` retrieves invoices from the Secret Network using `get_all_invoices` from the `./contract` module.
   - It uses the auditor's wallet (`secretjs_auditor`) for interaction.

3. **Invoice Ledger Display:**
   - The ledger displays data from `ledgerData`, including `audit_state`.
   - Horizontal scrolling is implemented using `handleScroll`.

4. **Audit Actions:**
   - Buttons allow the auditor to perform actions: "req. corr.", "approve", or "flag issue".
   - `handleAuditAction` updates the `audit_state` of the corresponding invoice in the `ledgerData` state and updates localStorage with this new state. This simulates updating the blockchain; in a production environment, this would involve sending transactions to the contract.

5. **State Management:**
   - The component uses `useState` to manage the upload status (`isUploading`), ledger data (`ledgerData`), fingerprint match (`fingerprintMatch`), and broadcasting status (`isBroadcasting`).
   - `useRef` is used for DOM element management (scroll container, table).
   - `useEffect` is used for fetching invoices and managing side effects.

6. **Company Selection:**
    - The component includes a section for selecting the company whose invoices will be audited.  This is handled by `setSelectedCompany`, and only affects the UI; the actual audit process doesn't appear to depend on this selection in the provided code.

## Dependencies

- `react`, `react-dom`, `lucide-react`, `secretjs`
- Custom functions: `createFingerprint`, `ocrService`, `get_all_invoices` (from `./contract`).


## Data Structures

- `ApiResponse`: Interface for API response (presumably from a backend service).
- `BcResponse`: Interface for invoice data retrieved from the blockchain.


## Code Structure

The code is generally well-organized, with functions clearly separated by purpose. However, the audit actions are simulated using `setTimeout`, which should be replaced with actual blockchain transactions in a production environment.  The company selection feature is currently not integrated into the core audit functionality.


This breakdown should help understand `AuditorScreen.tsx`.  The lack of actual blockchain transaction calls within `handleAuditAction` should be noted as a crucial point to address for real-world deployment.  Similarly, the company selection functionality needs a complete integration to be fully effective.

#
# contract.ts 


This file defines functions for interacting with a Secret Network smart contract responsible for managing invoices.  The contract's address and code hash are fetched from the `config.ts` file.

## Functions

### `add_invoice(secretjs: SecretNetworkClient, invoice: Invoice)`

This function adds a new invoice to the smart contract.

*   **Parameters:**
    *   `secretjs`: An instance of `SecretNetworkClient` for interacting with the Secret Network.
    *   `invoice`: An `Invoice` object containing the invoice data.  The `Invoice` interface is defined within the file.

*   **Functionality:**
    *   Creates a `MsgExecuteContract` message to call the `add` function of the smart contract.  The `add` function within the contract takes the invoice data as its argument.
    *   Broadcasts the message using `secretjs.tx.broadcast`.
    *   Returns the transaction hash if successful, or logs an error if the transaction fails.

### `get_all_invoices(secretjs: SecretNetworkClient, wallet: any, permitName: string, allowedTokens: string)`

This function retrieves all invoices associated with a specific wallet address from the smart contract.  It utilizes Secret Network's permissioning mechanisms.


*   **Parameters:**
    *   `secretjs`: An instance of `SecretNetworkClient`.
    *   `wallet`: A wallet object (likely from `secretjs`) used for signing the query.
    *   `permitName`: The name of the permit used for authorization.
    *   `allowedTokens`:  An array of allowed tokens for the permit.


*   **Functionality:**
    *   The function first signs a message using the provided `wallet` to obtain a signature. This signature is essential for fulfilling the permission requirements of the contract's query.
    *   It then constructs a query to the `get_all` function of the smart contract. This query includes the wallet address, an index (set to 0), and the permit with its signature.
    *   The function retrieves the invoices, logs the query result, and returns the retrieved invoices.

### `update_auditor(secretjs: SecretNetworkClient, index: number, auditor: string)`

This function updates the auditor for a specific invoice.

*   **Parameters:**
    *   `secretjs`: An instance of `SecretNetworkClient`.
    *   `index`: The index of the invoice to update.
    *   `auditor`: The new auditor's address.

*   **Functionality:**
    *   Creates a `MsgExecuteContract` message to call the `update_auditor` function of the smart contract with the index of the invoice and the new auditor address.
    *   Broadcasts the message using `secretjs.tx.broadcast`.
    *   Returns the transaction hash upon success, or logs an error otherwise.


## Data Structures

### `Invoice` Interface

This interface defines the structure of an invoice object:

```typescript
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
```
# 
# contract.rs 

This file contains the Rust code for a CosmWasm smart contract that manages invoices on the Secret Network.  The contract uses Secret Network's permissioning features for secure data access.

## Contract Structure

The contract uses the `cosmwasm_std` and `secret_toolkit` crates.  Key functionalities are implemented using CosmWasm's entry points: `instantiate`, `execute`, and `query`.

## Functions

### `instantiate`

This function initializes the contract.  It sets the initial count (likely for testing purposes) and stores the address of the contract creator as the owner.  Only the owner can perform certain actions, such as resetting the count or updating auditors.

### `execute`

This function handles the execution of messages sent to the contract.  It dispatches based on the `ExecuteMsg` variant:

*   `Increment`: Increments a counter (likely for testing).
*   `Reset`: Resets the counter to a specified value.  Only the contract owner can perform this action.
*   `Add`: Adds a new invoice to the contract's storage. Only the owner can add invoices.
*   `UpdateAuditor`: Updates the auditor associated with a specific invoice.  Only the owner can update auditors.

### `try_increment`, `try_reset`, `try_add`, `try_update_auditor`

These are helper functions called by `execute` to perform the respective actions. They include access control checks to ensure only the contract owner can modify the contract state.  `try_add` saves the invoice data to storage.  `try_update_auditor` updates the auditor field of a given invoice.

### `query`

This function handles query messages sent to the contract.  It dispatches based on the `QueryMsg` variant:

*   `GetCount`: Returns the current value of the counter (mainly for testing).
*   `GetAll`: Retrieves all invoices for a given wallet address, validated by a permit.  This demonstrates Secret Network's permissioning mechanism.  The permit ensures only authorized parties (the owner or an auditor) can access the sensitive invoice data.

### `query_count`

This helper function retrieves the counter value from contract state.

### `get_all`

This is a crucial function that retrieves all invoices for a given wallet.  It performs the following:

1.  **Permit Validation:** It uses `secret_toolkit::permit::validate` to verify the provided permit. This ensures only authorized users (based on the permit's configuration) can access the data.  The permit likely grants access either to the owner of the invoices or specified auditors.
2.  **Data Retrieval:** If the permit is valid, it retrieves all invoices associated with the specified wallet from the contract's persistent storage.
3.  **Access Control:**  A check is performed to ensure either the wallet owner or the auditor listed in the invoice can retrieve the data.  Otherwise it returns an error.
4.  **Response:**  It returns a `InvoiceListResponse` containing the retrieved invoices.

## Data Structures

*   `State`: Struct storing the contract's state (count and owner address).
*   `Invoice`: Struct representing an invoice, including fields like invoice number, date, client name, amounts, hashes (document and line item), auditor, credibility score, and audit status.  This struct contains sensitive financial data that is protected by Secret Network's privacy features.
*   `CountResponse`: Struct used to return the counter value in response to `GetCount` queries.
*   `InvoiceListResponse`: Struct used to return the list of invoices in response to `GetAll` queries.


## Tests

The `tests` module includes unit tests for the contract's functionalities:

*   `get_invoice_all`: Tests the retrieval of invoices, including permission checks and data integrity. This test reads permit data from a JSON file (`PATH_PERMIT`), suggesting a method for creating and using permits in the Secret Network client.
*   `proper_initialization`: Checks the contract's initialization process.
*   `increment`: Tests the increment functionality.
*   `reset`: Tests the reset functionality and access control.
*   `add_invoice`: Tests adding invoices and access control.
*   `update_auditor`: Tests updating the auditor for an invoice and ensures that only the contract owner can make this update.


This contract demonstrates a secure way to manage sensitive invoice data on the Secret Network by leveraging its built-in privacy features and permissioning mechanisms.  The use of permits ensures that only authorized users can access sensitive data. The tests thoroughly validate the functionality and security aspects of the contract.

