use crate::*;

#[near_bindgen]
impl Contract {
    
    pub fn nft_supply_for_owner(
        &self,
        account_id: AccountId,
    ) -> U64 {
        let tokens_owner = self.tokens_per_owner.get(&account_id);
        if let Some(tokens_owner) = tokens_owner {
            U64(tokens_owner.len())
        } else {
            U64(0)
        }
    }

    pub fn nft_tokens(
        &self,
        from_index: U64,
        limit: U64,
    ) -> Vec<JsonToken> {
        let mut tmp = vec![];
        let keys = self.token_metadata_by_id.keys_as_vector();
        let start = u64::from(from_index);
        let end = min(start + u64::from(limit), keys.len());
        for i in start..end {
            tmp.push(self.nft_token(keys.get(i).unwrap()).unwrap());
        }
        tmp
    }

    pub fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: U64,
        limit: U64,
    ) -> Vec<JsonToken> {
        let mut tmp = vec![];
        let tokens_owner = self.tokens_per_owner.get(&account_id);
        let tokens = if let Some(tokens_owner) = tokens_owner {
            tokens_owner
        } else {
            return vec![];
        };
        let keys = tokens.as_vector();
        let start = u64::from(from_index);
        let end = min(start + u64::from(limit), keys.len());
        for i in start..end {
            tmp.push(self.nft_token(keys.get(i).unwrap()).unwrap());
        }
        tmp
    }
}