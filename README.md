## New!!
### Now you can visualize our REST API.
### After running the server go to http://localhost:3001/doc
### To update the REST API run ``npm run swagger-autogen``
#
## How to run the app:
### Run the server:
- ``cd server``
- ``npm install``
- ``npm start``
### Run the client:
- ``cd client``
- ``npm install``
- ``npm start``

## Default users 
### Hiker
- email: hiker@email.com
- password: password
### Local Guide
- email: localguide@email.com
- password:password

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
- ``cd server``
- ``node server/scripts/populateDB.js``

### How to test the application
- ``cd server``
- ``npm test`` 

### How to run coverage
- ``cd server``
- ``npm run coverage`` 

### MongoDB
- you should have running a mongo database (the service: MongoDB server, must be running)<br/>
- if you want to use a docker container: <br />
``docker container run -p 27017:27017 mongo``
