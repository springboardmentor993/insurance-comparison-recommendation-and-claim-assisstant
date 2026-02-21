const generatePolicies = (category) => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `${category}-${i}`,
    company: ["TATA AIA", "HDFC Life", "ICICI Prudential", "Max Life"][i % 4],
    name: `${category} Plan ${i + 1}`,
    cover: "₹50 Lac",
    age: "43 Yrs",
    claim: `${98 + (i % 2)}.${i % 9}%`,
    price: `₹${299 + i * 10}/month`,
  }));
};

const policies = {
  "Term Life Insurance": generatePolicies("Term Life"),
  "Health Insurance": generatePolicies("Health"),
  "Car Insurance": generatePolicies("Car"),
  "Travel Insurance": generatePolicies("Travel"),
  "Investment Plans": generatePolicies("Investment"),
  "Home Insurance": generatePolicies("Home"),
  "Bike Insurance": generatePolicies("Bike"),
  "Women Insurance": generatePolicies("Women"),
};

export default policies;
