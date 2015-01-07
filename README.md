# Stack Exchange Chat Client
The idea is to create a chat client that supports:
 - Authentication
 - Reading messages
 - Posting messages
 
## Authentication

Authentication is done with a POST request to /login, with a username and a password. If not done locally, it is
advised that you use HTTPS to prevent credentials leak.

The server will reply with a WebSocket URL for you to connect to (or an error code).

## Reading and Posting
Reading and posting are both done via the WebSocket you connect to.