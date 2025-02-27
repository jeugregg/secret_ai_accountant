/// This module contains message definitions for a secret pass manager contract.
///
/// It includes messages for instantiation, execution, and querying of the contract.
use cosmwasm_std::Addr;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use secret_toolkit::permit::Permit;
use crate::state::Invoice;

/// Instantiate message for the secret pass manager contract.
///
/// This message is used to initialize the contract with a starting count.
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub count: i32,
}

/// Execute messages for the secret pass manager contract.
///
/// These messages are used to interact with and modify the state of the contract.
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    /// Increment the count by 1.
    Increment {},
    /// Reset the count to a specified value.
    Reset { count: i32 },
    /// Add a new invoice to the contract.
    Add { invoice: Invoice },
    /// Update the auditor for a specific invoice.
    /// 
    /// # Arguments
    /// * `invoice_index` - The index of the invoice to update.
    /// * `auditor` - The new auditor address.
    UpdateAuditor { invoice_index: u8, auditor: Addr },
}

/// Query messages for the secret pass manager contract.
///
/// These messages are used to retrieve data from the contract.

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // GetCount returns the current count as a json-encoded number
    GetCount {},
    /// Retrieve all invoices associated with a given wallet address.
    GetAll {
        /// The wallet address to retrieve invoices for
        wallet: Addr,
         /// A permit to authenticate the query request.
        permit: Permit,
        /// An index to paginate through the results.
        index: u8,
    },
}

/// Response for the `GetCount` query message.
///
/// This response contains the current count value.
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct CountResponse {
    pub count: i32,
}

/// Response for the `GetAll` query message.
///
/// This response contains a vector of invoices associated with a wallet address.
#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
pub struct InvoiceListResponse {
    pub vect_invoice: Vec<Invoice>,
}
