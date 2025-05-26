# Use official Node.js image
FROM node:23-alpine

# Copy package.json and install dependencies
COPY package*.json ./
COPY prisma/* ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]