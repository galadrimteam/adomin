---
weight: 1
title: 'Bitset field'
---

# Bitset field

{{< br >}}

In the table page, a bitset number field will look like this

![field image](/adomin/images/models/table_bitset.png)

In the create / edit page

![edit field image](/adomin/images/models/bitset.png)

## Config

Inside the number field config, you must pass the bitset config like this

```ts
{
  type: 'number',
  // ...
  variant: {
    type: 'bitset',
    bitsetValues: {},
    bitsetLabels: {},
  }
}
```

### bitsetValues

Values for the bitset

```ts
{ [K in string]: number }
```

e.g.

```ts
{ 'DEFAULT': 0b0, 'ROLE1': 0b1, 'ROLE2': 0b10, 'ROLE3': 0b100 }
```

With each number value representing a specific bit.

With the example config:

- ROLE1 represents the first bit of the number (the least significant bit 0b1)
- ROLE2 the 2nd bit (the 2nd least significant bit 0b01)
- ROLE3 the 3rd bit (the 3rd least significant bit 0b001)

So if the model column value is the integer 3 (0b011)

the model instance will have ROLE1 and ROLE2, but not ROLE3

### bitsetLabels

Optionnal, labels for the bitset

```ts
{ [K in string]: string }
```

e.g.

```ts
{ 'DEFAULT': 'Utilisateur', 'ROLE1': 'Role 1', 'ROLE2': 'Role 2', 'ROLE3': 'Role 3' }
```
