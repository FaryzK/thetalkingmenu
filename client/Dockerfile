# Use Node.js LTS as the base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app/client

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the frontend for production
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

RUN echo "Building with VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY"
RUN VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY npm run build

# Use Nginx to serve the frontend
FROM nginx:alpine

# Copy the built files to Nginx's default public folder
COPY --from=0 /usr/src/app/client/dist /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
