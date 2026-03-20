import type { Transaction } from "../data-type"
import { v4 as uuidv4 } from "uuid"

export const dummyTransactions: Transaction[] = [
    {
        id: uuidv4(),
        name: "Whole Foods Market",
        description: "Weekly groceries",
        amount: -156.43,
        date: "2024-03-15",
        labelIds: ["1"], // Groceries
    },
    {
        id: uuidv4(),
        name: "Uber Ride",
        description: "Ride to airport",
        amount: -45.20,
        date: "2024-03-14",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Netflix Subscription",
        amount: -15.99,
        date: "2024-03-14",
        labelIds: ["4", "7"], // Entertainment, Bills
    },
    {
        id: uuidv4(),
        name: "Salary Deposit",
        description: "March Salary",
        amount: 4500.00,
        date: "2024-03-13",
        labelIds: [],
    },
    {
        id: uuidv4(),
        name: "Starbucks",
        description: "Morning coffee",
        amount: -5.75,
        date: "2024-03-13",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Amazon Purchase",
        description: "New headphones",
        amount: -89.99,
        date: "2024-03-12",
        labelIds: ["6"], // Shopping
    },
    {
        id: uuidv4(),
        name: "Gym Membership",
        amount: -50.00,
        date: "2024-03-12",
        labelIds: ["5", "7"], // Health, Bills
    },
    {
        id: uuidv4(),
        name: "Shell Station",
        description: "Gas refill",
        amount: -42.15,
        date: "2024-03-11",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Spotify",
        amount: -9.99,
        date: "2024-03-11",
        labelIds: ["4", "7"], // Entertainment, Bills
    },
    {
        id: uuidv4(),
        name: "Trader Joe's",
        description: "Snacks and drinks",
        amount: -34.50,
        date: "2024-03-10",
        labelIds: ["1"], // Groceries
    },
    {
        id: uuidv4(),
        name: "CVS Pharmacy",
        description: "Vitamins",
        amount: -22.40,
        date: "2024-03-10",
        labelIds: ["5"], // Health
    },
    {
        id: uuidv4(),
        name: "Apple Store",
        description: "iCloud storage",
        amount: -2.99,
        date: "2024-03-09",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Local Cafe",
        description: "Lunch with friend",
        amount: -28.60,
        date: "2024-03-09",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Target",
        description: "Household items",
        amount: -65.30,
        date: "2024-03-08",
        labelIds: ["6"], // Shopping
    },
    {
        id: uuidv4(),
        name: "Electric Bill",
        description: "February usage",
        amount: -120.45,
        date: "2024-03-08",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Freelance Payment",
        description: "Project X",
        amount: 850.00,
        date: "2024-03-07",
        labelIds: [],
    },
    {
        id: uuidv4(),
        name: "Cinema City",
        description: "Movie night",
        amount: -32.00,
        date: "2024-03-07",
        labelIds: ["4"], // Entertainment
    },
    {
        id: uuidv4(),
        name: "Burger King",
        amount: -12.50,
        date: "2024-03-06",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Water Bill",
        amount: -45.00,
        date: "2024-03-06",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "H&M",
        description: "Clothes",
        amount: -75.90,
        date: "2024-03-05",
        labelIds: ["6"], // Shopping
    },
    {
        id: uuidv4(),
        name: "Pharmacy",
        description: "Medicine",
        amount: -15.20,
        date: "2024-03-05",
        labelIds: ["5"], // Health
    },
    {
        id: uuidv4(),
        name: "Uber Eats",
        description: "Dinner delivery",
        amount: -38.40,
        date: "2024-03-04",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Internet Bill",
        amount: -60.00,
        date: "2024-03-04",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Gas Station",
        amount: -38.00,
        date: "2024-03-03",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Bookstore",
        description: "New novel",
        amount: -24.99,
        date: "2024-03-03",
        labelIds: ["4", "6"], // Entertainment, Shopping
    },
    {
        id: uuidv4(),
        name: "Dentist",
        description: "Checkup",
        amount: -150.00,
        date: "2024-03-02",
        labelIds: ["5"], // Health
    },
    {
        id: uuidv4(),
        name: "Coffee Shop",
        amount: -4.50,
        date: "2024-03-02",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Rent Payment",
        description: "March Rent",
        amount: -1200.00,
        date: "2024-03-01",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Bakery",
        description: "Bread and pastries",
        amount: -18.50,
        date: "2024-03-01",
        labelIds: ["1"], // Groceries
    },
    {
        id: uuidv4(),
        name: "Taxi",
        amount: -22.00,
        date: "2024-02-29",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Concert Tickets",
        description: "Rock band",
        amount: -120.00,
        date: "2024-02-29",
        labelIds: ["4"], // Entertainment
    },
    {
        id: uuidv4(),
        name: "Pizza Place",
        amount: -25.00,
        date: "2024-02-28",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Phone Bill",
        amount: -45.00,
        date: "2024-02-28",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Nike Store",
        description: "Running shoes",
        amount: -110.00,
        date: "2024-02-27",
        labelIds: ["6", "5"], // Shopping, Health
    },
    {
        id: uuidv4(),
        name: "Grocery Store",
        amount: -85.40,
        date: "2024-02-27",
        labelIds: ["1"], // Groceries
    },
    {
        id: uuidv4(),
        name: "Train Ticket",
        description: "Trip to city",
        amount: -15.00,
        date: "2024-02-26",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Museum Entry",
        amount: -20.00,
        date: "2024-02-26",
        labelIds: ["4"], // Entertainment
    },
    {
        id: uuidv4(),
        name: "Sushi Bar",
        description: "Dinner",
        amount: -55.00,
        date: "2024-02-25",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Pharmacy",
        amount: -12.99,
        date: "2024-02-25",
        labelIds: ["5"], // Health
    },
    {
        id: uuidv4(),
        name: "Gift Shop",
        description: "Birthday gift",
        amount: -40.00,
        date: "2024-02-24",
        labelIds: ["6"], // Shopping
    },
    {
        id: uuidv4(),
        name: "Parking Fee",
        amount: -8.00,
        date: "2024-02-24",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Streaming Service",
        amount: -12.99,
        date: "2024-02-23",
        labelIds: ["4", "7"], // Entertainment, Bills
    },
    {
        id: uuidv4(),
        name: "Italian Restaurant",
        amount: -70.00,
        date: "2024-02-23",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Hardware Store",
        description: "Light bulbs",
        amount: -15.50,
        date: "2024-02-22",
        labelIds: ["6"], // Shopping
    },
    {
        id: uuidv4(),
        name: "Bus Ticket",
        amount: -2.50,
        date: "2024-02-22",
        labelIds: ["3"], // Transport
    },
    {
        id: uuidv4(),
        name: "Coffee",
        amount: -4.00,
        date: "2024-02-21",
        labelIds: ["2"], // Restaurant
    },
    {
        id: uuidv4(),
        name: "Supermarket",
        amount: -92.15,
        date: "2024-02-21",
        labelIds: ["1"], // Groceries
    },
    {
        id: uuidv4(),
        name: "Insurance",
        description: "Car insurance",
        amount: -85.00,
        date: "2024-02-20",
        labelIds: ["7"], // Bills
    },
    {
        id: uuidv4(),
        name: "Bonus",
        description: "Performance bonus",
        amount: 200.00,
        date: "2024-02-20",
        labelIds: [],
    },
    {
        id: uuidv4(),
        name: "Ice Cream",
        amount: -6.50,
        date: "2024-02-19",
        labelIds: ["2"], // Restaurant
    },
]
