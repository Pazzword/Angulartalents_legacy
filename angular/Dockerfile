# Use the official Node.js image
FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the app source code
COPY . .

# Expose port 4200
EXPOSE 4200

# Set environment variable to enable polling (if needed)
ENV CHOKIDAR_USEPOLLING=true

# Run the Angular app
CMD ["npm", "run", "start"]
