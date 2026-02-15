//  simplified role hierarchy for demonstration purposes

const simpleRoleHierarchy = {
  superAdmin: ["admin", "manager", "proof_reader", "editor", "user"],
  admin: ["manager", "proof-reader", "editor", "user"],
  manager: ["proof-reader", "editor", "sales_manager", "user"],
  sales_manager: ["user"],
  proof_reader: ["user"],
  editor: ["user"],
  premium_user: ["user"],
  user: [],
};

const myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6];

// Create a Set from the array to remove duplicates
const mySet = new Set(myArray);

// Convert the Set back to an array
const uniqueArray = Array.from(mySet);
