# Using the node image gives us yarn for free
FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Copy dependency lists
COPY package.json ./
COPY yarn.lock ./

# Install app dependencies
RUN yarn install
RUN yarn global add forever

# Bundle app source
COPY . .

EXPOSE 3001

# Give the command that will actually be called when the image is started
CMD [ "node", "server" ]

## Important Note:
## https://medium.com/better-programming/persistent-databases-using-dockers-volumes-and-mongodb-9ac284c25b39
## I am going to use the docker image for MongoDB and mount the volume to the lightsail instance, so that data is protected
## in the event that the container gets restarted. The above link details some of the process that I used.
