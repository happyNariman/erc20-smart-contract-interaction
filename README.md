# ERC20 Smart Contract Interaction

<strong>! Important: This repository is for educational purposes only:

- Always hide .env files and never share your private keys or sensitive information in public repositories.
- In the server controller, the private key is replaced with a test key. Don't do that in production.
  </strong>

## 1. Run node and deploy the contract

1.1. Go to the `hardhat` folder and run:

```bash
npm install
```

1.2 Run node in the `hardhat` folder:

```bash
npm run node
```

1.3. In another terminal, run:

```bash
npm run deploy
```

Great! Now you have a local node running and a ERC20 contract deployed. You can check the contract address in the console output.

## 2. Run the backend server

2.1. Go to the `server` folder and run:

```bash
npm install
```

2.2. Start the server:

```bash
npm run start
```

2.3. Open your browser and go to `http://localhost:3000/api`. You should see a Swagger UI with the API documentation.
The required data has already been substituted in the test parameters.
You can execute the API endpoints directly from the Swagger UI.
For example, you can execute the `/api/tokens/{chain}/{address}/erc20` endpoint to get information about the ERC20 token that you deployed in the previous step.

## 3. Transfer ERC20 token

3.1. Before running the `transfer` endpoint, you should run `approve` endpoint to approve the transfer of tokens to sender.

3.2. After that, you can run the `transfer` endpoint to transfer the tokens from the sender to the receiver.
