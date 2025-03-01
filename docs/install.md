# Installation Guide for Secret AI Accountant System

This guide will help you set up and run the Secret AI Accountant System project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js (v18 or later recommended):** You can download it from [https://nodejs.org/](https://nodejs.org/).
*   **npm (comes with Node.js) or yarn:** You can use either npm or yarn as your package manager.
*   **Git:** For cloning the repository. Get it from [https://git-scm.com/](https://git-scm.com/).
* **Rust and Cargo:** You'll need Rust's build tools to work with the smart contract aspect of the project. Install it via [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
* **cargo-generate:** For build the smart contract. Run this line : `cargo install cargo-generate --features vendored-openssl`

* **proxy-secret-ai:** For Secret AI API call : install this projet on a different folder : https://github.com/jeugregg/proxy_secret_ai 
## Installation Steps

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd secret_ai_accountant
    ```

    *   Replace `<repository_url>` with the actual URL of the project's Git repository (if applicable).
    
2. **Smart Contract Setup:**
    
    ```bash
    cd contract
    cargo check
    ```
    If you haven't a repo use this:
    ```bash
    cargo generate --git https://github.com/scrtlabs/secret-template.git --name YOUR_NAME_HERE
    ```
    * Replace "YOUR_NAME_HERE" with your smart contract name

- Set env : https://docs.scrt.network/secret-network-documentation/development/readme-1/setting-up-your-environment
- Compile  an hello work contract : https://docs.scrt.network/secret-network-documentation/development/readme-1/compile-and-deploy
    - `cargo generate --git https://github.com/SecretFoundation/secret-template.git --name my-counter-contract`
    - go to the folder
    - `cargo check` to update all deps
    - build the contract binary : `make build-mainnet-reproducible` **(ATTENTION à le mettre à jour d’apres la DOC sur le site de secret)**
        - make build dans le repertoire de cargo.toml
- Configure in testnet : https://docs.scrt.network/secret-network-documentation/infrastructure/secret-cli/configuration
    
    `secretcli config set client node [https://pulsar.rpc.secretnodes.com](https://pulsar.rpc.secretnodes.com/)`
    
    `secretcli config set client chain-id pulsar-3`
    
    `secretcli config set client output json`
    
    `secretcli config set client keyring-backend test`
    
- Create Wallet : https://docs.scrt.network/secret-network-documentation/development/readme-1/compile-and-deploy#creating-a-wallet
    - `secretcli keys add myWallet`
    
- Get faucet for testnet: https://faucet.pulsar.scrttestnet.com/
- Check balance : `secretcli query bank balances secret1hlk50xenk0rdlxzgth00ld09sp5jf2q0mlk05r`
- Store contract :  `secretcli tx compute store contract.wasm.gz --gas 5000000 --from myWallet --chain-id pulsar-3 --node [https://pulsar.rpc.secretnodes.com](https://pulsar.rpc.secretnodes.com/) --fees=70000uscrt`
   
- Retrieve code :
    - `secretcli query compute list-code`
    - difficult to find but normally at the end of the list
- Instanciate contract
    - `secretcli tx compute instantiate 13495 '{"count": 1}' --from secret1hlk50xenk0rdlxzgth00ld09sp5jf2q0mlk05r --label secret_ai_accountant_test_02 --chain-id pulsar-3 --node https://pulsar.rpc.secretnodes.com --fees=70000uscrt -y`
- check contract_address:
    - `secretcli query compute list-contract-by-code 13495 --chain-id pulsar-3 --node [https://pulsar.rpc.secretnodes.com](https://pulsar.rpc.secretnodes.com/)`
    - {"contract_infos":[{"contract_address":"secret1x5wrnj32awk35ezm42vxcet3vpjvz0qt8e3jhn","contract_info":{"code_id":"13481","creator":"secret1hlk50xenk0rdlxzgth00ld09sp5jf2q0mlk05r","label":"my-counter-test-dr","created":null,"ibc_port_id":"","admin":"","admin_proof":null}}]}
- Query message  with the contract :
    - `secretcli query compute query secret1sfuzh368gjmhv507kv546gy0dwhfu3q6fcfarl '{"get_count": {}}' --chain-id pulsar-3 --node [https://pulsar.rpc.secretnodes.com](https://pulsar.rpc.secretnodes.com/)`
    - {"count":1}
- Execute message
    - `secretcli tx compute execute secret1sfuzh368gjmhv507kv546gy0dwhfu3q6fcfarl '{"increment": {}}' --from secret1hlk50xenk0rdlxzgth00ld09sp5jf2q0mlk05r --chain-id pulsar-3 --node [https://pulsar.rpc.secretnodes.com](https://pulsar.rpc.secretnodes.com/) --fees=70000uscrt`
        - check
        - `secretcli query compute query secret1sfuzh368gjmhv507kv546gy0dwhfu3q6fcfarl '{"get_count": {}}'`

For more information on using the Secret Network blockchain and its features, refer to the official [Secret Network documentation](https://docs.secret.network/)  


3.  **Navigate to the Frontend Directory:**

    ```bash
    cd ../
    ```
4.  **Install Dependencies:**

    *   **Using npm:**

        ```bash
        npm install
        ```

    *   **Using yarn:**

        ```bash
        yarn install
        ```
        This command reads the `package.json` file and installs all the necessary dependencies listed there.

5. **Set up Environment Variables:**
  
    * Copy `.env.example` to `.env` at the root of the project (if available)
    * Edit the `.env` file and replace placeholders with actual values.
      
    ```.env
    VITE_APP_ONWER_MNEMONIC=your_owner_mnemonic
    VITE_APP_AUDITOR_MNEMONIC=your_auditor_mnemonic
    ```

6.  **Run the Development Server:**

    *   **Using npm:**

        ```bash
        npm run dev
        ```

    *   **Using yarn:**

        ```bash
        yarn dev
        ```
        This command starts the Vite development server, and it will usually open the application in your default web browser at `http://localhost:5173`.

## Additional Notes

*   **Tailwind CSS:** The project uses Tailwind CSS for styling. You can customize the styles by modifying the files in the `src` directory.
*   **Secret Network:** The application interacts with the Secret Network blockchain. Refer to the project's documentation or the `README.md` for detailed information about the blockchain interaction.
* **Smart contract:** You must have a secret network. In `config.ts` file you have the config.
* **OCR:** If you want to use the OCR functionnality, you have to create your own server. The `ocrService.ts` refer to it.
* **API:** You have to create your own API. The `apiInvoiceUrl` and `apiCredibilityUrl` refer to it in the `config.ts` file.

## Troubleshooting

*   **Dependency Issues:** If you encounter any issues with dependencies, try deleting the `node_modules` folder and the `package-lock.json` or `yarn.lock` file, and then run `npm install` or `yarn install` again.
*   **Port Conflicts:** If `http://localhost:5173` is already in use, the Vite server will automatically choose a different port. Check your terminal for the correct address.
*   **Smart Contract Issues:** If you encounter build errors during the smart contract setup, ensure you have Rust and Cargo installed properly and check the `Cargo.toml` file for any misconfigurations.
* **Env variable:** Verify that the env variable is correct.

## Contributing

If you'd like to contribute to the project, please fork the repository and submit a pull request with your changes.

