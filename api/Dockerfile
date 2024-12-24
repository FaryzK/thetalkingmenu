# Use Node.js LTS as the base image
FROM node:20

# Set the working directory to `/usr/src/app`
WORKDIR /usr/src/app

# Copy root-level `package.json` and `package-lock.json`
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all files in the `./api` folder to `/usr/src/app/api`
COPY ./api ./api

# Copy `firebase.js` to `/usr/src/app`
COPY firebase.js .

# Expose the backend port
EXPOSE 3000

# Start the backend in production mode
CMD ["npm", "start"]
