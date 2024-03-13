# HuTu Recipes - Chinese Recipe Assistant

Welcome to HuTu Recipes, the ultimate cooking companion for stressed-out moms looking to whip up delicious Chinese cuisine. Utilizing the power of OpenAI APIs, the flexibility of ExpressJS, and the interactivity of React, HuTu Recipes brings personalized, AI-curated Chinese recipes right to your kitchen.

## Features

- **AI-Powered Recipe Curation:** Receive custom recipe recommendations based on what you have in your fridge with the help of OpenAI's sophisticated AI.
- **Step-by-Step Instructional Guides:** Follow along with detailed, foolproof cooking instructions that make gourmet Chinese cooking a breeze.
- **Automated Grocery Lists:** Generate shopping lists automatically from your recipe selections to save time and make grocery shopping hassle-free.
- **Adaptive User Experience:** Enjoy a seamless and responsive design across your devices, ensuring you can access delicious recipes whether you're at home or on the go.

## Getting Started

Dive into HuTu Recipes with these easy setup steps.

### Prerequisites

- Node.js (latest LTS version recommended)
- pnpm as your package manager
- An OpenAI API Key (get yours by signing up at https://openai.com/api/)

### Installation

Start by cloning the repository and installing the necessary dependencies:

```bash
git clone https://github.com/jh242/hutu-recipes.git
cd huturecipes
```

Install dependencies for the server and client:

```bash
# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd ../client
pnpm install
```

### Configuration

Set your environment variables for both the server and the client. Create a `.env` file within the server directory and input your OpenAI API Key:

```plaintext
OPENAI_API_KEY=your_openai_api_key
```

### Running the App

Launch the server:

```bash
cd server
pnpm start
```

Start the client:

```bash
cd client
pnpm start
```

The client side will be available at http://localhost:3000, while the server will run on http://localhost:5000.

## Using HuTu Recipes

Browsing HuTu Recipes is easy. Choose from an array of handpicked Chinese dishes, opt for one that resonates with your current cravings, and let HuTu Recipes guide you through the preparation steps. Ask the AI for recipe suggestions, and it will tailor recommendations to both your flavor preferences and pantry inventory.

## Contributing

Your contributions are always welcome! If you've got an enhancement idea, a new feature suggestion, or bug fixes in mind, don't hesitate to fork the repo, apply your changes, and send us a pull request.

## Support

Need assistance or have a query? Drop your questions by opening an issue in the GitHub repository's issue tracker.

## License

HuTu Recipes is open-source software licensed under the MIT License - for more details, see the LICENSE.md file.

Happy Cooking! 🍳🥢
