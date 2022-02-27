# Books_WebApp

This WebApp comes with all the functionality(CRUD) for books but only Admin is provided access to the (Create, Update and Delete option).

<h1>Init the Web App</h1>
<ol>
  <li>Clone the repo to your PC by using command "git clone https://github.com/VirajAgarwal1/Books_WebApp.git".</li>
  <li>Then cd into the folder using "cd Books_WebApp/" command. </li>
  <li>Then intialize the npm by typing "npm init -y". </li>
  <li>Then download required node_modules using "npm i"  </li>
  <li>Then make a directory name "cert" with "mkdir cert" command. </li>
  <li>Then cd into the directory using "cd cert"  and then generate the required key and certificate using this command <br /> "openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes -subj '/CN=localhost'  "</li>
  <li>Then go back to parent directory using "cd .." and then make the Environment variables using <br />
    "echo "PORT=5000 <br />
ADMIN_NAME=user <br />
ADMIN_PASS=123456" > .env"</li>
  <li>Now open a new Terminal Windown and start the MongoDB on port 27017(default port) using "mongod" command. </li>
  <li>Now just run the webapp using "node server.js" in the original directory where project folder is.</li>
</ol>

<h1>Testing the WebApp</h1>
To test the WebApp a UI is provided where one can test all the functionalities of the application... Now to act as admin in the Webapp one will need to put in the Username and Password for it, which are as follows :- 
<h4>
Admin_Username = "user" <br />
Admin_Password = "123456"
</h4>
