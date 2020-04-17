# Intro to MongoDB

## What is MongoDB

- NoSQL (non-relational database)
- MongoDB covers data that has a wide variety of relationships

## Terminology

- **Collection** = table
- **Document** = row
- **$lookup** = join
- **reference** = foreign key

## Documents

- MongoDB documents look a lot like JSON (actually called BSON for Binary JSON)
![BSON](images/bson.png)
- You can nest documents within each other (subdocuments)
  - data that is accessed together will be stored together
- Can store data in **arrays**
