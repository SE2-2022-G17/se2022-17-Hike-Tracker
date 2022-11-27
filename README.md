## How to run the app:
### Run the server:
- cd server
- npm install
- npm start
### Run the client:
- cd client
- npm install
- npm start

## Default users 
### Hiker
- hiker@email.com
- password
### Local Guide
- localguide@email.com
- password

## Authentication and Authorization
### Client:
- After a successful login the jwt is stored in localStorage
- If you want to get the jwt: ``localStorage.getItem('token')``
- The jwt must be inserted in the Authentication header of the HTTP request
- Example: in an authenticated POST request, set the Authentication header to 'Bearer <your_jwt>'

### Server:
- in server.js is present a dummy example to show how to protect an endpoint
- the endpoint is called '/example/protected'

### Populate the DB
- run node server/scripts/populateDB.js

### How to test the application
- cd server
- npm test tests/<name_of_test_file> 

### MongoDB
- you should have running a mongo database (the service: MongoDB server, must be running)<br/>
- if you want to use a docker container: <br />
``docker container run -p 27017:27017 mongo``
