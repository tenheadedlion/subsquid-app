## Try it out

https://squid.subsquid.io/squid-acala/v/v1/graphql

run this:

```gql
{
  accounts {
    id
    transactions {
      id
      nonce
    }
  }
}
```